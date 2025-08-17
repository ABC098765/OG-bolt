import React from 'react';
import { Link } from 'wouter';
import { ShoppingCart, Truck, Star } from 'lucide-react';

const Hero = () => {
  return (
    <section id="home" className="relative bg-gradient-to-br from-green-50 to-orange-50 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Fresh <span className="text-green-600">Fruits</span><br />
                Delivered <span className="text-orange-500">Daily</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Experience the finest selection of farm-fresh fruits at Super Fruit Center. 
                From exotic imports to local favorites, we bring nature's sweetness to your table.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/products"
                className="relative overflow-hidden bg-green-600 text-white px-8 py-4 rounded-full hover:bg-green-700 transition-all transform hover:scale-105 font-semibold text-lg flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shine"></div>
                <div className="relative z-10 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Shop Now
                </div>
              </Link>
              <button className="relative overflow-hidden border-2 border-orange-500 text-orange-500 px-8 py-4 rounded-full hover:bg-orange-500 hover:text-white transition-all transform hover:scale-105 font-semibold text-lg flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shine"></div>
                <div className="relative z-10 flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Free Delivery*
                </div>
              </button>
            </div>

          </div>

          <div className="relative">
            <div className="relative z-10">
              <img
                src="https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Fresh fruits display"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
            <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-green-400 to-orange-400 rounded-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;