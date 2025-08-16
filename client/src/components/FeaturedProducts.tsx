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
    <section id="products" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Featured <span className="text-green-600">Fresh Fruits</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of the freshest, highest-quality fruits sourced directly from trusted farms.
          </p>
        </div>

        <div className="text-center py-16">
          <p className="text-xl text-gray-600 mb-8">
            No featured products available at the moment.
          </p>
          <button 
            onClick={() => window.location.href = '/products'}
            className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors font-semibold text-lg"
          >
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;