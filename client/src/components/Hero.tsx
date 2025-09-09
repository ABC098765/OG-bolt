import React, { memo } from 'react';
import { Link } from 'wouter';
import { ShoppingCart, Truck, Star, Heart, Award, Clock, Leaf } from 'lucide-react';

const Hero = memo(() => {
  return (
    <section id="home" className="relative overflow-hidden py-20" style={{
      backgroundImage: 'url(/Fresh_fruit_hero_display_11baa93f.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex justify-center items-center min-h-[80vh]">
          <div className="space-y-8 text-center max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
              <Award className="w-4 h-4 mr-2" />
              #1 Fresh Fruit Delivery Service
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
                <span className="text-lg sm:text-xl lg:text-2xl font-medium text-gray-600 dark:text-gray-400 block mb-2">Super Fruit Center</span>
                Fresh <span className="text-green-600 text-glow-green">
                  Fruits
                </span><br />
                Delivered <span className="text-orange-500 text-gradient-orange">
                  Daily
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl font-bold">
                Experience the finest selection of farm-fresh fruits at Super Fruit Center. 
                From exotic imports to local favorites, we bring nature's sweetness directly to your doorstep with premium quality and same-day delivery.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2 feature-badge feature-badge-1 badge-3d-green">
                  <Leaf className="w-6 h-6 text-green-600 relative z-10" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">100% Fresh</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-2 feature-badge feature-badge-2 badge-3d-orange">
                  <Clock className="w-6 h-6 text-orange-600 relative z-10" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Same Day</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2 feature-badge feature-badge-3 badge-3d-blue">
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
        </div>
      </div>
    </section>
  );
});

export default Hero;