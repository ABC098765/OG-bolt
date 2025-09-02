import React, { memo, useState, useEffect } from 'react';
import { Star, Heart, ShoppingCart, Loader2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { firestoreService } from '../services/firestoreService';

const FeaturedProducts = memo(() => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Fetch recently added products
  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching recent products from Firestore...');
        
        const allProducts = await firestoreService.getProducts();
        console.log('📦 Fetched products:', allProducts.length);
        
        // Sort by creation date (most recent first) and take first 4
        const recentProducts = allProducts
          .sort((a, b) => {
            const dateA = a.created_at?.toDate?.() || a.created_at?.seconds ? new Date(a.created_at.seconds * 1000) : new Date(0);
            const dateB = b.created_at?.toDate?.() || b.created_at?.seconds ? new Date(b.created_at.seconds * 1000) : new Date(0);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 4);
        
        setProducts(recentProducts);
        console.log('✅ Recent products loaded:', recentProducts.length);
      } catch (error) {
        console.error('❌ Error fetching products:', error);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentProducts();
  }, []);

  const handleAddToCart = async (product: any) => {
    try {
      // Convert Firestore product to cart format
      const cartItem = {
        productId: product.id,
        name: product.name || 'Unknown Product',
        price: product.unitPriceDisplay || product.price || '₹0',
        unitPrice: product.unitPrice || 0,
        unitPriceDisplay: product.unitPriceDisplay || product.price || '₹0',
        amount: `1${product.unit || 'kg'}`,
        unit: product.unit || 'kg',
        quantity: 1,
        totalPrice: product.unitPrice || 0,
        imageUrls: product.imageUrls || []
      };
      
      await addToCart(cartItem);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <section id="products" className="py-20 bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-green-200 rounded-full opacity-30 animate-float"></div>
      <div className="absolute bottom-10 left-10 w-16 h-16 bg-orange-200 rounded-full opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-yellow-200 rounded-full opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Featured <span className="text-green-600 underline-animated">
              Fresh Fruits
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover our handpicked selection of the freshest, highest-quality fruits sourced directly from trusted farms and delivered to your doorstep.
          </p>
        </div>

        {/* Real Products Display */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {loading ? (
            // Loading state
            Array.from({ length: 4 }).map((_, index) => (
              <div key={`loading-${index}`} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 h-32 w-full"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-4 text-center py-12">
              <div className="text-red-500 mb-4">❌ {error}</div>
              <button 
                onClick={() => window.location.reload()}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : products.length === 0 ? (
            // No products state
            <div className="col-span-4 text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 mb-4">No products available yet</div>
              <div className="text-sm text-gray-400">Products will appear here once added from the admin panel</div>
            </div>
          ) : (
            // Real products
            products.map((product, index) => (
              <div key={product.id} className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-4 overflow-hidden">
              {/* Fresh Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Fresh
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
                  src={product.imageUrls?.[0] || '/placeholder-fruit.jpg'}
                  alt={product.name || 'Fresh Fruit'}
                  className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-fruit.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                

                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 transition-colors">
                  {product.name || 'Fresh Fruit'}
                </h3>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {product.unitPriceDisplay || product.price || '₹0'}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddToCart(product);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
              </div>
            ))
          )}
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
});

export default FeaturedProducts;