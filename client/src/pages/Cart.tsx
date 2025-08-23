import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Cart = () => {
  const { state, updateQuantity, removeItem } = useCart();
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  const { state: authState, dispatch: authDispatch } = useAuth();

  // Redirect to sign in if not authenticated
  React.useEffect(() => {
    if (!authState.isAuthenticated && authState.user === null) {
      authDispatch({ type: 'SHOW_AUTH_MODAL' });
    }
  }, [authState.isAuthenticated, authDispatch]);

  // Show loading or sign in prompt if not authenticated
  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sign in required</h2>
            <p className="text-xl text-gray-600 mb-8">
              Please sign in to view your cart and manage your orders.
            </p>
            <button 
              onClick={() => authDispatch({ type: 'SHOW_AUTH_MODAL' })}
              className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors font-semibold text-lg"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = state.total;
  const delivery = subtotal >= 1000 ? 0 : subtotal >= 500 ? 20 : 40;
  const total = subtotal + delivery;

  // Debug log to check cart state
  console.log('Cart state:', state);
  console.log('Cart items:', state.items);
  console.log('Subtotal from state.total:', subtotal);

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-xl text-gray-600 mb-8">
              Start shopping to add some delicious fresh fruits to your cart!
            </p>
            <button 
              onClick={() => navigate('/products')}
              className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors font-semibold text-lg"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Shopping <span className="text-green-600">Cart</span>
          </h1>
          <p className="text-xl text-gray-600">
            Review your items and proceed to checkout
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item) => (
              <div key={item.productId} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.imageUrls?.[0] || item.image || 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-gray-600">
                      {item.displayPrice || item.priceLabel || `₹${(item.priceValue || item.unitPrice || item.price || 0)}`}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    
                    <span className="text-lg font-semibold w-8 text-center">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      ₹{((item.priceValue || item.unitPrice || item.price || 0) * item.quantity) || 0}
                    </p>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-red-500 hover:text-red-700 transition-colors mt-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{subtotal}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-semibold">
                    {delivery === 0 ? 'FREE' : `₹${delivery}`}
                  </span>
                </div>
                
                {delivery > 0 && (
                  <p className="text-sm text-orange-600">
                    {subtotal < 500 
                      ? `Add ₹${500 - subtotal} more for ₹20 delivery!`
                      : subtotal < 1000
                        ? `Add ₹${1000 - subtotal} more for free delivery!`
                        : ''
                    }
                  </p>
                )}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-600">₹{total}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-full hover:bg-green-700 transition-colors font-semibold text-lg flex items-center justify-center"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>

              <button 
                onClick={() => navigate('/products')}
                className="w-full mt-3 border-2 border-green-600 text-green-600 py-3 px-6 rounded-full hover:bg-green-50 transition-colors font-semibold"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;