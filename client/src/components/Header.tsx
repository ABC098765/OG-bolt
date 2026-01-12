import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, ShoppingCart, Bell, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../services/firestoreService';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [location, setLocation] = useLocation();
  const { state } = useCart();
  const { state: authState, dispatch: authDispatch } = useAuth();

  React.useEffect(() => {
    const loadUnreadCount = async () => {
      if (authState.user) {
        try {
          const notifications = await firestoreService.getUserNotifications(authState.user.id);
          const unreadNotifications = notifications.filter(notif => !notif.is_read);
          setUnreadCount(unreadNotifications.length);
        } catch (error) {
          console.error('Error loading unread notifications count:', error);
        }
      } else {
        setUnreadCount(0);
      }
    };
    loadUnreadCount();
  }, [authState.user]);

  const isActive = (path: string) => location === path;

  return (
    <>
      <header className="fixed top-20 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50">
        <nav className="bg-transparent border-none px-6 py-3">
          <div className="flex justify-center items-center gap-4">
            {/* Main Navigation - Focused and blurred items */}
            <div className="flex items-center gap-4">
              <Link to="/" className={`text-sm font-medium transition-all px-4 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-sm ${isActive('/') ? 'bg-green-600/20 text-green-600 border-green-600/30' : 'bg-white/10 text-gray-700 hover:bg-white/20'}`}>Home</Link>
              <Link to="/products" className={`text-sm font-medium transition-all px-4 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-sm ${isActive('/products') ? 'bg-green-600/20 text-green-600 border-green-600/30' : 'bg-white/10 text-gray-700 hover:bg-white/20'}`}>Products</Link>
              <Link to="/juice-recipes" className={`text-sm font-medium transition-all px-4 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-sm ${isActive('/juice-recipes') ? 'bg-green-600/20 text-green-600 border-green-600/30' : 'bg-white/10 text-gray-700 hover:bg-white/20'}`}>Juice Recipes</Link>
              <Link to="/orders" className={`text-sm font-medium transition-all px-4 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-sm ${isActive('/orders') ? 'bg-green-600/20 text-green-600 border-green-600/30' : 'bg-white/10 text-gray-700 hover:bg-white/20'}`}>Orders</Link>
            </div>

            <div className="flex items-center gap-3">
              {authState.isAuthenticated && (
                <Link to="/notifications" className={`relative p-2.5 transition-all rounded-full backdrop-blur-md border border-white/20 shadow-sm ${isActive('/notifications') ? 'bg-green-600/20 text-green-600 border-green-600/30' : 'bg-white/10 text-gray-700 hover:bg-white/20'}`}>
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              )}
              
              <Link to="/cart" className="relative p-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-gray-700 hover:bg-white/20 transition-all shadow-sm">
                <ShoppingCart className="w-5 h-5" />
                {state.items.length > 0 && (
                  <span className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
                    {state.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
