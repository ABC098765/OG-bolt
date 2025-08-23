import React, { createContext, useContext, useReducer, ReactNode } from 'react';
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
    const loadCart = async () => {
      if (authState.isAuthenticated && authState.user) {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          const cartItems = await firestoreService.getUserCart(authState.user.id);
          dispatch({ type: 'SET_CART', payload: cartItems });
        } catch (error) {
          console.error('Error loading cart:', error);
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'CLEAR_CART' });
      }
    };

    loadCart();
  }, [authState.isAuthenticated, authState.user]);

  const addToCart = async (product: any) => {
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

      const productImages =
        product.imageUrls ||
        product.image_urls ||
        (product.image ? [product.image] : []) ||
        [
          'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=400'
        ];

      // Debug log to see what we're receiving
      console.log('CartContext - Adding to cart:', {
        name: product.name,
        displayPrice: product.displayPrice,
        price: product.price,
        productPrice: productPrice,
        unit: product.unit
      });

      const cartItem = {
        productId: product.id.toString(),
        name: product.name,
        unitPrice: productPrice,
        priceValue: productPrice,
        displayPrice: product.displayPrice, // Preserve the original displayPrice for reference
        priceLabel: product.displayPrice || `₹${productPrice}`, // Keep original displayPrice format like "₹150-₹400/kg"
        amount: getDefaultAmount(product.unit),
        unit: product.unit || 'piece',
        imageUrls: productImages,
        quantity: 1,
        totalPrice: productPrice
      };


      await firestoreService.addToCart(authState.user.id, cartItem);

      const cartItems = await firestoreService.getUserCart(authState.user.id);
      dispatch({ type: 'SET_CART', payload: cartItems });
      dispatch({ type: 'ADD_ITEM', payload: { name: product.name } });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };


  const updateQuantity = async (productId: string, quantity: number) => {
    if (!authState.user) return;

    try {
      await firestoreService.updateCartItemQuantity(authState.user.id, productId, quantity);

      if (quantity <= 0) {
        dispatch({ type: 'REMOVE_ITEM', payload: productId });
      } else {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (productId: string) => {
    if (!authState.user) return;

    try {
      await firestoreService.removeFromCart(authState.user.id, productId);
      dispatch({ type: 'REMOVE_ITEM', payload: productId });
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

  return (
    <CartContext.Provider value={{ state, dispatch, addToCart, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
