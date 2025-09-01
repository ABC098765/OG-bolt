import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../services/firestoreService';

const ProductDetails = () => {
  const { productId } = useParams();
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  const { addToCart } = useCart();
  const { state: authState, dispatch: authDispatch } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Load product from Firestore
  useEffect(() => {
    const loadProduct = async () => {
      if (productId) {
        try {
          setLoading(true);
          const productData = await firestoreService.getProduct(productId);
          setProduct(productData);
        } catch (error) {
          console.error('Error loading product:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadProduct();
  }, [productId]);

  // Swipe functionality
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    }
    if (isRightSwipe) {
      previousImage();
    }
  };

  const nextImage = () => {
    if (!product || !productImages.length) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === productImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const previousImage = () => {
    if (!product || !productImages.length) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? productImages.length - 1 : prevIndex - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Product Not Found</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              The product you're looking for doesn't exist.
            </p>
            <button 
              onClick={() => navigate('/products')}
              className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors font-semibold text-lg"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!authState.isAuthenticated) {
      authDispatch({ type: 'SHOW_AUTH_MODAL' });
      return;
    }

    // Extract numeric price for cart calculations (same logic as Products.tsx)
    const productPrice = (() => {
      if (product.displayPrice && typeof product.displayPrice === 'string') {
        // Handle range prices like "₹80-₹250/kg" - extract the first (lower) price
        const rangeMatch = product.displayPrice.match(/₹?(\d+(?:\.\d+)?)\s*-\s*₹?(\d+(?:\.\d+)?)/);
        if (rangeMatch) {
          return Number(rangeMatch[1]); // Return the lower price from range
        }
        // Handle single prices like "₹25/kg" or "25"
        const singleMatch = product.displayPrice.match(/₹?(\d+(?:\.\d+)?)/);
        if (singleMatch) {
          return Number(singleMatch[1]);
        }
        // Fallback
        const numericPart = product.displayPrice.replace(/[^\d.]/g, '');
        return parseFloat(numericPart) || 0;
      }
      return product.price || 0;
    })();
    
    const productImage = product.imageUrls?.[0] || product.image || 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=400';


    addToCart({
      id: product.id,
      name: product.name,
      price: productPrice,
      displayPrice: product.displayPrice, // Keep original displayPrice format like "₹150-₹400/kg"
      image: productImage,
      unit: product.unit || 'piece'
    });
  };

  const productPrice = product.displayPrice ? parseFloat(product.displayPrice.replace('₹', '')) : product.price;
  const productImages = product.imageUrls || product.image_urls || (product.image ? [product.image] : []);
  const currentImage = productImages[currentImageIndex] || productImages[0] || 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=400';
  const isInStock = product.inStock !== false && (product.stock === undefined || product.stock > 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <button 
            onClick={() => navigate('/products')}
            className="flex items-center text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Products
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="relative p-4">
              {/* Main Image */}
              <div 
                className="mb-4 relative touch-pan-y select-none"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <img
                  className="main-product-image w-full h-80 lg:h-96 object-cover rounded-lg"
                  src={currentImage}
                  alt={product.name}
                />
                {/* Image indicators */}
                {productImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {productImages.map((_: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => goToImage(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex 
                            ? 'bg-white shadow-lg' 
                            : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Image Gallery */}
              {productImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {productImages.map((imageUrl: string, index: number) => (
                    <img
                      key={index}
                      src={imageUrl}
                      alt={`${product.name} ${index + 1}`}
                      className={`w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-all flex-shrink-0 ${
                        index === currentImageIndex 
                          ? 'ring-2 ring-green-500 opacity-100' 
                          : 'opacity-60'
                      }`}
                      onClick={() => goToImage(index)}
                    />
                  ))}
                </div>
              )}
              
              {!isInStock && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="bg-red-500 text-white px-6 py-3 rounded-full font-semibold text-lg">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="p-8">
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{product.name}</h1>
                
                {/* Category */}
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-6">
                  {product.category}
                </span>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-green-600">
                    {product.displayPrice || (typeof product.price === 'string' && product.price.includes('₹') ? product.price : `₹${productPrice}`)}
                  </span>
                </div>
                
                {/* Available Units */}
                <div className="mt-4">
                  <span className="text-lg text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Available units:</span> {product.stock || 50}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Description</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                  {product.description || 'Fresh and delicious fruit, perfect for healthy snacking and cooking.'}
                </p>
              </div>

              {/* Add to Cart Button */}
              <div className="space-y-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={!isInStock}
                  className={`w-full py-4 px-8 rounded-full font-semibold text-lg transition-colors flex items-center justify-center ${
                    isInStock 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-6 h-6 mr-3" />
                  {isInStock 
                    ? (authState.isAuthenticated ? 'Add to Cart' : 'Sign In to Add to Cart')
                    : 'Out of Stock'
                  }
                </button>

                {isInStock && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Free delivery on orders above ₹1000
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Product Info */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Product Information</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Fresh Quality</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Hand-picked and quality checked</p>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Fast Delivery</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Same day delivery available</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Best Price</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Competitive pricing guaranteed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;