import React, { memo, useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../services/firestoreService';
import OptimizedProductCard from './OptimizedProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';

const FeaturedProducts = memo(() => {
  const { addToCart } = useCart();
  const { state: authState, dispatch: authDispatch } = useAuth();
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
    if (!authState.isAuthenticated) {
      authDispatch({ type: 'SHOW_AUTH_MODAL' });
      return;
    }

    try {
      // Extract numeric price for cart calculations
      const productPrice = (() => {
        if (product.displayPrice && typeof product.displayPrice === 'string') {
          const numericPart = product.displayPrice.replace(/[^\d.]/g, '');
          return parseFloat(numericPart) || 0;
        }
        return product.price || 0;
      })();
      
      // Get product images in the same way as displayed on products page
      const productImages = product.imageUrls || product.image_urls || [];
      const primaryImage = productImages[0] || product.image || 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=400';

      await addToCart({
        id: product.id,
        name: product.name,
        price: productPrice,
        displayPrice: product.displayPrice || product.price,
        image: primaryImage,
        imageUrls: productImages, // Pass extracted imageUrls array
        unit: product.unit || 'piece'
      });
    } catch (error) {
      console.error('Error adding product to cart:', error);
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
        <div className="product-grid-container mb-12">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div 
                key={index}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ProductCardSkeleton />
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-full text-center py-12">
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
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 mb-4">No products available yet</div>
              <div className="text-sm text-gray-400">Products will appear here once added from the admin panel</div>
            </div>
          ) : (
            // Real products
            products.map((product, index) => (
              <div 
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <OptimizedProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                  isAuthenticated={authState.isAuthenticated}
                />
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