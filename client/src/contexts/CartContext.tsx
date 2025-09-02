import React, { createContext, useContext, useReducer, ReactNode, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { firestoreService } from '../services/firestoreService';

export interface CartItem {
  productId: string;
  name: string;
  unitPrice: number;
  amount: string;
  unit: string;
  imageUrls: string[];
  quantity: number;
  totalPrice: number;
  priceLabel?: string;
  priceValue?: number;
  displayPrice?: string;
  id?: string;
  price?: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  notification: string | null;
  loading: boolean;
}

type CartAction =
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: { name: string } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'CLEAR_NOTIFICATION' }
  | { type: 'SET_LOADING'; payload: boolean };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addToCart: (product: any) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_CART': {
      return {
        ...state,
        items: action.payload,
        total: action.payload.reduce((sum, item) => {
          const price = Number(item.priceValue) || Number(item.unitPrice) || Number(item.price) || 0;
          const qty = Number(item.quantity) || 0;
          const itemTotal = price > 0 && qty > 0 ? price * qty : 0;
          return sum + itemTotal;
        }, 0),
        loading: false
      };
    }

    case 'ADD_ITEM': {
      return {
        ...state,
        notification: `${action.payload.name} added to cart successfully!`
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.productId !== action.payload);
      return {
        ...state,
        items: newItems,
        total: newItems.reduce((sum, item) => {
          const price = Number(item.priceValue) || Number(item.unitPrice) || Number(item.price) || 0;
          const qty = Number(item.quantity) || 0;
          const itemTotal = price > 0 && qty > 0 ? price * qty : 0;
          return sum + itemTotal;
        }, 0)
      };
    }

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.productId === action.payload.productId
          ? {
              ...item,
              quantity: action.payload.quantity,
              amount: getDefaultAmountForQuantity(item.unit, action.payload.quantity),
              totalPrice: (Number(item.priceValue) || Number(item.unitPrice) || Number(item.price) || 0) * action.payload.quantity
            }
          : item
      );
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => {
          const price = Number(item.priceValue) || Number(item.unitPrice) || Number(item.price) || 0;
          const qty = Number(item.quantity) || 0;
          const itemTotal = price > 0 && qty > 0 ? price * qty : 0;
          return sum + itemTotal;
        }, 0)
      };
    }

    case 'CLEAR_NOTIFICATION':
      return { ...state, notification: null };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'CLEAR_CART':
      return { items: [], total: 0, notification: null, loading: false };

    default:
      return state;
  }
};

// Function to parse selected amount like "2kg" or "3pc" into quantity and unit
const parseSelectedAmount = (selectedAmount: string, fallbackUnit: string): { quantity: number; unit: string } => {
  if (!selectedAmount) {
    return { quantity: 1, unit: fallbackUnit };
  }
  
  // Match patterns like "2kg", "3pc", "1 box", "500g"
  const match = selectedAmount.match(/^(\d+(?:\.\d+)?)\s*(.+)$/);
  if (match) {
    const quantity = parseFloat(match[1]);
    const unit = match[2].trim();
    return { quantity, unit };
  }
  
  // If no number found, treat as quantity 1
  return { quantity: 1, unit: selectedAmount || fallbackUnit };
};

// Function to extract unit from price string (matching Android app logic)
const getUnitFromPrice = (priceString: string): { unit: string; amount: string } => {
  const price = priceString.toLowerCase();
  if (price.endsWith('/kg')) {
    return { unit: 'kg', amount: '1kg' };
  } else if (price.endsWith('/piece')) {
    return { unit: 'piece', amount: '1pc' };
  } else if (price.endsWith('/box')) {
    return { unit: 'box', amount: '1 box' };
  } else {
    // Default fallback based on common patterns
    if (price.includes('/kg') || price.includes('kg')) {
      return { unit: 'kg', amount: '1kg' };
    } else if (price.includes('/piece') || price.includes('piece')) {
      return { unit: 'piece', amount: '1pc' };
    } else if (price.includes('/box') || price.includes('box')) {
      return { unit: 'box', amount: '1 box' };
    }
  }
  // Final fallback
  return { unit: 'piece', amount: '1 pcs' };
};

const getDefaultAmount = (unit: string): string => {
  const normalizedUnit = unit?.toLowerCase() || 'piece';
  if (normalizedUnit.includes('kg') || normalizedUnit.includes('g')) return '1kg';
  if (normalizedUnit.includes('piece') || normalizedUnit.includes('pc')) return '1 pcs';
  if (normalizedUnit.includes('box')) return '1 box';
  return '1 pcs';
};

