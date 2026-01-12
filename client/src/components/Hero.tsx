import React, { memo, useEffect, useState } from 'react';
import { Link } from 'wouter';
import { ShoppingCart, Heart, Award, Clock, Leaf, LogIn, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Hero = memo(() => {
  const { state: authState, dispatch: authDispatch } = useAuth();
  // Accessibility: Respect user's motion preferences
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    // Use modern addEventListener (with fallback for older browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return (
    <section id="home" className="relative overflow-hidden pt-12 pb-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Brand and Auth - Top level in Hero */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <img src="/sfc-logo.png" alt="SFC Logo" className="h-6 w-auto" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-500">
              Super Fruit Center
            </span>
          </div>
          
          {!authState.isAuthenticated ? (
            <button 
              onClick={() => authDispatch({ type: 'SHOW_AUTH_MODAL' })}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all flex items-center gap-2 group shadow-xl hover:shadow-2xl active:scale-95"
            >
              Sign In
              <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <Link to="/profile" className="flex items-center gap-2 bg-white/80 backdrop-blur-md border border-gray-200 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all group">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-xs text-white font-bold group-hover:scale-110 transition-transform">
                {authState.user?.name?.[0]}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {authState.user?.name}
              </span>
            </Link>
          )}
        </div>

        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="space-y-8 text-center max-w-4xl relative p-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
              <Award className="w-4 h-4 mr-2" />
              #1 Fresh Fruit Delivery Service
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
                Fresh <span className="text-green-600">
                  Fruits
                </span><br />
                Delivered <span className="text-orange-500">
                  Daily
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl mx-auto">
                Experience the finest selection of farm-fresh fruits at Super Fruit Center. 
                From exotic imports to local favorites, we bring nature's sweetness directly to your doorstep with premium quality and same-day delivery.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">100% Fresh</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Same Day</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Premium Quality</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/products"
                className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-full hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 font-semibold text-lg flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative z-10 flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Shop Now
                </div>
              </Link>
              <Link 
                to="/juice-recipes"
                className="group relative overflow-hidden border-2 border-orange-500 text-orange-500 px-8 py-4 rounded-full hover:bg-orange-500 hover:text-white transition-all transform hover:scale-105 font-semibold text-lg flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative z-10 flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Juice Recipes
                </div>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
});

export default Hero;