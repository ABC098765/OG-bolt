import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const Notification = () => {
  const { state, dispatch } = useCart();

  useEffect(() => {
    if (state.notification) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEAR_NOTIFICATION' });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [state.notification, dispatch]);

  if (!state.notification) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in">
      <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm">
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium">{state.notification}</span>
        <button
          onClick={() => dispatch({ type: 'CLEAR_NOTIFICATION' })}
          className="ml-2 hover:bg-green-700 rounded-full p-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Notification;