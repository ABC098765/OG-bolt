import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, MapPin, ShoppingCart, LogOut, Bell } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { firestoreService } from '../services/firestoreService';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
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
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-green-600 text-white py-2 pt-[0px] pb-[0px]">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-sm">
          <div className="w-full text-center overflow-hidden relative">
            <div className="relative bg-green-600 py-3 px-6">
              {/* Shining effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shine rounded-lg"></div>
              
              {/* Content */}
              <div className="relative z-10 flex items-center justify-center">
                <span className="font-semibold text-lg tracking-wide animate-text-glow">
                  Fresh and best quality fruits delivered to your door
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Main navigation */}
      <nav className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center text-2xl font-bold text-green-600">
              <img 
                src="/logo-placeholder.png" 
                alt="Super Fruit Center Logo" 
                className="w-12 h-12 pt-[3px] pb-[3px] mt-[0px] mb-[0px] ml-[6px] mr-[6px] pl-[0px] pr-[0px]"
                onError={(e) => {
                  // Fallback to text if logo not found
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling.style.display = 'inline';
                }}
              />
              <span style={{ display: 'none' }}>🍎</span>
              Super Fruit Center
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`transition-colors font-medium ${
                isActive('/') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className={`transition-colors font-medium ${
                isActive('/products') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Products
            </Link>
            <Link 
              to="/cart" 
              className={`transition-colors font-medium ${
                isActive('/cart') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              } flex items-center`}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Cart ({state.items.reduce((sum, item) => sum + item.quantity, 0)})
            </Link>
            <Link 
              to="/orders" 
              className={`transition-colors font-medium ${
                isActive('/orders') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Orders
            </Link>
            <Link 
              to="/profile" 
              className={`transition-colors font-medium ${
                isActive('/profile') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Profile
            </Link>
            <Link 
              to="/notifications" 
              className={`transition-colors font-medium ${
                isActive('/notifications') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              } relative`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
            {authState.isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium">
                  Hi, {authState.user?.name}
                </span>
              </div>
            ) : (
              <button 
                onClick={() => authDispatch({ type: 'SHOW_AUTH_MODAL' })}
                className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors font-medium"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t">
            <div className="flex flex-col space-y-4 pt-4">
              <Link 
                to="/" 
                className={`transition-colors font-medium ${
                  isActive('/') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                className={`transition-colors font-medium ${
                  isActive('/products') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                to="/cart" 
                className={`transition-colors font-medium ${
                  isActive('/cart') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
                } flex items-center`}
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Cart ({state.items.reduce((sum, item) => sum + item.quantity, 0)})
              </Link>
              <Link 
                to="/orders" 
                className={`transition-colors font-medium ${
                  isActive('/orders') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Orders
              </Link>
              <Link 
                to="/profile" 
                className={`transition-colors font-medium ${
                  isActive('/profile') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <Link 
                to="/notifications" 
                className={`transition-colors font-medium ${
                  isActive('/notifications') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
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
              {authState.isAuthenticated ? (
                <div className="space-y-4">
                  <span className="text-gray-700 font-medium">
                    Hi, {authState.user?.name}
                  </span>
                </div>
              ) : (
                <button 
                  onClick={() => authDispatch({ type: 'SHOW_AUTH_MODAL' })}
                  className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors font-medium w-fit"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;