const getDefaultAmountForQuantity = (unit: string, quantity: number): string => {
  const normalizedUnit = unit?.toLowerCase() || 'piece';
  if (normalizedUnit.includes('kg') || normalizedUnit.includes('g')) return `${quantity}kg`;
  if (normalizedUnit.includes('piece') || normalizedUnit.includes('pc')) return `${quantity} pcs`;
  if (normalizedUnit.includes('box')) return `${quantity} box`;
  return `${quantity} pcs`;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    notification: null,
    loading: false
  });
  const { state: authState } = useAuth();

  React.useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    if (authState.user?.id) {
      try {
        console.log('🛒 Cart: Setting up real-time subscription for user:', authState.user.id);
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Set up real-time cart subscription for bidirectional sync
        unsubscribe = firestoreService.subscribeToUserCart(
          authState.user.id,
          (cartItems) => {
            console.log('🛒 Cart: Real-time update received:', cartItems.length, 'items');
            dispatch({ type: 'SET_CART', payload: cartItems });
          }
        );
      } catch (error) {
        console.error('🛒 Cart: Error setting up subscription:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else if (authState.loading === false && !authState.user) {
      // Only clear cart if user is definitely logged out (not during loading)
      console.log('🛒 Cart: User logged out, clearing cart');
      dispatch({ type: 'CLEAR_CART' });
    }

    // Cleanup subscription on unmount or when user changes
    return () => {
      if (unsubscribe) {
        console.log('🛒 Cart: Cleaning up subscription');
        unsubscribe();
      }
    };
  }, [authState.user?.id, authState.loading]);

  const addToCart = async (product: any) => {
    console.log('🔍 CartContext: product received:', product);
    console.log('🔍 CartContext: selectedAmount:', product.selectedAmount);
    
    if (!authState.user) return;

    try {
      
      const productPrice = (() => {
        // Try different price sources in order of preference
        const priceString = product.displayPrice || product.price || product.unitPriceDisplay || '';
        
        if (typeof priceString === 'number') {
          return priceString;
        }
        
        if (typeof priceString === 'string') {
          // Handle range prices like "₹80-₹250/kg" - extract the first (lower) price
          const rangeMatch = priceString.match(/₹?(\d+(?:\.\d+)?)\s*-\s*₹?(\d+(?:\.\d+)?)/);
          if (rangeMatch) {
            return Number(rangeMatch[1]); // Return the lower price from range
          }
          
          // Handle single prices like "₹25/kg" or "25"
          const singleMatch = priceString.match(/₹?(\d+(?:\.\d+)?)/);
          if (singleMatch) {
            return Number(singleMatch[1]);
          }
        }
        
        // Fallback - try to extract any number from the string
        const numericValue = String(priceString).replace(/[^\d.]/g, '');
        return numericValue ? Number(numericValue) : 0;
      })();

      // Prioritize the image parameter passed from Products page, then fallback to imageUrls
      const productImages = (() => {
        // If a specific image was extracted and passed, use it first
        if (product.image && !product.image.includes('placeholder')) {
          return [product.image];
        }
        // Otherwise use the original imageUrls array
        return product.imageUrls ||
               product.image_urls ||
               (product.image ? [product.image] : []) ||
               [
                 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=400'
               ];
      })();


      // Use selectedAmount if provided, otherwise extract from price string
      const priceString = product.displayPrice || product.price || '';
      const { unit: extractedUnit, amount: extractedAmount } = getUnitFromPrice(priceString);
      
      // Parse selectedAmount to get quantity and unit
      const selectedAmount = product.selectedAmount || extractedAmount;
      const { quantity: selectedQuantity, unit: selectedUnit } = parseSelectedAmount(selectedAmount, extractedUnit);
      
      console.log('🔍 CartContext: Final values:');
      console.log('- selectedAmount:', selectedAmount);
      console.log('- selectedQuantity:', selectedQuantity);
      console.log('- selectedUnit:', selectedUnit);
      console.log('- productPrice:', productPrice);
      console.log('- totalPrice:', productPrice * selectedQuantity);

      const cartItem = {
        productId: product.id.toString(),
        name: product.name,
        unitPrice: productPrice,
        priceValue: productPrice,
        displayPrice: product.displayPrice || product.price || `₹${productPrice}`, // Use displayPrice or fallback to product.price to maintain Android app sync
        priceLabel: product.displayPrice || product.price || `₹${productPrice}`, // Keep original displayPrice format like "₹150-₹400/kg"
        amount: selectedAmount, // Use selected amount like "2kg" instead of default "1kg"
        unit: selectedUnit, // Use unit from selected amount
        imageUrls: productImages,
        quantity: selectedQuantity, // Use quantity from selected amount (e.g., 2 from "2kg")
        totalPrice: productPrice * selectedQuantity // Calculate total based on selected quantity
      };


      await firestoreService.addToCart(authState.user.id, cartItem);
      
      // Real-time subscription will handle cart updates automatically
      dispatch({ type: 'ADD_ITEM', payload: { name: product.name } });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };


  const updateQuantity = async (productId: string, quantity: number) => {
    if (!authState.user) return;

    try {
      await firestoreService.updateCartItemQuantity(authState.user.id, productId, quantity);
      
      // Real-time subscription will handle cart updates automatically
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (productId: string) => {
    if (!authState.user) return;

    try {
      await firestoreService.removeFromCart(authState.user.id, productId);
      
      // Real-time subscription will handle cart updates automatically
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const clearCart = async () => {
    if (!authState.user) return;

    try {
      await firestoreService.clearUserCart(authState.user.id);
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Memoize callback functions to prevent unnecessary re-renders
  const memoizedAddToCart = useCallback(addToCart, [authState.user]);
  const memoizedUpdateQuantity = useCallback(updateQuantity, [authState.user]);
  const memoizedRemoveItem = useCallback(removeItem, [authState.user]);
  const memoizedClearCart = useCallback(clearCart, [authState.user]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    state, 
    dispatch, 
    addToCart: memoizedAddToCart, 
    updateQuantity: memoizedUpdateQuantity, 
    removeItem: memoizedRemoveItem, 
    clearCart: memoizedClearCart
  }), [state, dispatch, memoizedAddToCart, memoizedUpdateQuantity, memoizedRemoveItem, memoizedClearCart]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
