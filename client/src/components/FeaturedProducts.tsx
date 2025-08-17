import React from 'react';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const FeaturedProducts = () => {
  const { dispatch } = useCart();

  const products = [];

  const addToCart = (product: any) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        unit: product.unit
      }
    });
  };

  return (
    <section id="products" className="py-20 bg-gradient-to-br from-gray-50 to-green-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-green-200 rounded-full opacity-30 animate-float"></div>
      <div className="absolute bottom-10 left-10 w-16 h-16 bg-orange-200 rounded-full opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-yellow-200 rounded-full opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4 mr-2" />
            Bestsellers This Week
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Featured <span className="text-green-600 relative">
              Fresh Fruits
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-green-200" viewBox="0 0 120 8" fill="currentColor">
                <path d="M0,6 Q30,0 60,4 T120,2 L120,8 L0,8 Z" />
              </svg>
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our handpicked selection of the freshest, highest-quality fruits sourced directly from trusted farms and delivered to your doorstep.
          </p>
        </div>

        {/* Sample Products Display */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            {
              name: "Premium Alphonso Mangoes",
              price: "₹299",
              originalPrice: "₹399",
              image: "https://images.pexels.com/photos/918327/pexels-photo-918327.jpeg?auto=compress&cs=tinysrgb&w=400",
              rating: 4.8,
              badge: "Bestseller"
            },
            {
              name: "Fresh Strawberries",
              price: "₹199",
              originalPrice: "₹249",
              image: "https://images.pexels.com/photos/89778/strawberries-frisch-ripe-sweet-89778.jpeg?auto=compress&cs=tinysrgb&w=400",
              rating: 4.9,
              badge: "Premium"
            },
            {
              name: "Organic Apples",
              price: "₹149",
              originalPrice: "₹179",
              image: "https://images.pexels.com/photos/347926/pexels-photo-347926.jpeg?auto=compress&cs=tinysrgb&w=400",
              rating: 4.7,
              badge: "Organic"
            }
          ].map((product, index) => (
            <div key={index} className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-4 overflow-hidden">
              {/* Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {product.badge}
                </span>
              </div>

              {/* Heart Icon */}
              <div className="absolute top-4 right-4 z-10">
                <button className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                </button>
              </div>

              {/* Product Image */}
              <div className="relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">({product.rating})</span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                  {product.name}
                </h3>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-gray-900">{product.price}</span>
                    <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                  </div>
                  <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition-colors">
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button 
            onClick={() => window.location.href = '/products'}
            className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-full hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="relative z-10">View All Products</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;