import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, Phone, MapPin, ShoppingCart, LogOut, Bell } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { firestoreService } from '../services/firestoreService';


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [location, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  const { state } = useCart();
  const { state: authState, dispatch: authDispatch } = useAuth();

  // Load unread notifications count
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

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <>
      {/* Elements outside the transparent header */}
      <div className="fixed top-0 left-0 right-0 z-[60] flex justify-between items-center px-8 py-2 pointer-events-none">
        <div className="flex items-center text-2xl font-bold text-green-600 dark:text-green-400 pointer-events-auto">
          <span className="ml-16">Super Fruit Center</span>
        </div>
        {!authState.isAuthenticated && (
          <button 
            onClick={() => authDispatch({ type: 'SHOW_AUTH_MODAL' })}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-full hover:from-orange-600 hover:to-orange-700 active:scale-95 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl whitespace-nowrap flex items-center justify-center min-w-max text-sm pointer-events-auto"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Sign In
            </span>
          </button>
        )}
      </div>

      <header className="bg-red-50/40 dark:bg-gray-800/90 backdrop-blur-md shadow-md fixed top-2 left-0 right-0 z-50 rounded-2xl mx-4">
      {/* Main navigation */}
      <nav className="max-w-7xl mx-auto px-4 py-2 pl-[8px] pr-[8px]">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center text-2xl font-bold text-green-600 dark:text-green-400">
              <img src="/sfc-logo.png" alt="SFC Logo" className="h-12 w-auto mr-3" />
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`transition-colors font-medium ${
                isActive('/') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className={`transition-colors font-medium ${
                isActive('/products') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
              }`}
            >
              Products
            </Link>
            <Link 
              to="/juice-recipes" 
              className={`transition-colors font-medium ${
                isActive('/juice-recipes') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
              }`}
            >
              Juice Recipes
            </Link>
            <Link 
              to="/cart" 
              className={`transition-colors font-medium ${
                isActive('/cart') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
              } flex items-center`}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Cart ({state.items.reduce((sum, item) => sum + item.quantity, 0)})
            </Link>
            <Link 
              to="/orders" 
              className={`transition-colors font-medium ${
                isActive('/orders') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
              }`}
            >
              Orders
            </Link>
            <Link 
              to="/profile" 
              className={`transition-colors font-medium ${
                isActive('/profile') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
              }`}
            >
              Profile
            </Link>
            <Link 
              to="/notifications" 
              className={`transition-colors font-medium ${
                isActive('/notifications') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
              } relative`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
            {authState.isAuthenticated && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Hi, {authState.user?.name}
                </span>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700 dark:text-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-4 pt-4">
              <Link 
                to="/" 
                className={`transition-colors font-medium ${
                  isActive('/') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                className={`transition-colors font-medium ${
                  isActive('/products') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                to="/juice-recipes" 
                className={`transition-colors font-medium ${
                  isActive('/juice-recipes') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
                } flex items-center`}
                onClick={() => setIsMenuOpen(false)}
              >
                🥤 Juice Recipes
              </Link>
              <Link 
                to="/cart" 
                className={`transition-colors font-medium ${
                  isActive('/cart') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
                } flex items-center`}
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Cart ({state.items.reduce((sum, item) => sum + item.quantity, 0)})
              </Link>
              <Link 
                to="/orders" 
                className={`transition-colors font-medium ${
                  isActive('/orders') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Orders
              </Link>
              <Link 
                to="/profile" 
                className={`transition-colors font-medium ${
                  isActive('/profile') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <Link 
                to="/notifications" 
                className={`transition-colors font-medium ${
                  isActive('/notifications') ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
                } relative flex items-center`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
              {authState.isAuthenticated && (
                <div className="space-y-4">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Hi, {authState.user?.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;