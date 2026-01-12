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
    <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50">
      <nav className="bg-transparent border-none px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <img src="/sfc-logo.png" alt="SFC Logo" className="h-10 w-auto" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-500 hidden sm:block">
              Super Fruit Center
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-4">
            <Link to="/" className={`text-sm font-medium transition-all px-4 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-sm ${isActive('/') ? 'bg-green-600/20 text-green-600 border-green-600/30' : 'bg-white/10 text-gray-700 hover:bg-white/20'}`}>Home</Link>
            <Link to="/products" className={`text-sm font-medium transition-all px-4 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-sm ${isActive('/products') ? 'bg-green-600/20 text-green-600 border-green-600/30' : 'bg-white/10 text-gray-700 hover:bg-white/20'}`}>Products</Link>
            <Link to="/juice-recipes" className={`text-sm font-medium transition-all px-4 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-sm ${isActive('/juice-recipes') ? 'bg-green-600/20 text-green-600 border-green-600/30' : 'bg-white/10 text-gray-700 hover:bg-white/20'}`}>Juice Recipes</Link>
            <Link to="/orders" className={`text-sm font-medium transition-all px-4 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-sm ${isActive('/orders') ? 'bg-green-600/20 text-green-600 border-green-600/30' : 'bg-white/10 text-gray-700 hover:bg-white/20'}`}>Orders</Link>
          </div>

          {/* Actions */}
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
            
            {!authState.isAuthenticated ? (
              <button 
                onClick={() => authDispatch({ type: 'SHOW_AUTH_MODAL' })}
                className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all flex items-center gap-2 group"
              >
                Sign In
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <Link to="/profile" className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                  {authState.user?.name?.[0]}
                </div>
                <span className="text-sm font-medium text-green-700 hidden sm:block">
                  {authState.user?.name}
                </span>
              </Link>
            )}

            <button className="lg:hidden p-2 text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 py-4 border-t border-gray-100 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col gap-4">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-gray-600">Home</Link>
              <Link to="/products" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-gray-600">Products</Link>
              <Link to="/juice-recipes" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-gray-600">Juice Recipes</Link>
              <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-gray-600">Orders</Link>
              {authState.isAuthenticated && (
                <Link to="/notifications" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
