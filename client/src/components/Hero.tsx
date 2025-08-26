import React from 'react';
import { Link } from 'wouter';
import { ShoppingCart, Truck, Star, Heart, Award, Clock } from 'lucide-react';
import OrangeBurstAnimation from './OrangeBurstAnimation';

const Hero = () => {
  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20">

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
              <Award className="w-4 h-4 mr-2" />
              #1 Fresh Fruit Delivery Service
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
                Fresh <span className="text-green-600 underline-animated">
                  Fruits
                </span><br />
                Delivered <span className="text-orange-500 underline-gradient">
                  Daily
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
                Experience the finest selection of farm-fresh fruits at Super Fruit Center. 
                From exotic imports to local favorites, we bring nature's sweetness directly to your doorstep.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2 feature-badge feature-badge-1">
                  <Heart className="w-6 h-6 text-green-600 relative z-10" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">100% Fresh</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-2 feature-badge feature-badge-2">
                  <Clock className="w-6 h-6 text-orange-600 relative z-10" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Same Day</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2 feature-badge feature-badge-3">
                  <Star className="w-6 h-6 text-blue-600 relative z-10" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Premium Quality</p>
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
              <button className="group relative overflow-hidden border-2 border-orange-500 text-orange-500 px-8 py-4 rounded-full hover:bg-orange-500 hover:text-white transition-all transform hover:scale-105 font-semibold text-lg flex items-center justify-center shadow-lg hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative z-10 flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Free Delivery*
                </div>
              </button>
            </div>

          </div>

          <div className="relative flex justify-center items-center">
            <div className="relative z-10 group">
              {/* 3D Orange Burst Animation */}
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl p-4 transform group-hover:scale-105 transition-transform duration-500">
                <OrangeBurstAnimation className="mx-auto" />
                <div className="text-center mt-4">
                  <p className="text-orange-600 dark:text-orange-400 font-semibold text-lg">🍊 Interactive 3D Orange!</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Click or wait for the burst animation</p>
                </div>
              </div>
              
              {/* Overlay badges */}
              <div className="absolute bottom-4 right-4 bg-green-600/90 backdrop-blur-sm text-white px-3 py-2 rounded-full shadow-lg">
                <div className="flex items-center text-sm font-medium">
                  <Truck className="w-4 h-4 mr-1" />
                  Fast Delivery
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-green-400 via-emerald-400 to-orange-400 rounded-2xl -z-10 opacity-80"></div>
            {/* Additional decorative elements */}
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-60 blur-xl"></div>
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-60 blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;