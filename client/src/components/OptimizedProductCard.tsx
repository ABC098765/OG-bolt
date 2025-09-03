import React, { memo } from 'react';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { useLocation } from 'wouter';
import LazyImage from './LazyImage';

interface Product {
  id: string;
  name: string;
  price: string;
  displayPrice?: string;
  originalPrice?: string;
  image: string;
  imageUrls?: string[];
  image_urls?: string[];
  rating?: number;
  badge?: string;
  unit?: string;
  description?: string;
  stock?: number;
  inStock?: boolean;
  category?: string;
}

interface OptimizedProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isAuthenticated?: boolean;
}

const OptimizedProductCard = memo<OptimizedProductCardProps>(({ product, onAddToCart, isAuthenticated = false }) => {
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  
  const productImages = product.imageUrls || product.image_urls || (product.image ? [product.image] : []);
  const primaryImage = productImages[0] || 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=400';
  const isInStock = product.inStock !== false && (product.stock === undefined || product.stock > 0);
  return (
    <div 
      className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer w-full max-w-sm mx-auto h-auto flex flex-col"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Stock Badge */}
      {!isInStock && (
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Out of Stock
          </span>
        </div>
      )}
      
      {/* Category Badge */}
      {product.category && isInStock && (
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            {product.category}
          </span>
        </div>
      )}

      {/* Heart Icon */}
      <div className="absolute top-4 right-4 z-10">
        <button className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
          <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
        </button>
      </div>

      {/* Product Image */}
      <div className="relative overflow-hidden">
        <LazyImage
          src={primaryImage}
          alt={product.name}
          className="w-full h-32 sm:h-48 md:h-56 lg:h-64 object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {!isInStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold text-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4 lg:p-6">
        {product.rating && (
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">({product.rating})</span>
          </div>
        )}

        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
          {product.name}
        </h3>
        

        <div className="flex flex-col space-y-2 sm:space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <span className="text-sm sm:text-base lg:text-lg font-bold text-green-600 truncate">
              {product.displayPrice || product.price || 'Price not available'}
            </span>
            {product.originalPrice && (
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-through flex-shrink-0">{product.originalPrice}</span>
            )}
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={!isInStock}
            className={`w-full sm:w-auto px-3 py-2 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 flex items-center justify-center text-xs sm:text-sm min-w-fit whitespace-nowrap shadow-lg transform hover:scale-105 active:scale-95 ${
              isInStock 
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-xl' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-sm'
            }`}
          >
            {isInStock ? (
              <>
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="font-bold text-xs sm:text-sm">
                  {isAuthenticated ? 'Add to Cart' : 'Sign In'}
                </span>
              </>
            ) : (
              <span className="font-medium">Out of Stock</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

OptimizedProductCard.displayName = 'OptimizedProductCard';

export default OptimizedProductCard;