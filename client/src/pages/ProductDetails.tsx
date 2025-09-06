import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../services/firestoreService';
import ProductStructuredData from '../components/ProductStructuredData';

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState<string>('');

  // Get product images
  const productImages = product?.imageUrls || product?.image_urls || (product?.image ? [product.image] : []);
  
  // Generate single default amount option based on product unit or price
  const generateDefaultAmountOption = (product: any) => {
    // Try to extract unit from displayPrice first, then price field
    const priceToCheck = product.displayPrice || product.price || '';
    if (priceToCheck) {
      const priceString = priceToCheck.toLowerCase();
      if (priceString.includes('/kg') || priceString.includes('kg')) {
        return '1kg';
      } else if (priceString.includes('/piece') || priceString.includes('/pc') || priceString.includes('piece')) {
        return '1pc';
      } else if (priceString.includes('/box') || priceString.includes('box')) {
        return '1 box';
      }
    }
    
    // Fallback to product.unit
    const unit = product.unit || '';
    const unitLower = unit.toLowerCase();
    if (unitLower.includes('kg')) {
      return '1kg';
    } else if (unitLower.includes('piece') || unitLower.includes('pc')) {
      return '1pc';
    } else if (unitLower.includes('box')) {
      return '1 box';
    }
    
    // Final fallback
    return '1kg';
  };
  
  // Get amount options for current product
  const getAmountOptions = () => {
    // First priority: Use amountOptions from admin app if they exist and are not empty
    if (product?.amountOptions && Array.isArray(product.amountOptions) && product.amountOptions.length > 0) {
      return product.amountOptions;
    }
    
    // Second priority: Generate single default option based on unit
    return [generateDefaultAmountOption(product || {})];
  };
  

  // Load product from Firestore
  useEffect(() => {
    const loadProduct = async () => {
      if (productId) {
        try {
          setLoading(true);
          const productData = await firestoreService.getProduct(productId);
          setProduct(productData);
          
          // Initialize selectedAmount with first available option
          if (productData) {
            const amountOptions = productData.amountOptions && Array.isArray(productData.amountOptions) && productData.amountOptions.length > 0 
              ? productData.amountOptions 
              : [generateDefaultAmountOption(productData)];
            setSelectedAmount(amountOptions[0]);
          }
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
  const maxSwipeDistance = 200;

  const onTouchStart = (e: React.TouchEvent) => {
    if (isTransitioning || productImages.length <= 1) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setTranslateX(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || isTransitioning || productImages.length <= 1) return;
    
    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;
    
    // Limit the swipe distance for better UX
    const limitedDiff = Math.max(-maxSwipeDistance, Math.min(maxSwipeDistance, diff));
    setTranslateX(limitedDiff);
    setTouchEnd(currentTouch);
  };

  const onTouchEnd = () => {
    if (!touchStart || isTransitioning || productImages.length <= 1) return;
    
    const distance = touchStart - (touchEnd || touchStart);
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Reset translateX
    setTranslateX(0);
    
    if (isLeftSwipe && currentImageIndex < productImages.length - 1) {
      nextImage();
    } else if (isRightSwipe && currentImageIndex > 0) {
      previousImage();
    } else if (isLeftSwipe && currentImageIndex === productImages.length - 1) {
      // Loop to first image
      setIsTransitioning(true);
      setCurrentImageIndex(0);
      setTimeout(() => setIsTransitioning(false), 300);
    } else if (isRightSwipe && currentImageIndex === 0) {
      // Loop to last image
      setIsTransitioning(true);
      setCurrentImageIndex(productImages.length - 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
    
    // Reset touch states
    setTouchStart(null);
    setTouchEnd(null);
  };

  const nextImage = () => {
    if (!product || !productImages.length || isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentImageIndex((prevIndex) => {
      const newIndex = prevIndex === productImages.length - 1 ? 0 : prevIndex + 1;
      setTimeout(() => setIsTransitioning(false), 300);
      return newIndex;
    });
  };

  const previousImage = () => {
    if (!product || !productImages.length || isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentImageIndex((prevIndex) => {
      const newIndex = prevIndex === 0 ? productImages.length - 1 : prevIndex - 1;
      setTimeout(() => setIsTransitioning(false), 300);
      return newIndex;
    });
  };

  const goToImage = (index: number) => {
    if (isTransitioning || index === currentImageIndex) return;
    
    setIsTransitioning(true);
    setCurrentImageIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
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
      unit: product.unit || 'piece',
      selectedAmount: selectedAmount // Pass the selected amount (e.g., "2kg", "3pc")
    });
  };

  const productPrice = product.displayPrice ? parseFloat(product.displayPrice.replace('₹', '')) : product.price;
  const currentImage = productImages[currentImageIndex] || productImages[0] || 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=400';
  const isInStock = product.inStock !== false && (product.stock === undefined || product.stock > 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      {/* Add structured data for SEO */}
      {product && <ProductStructuredData product={product} />}
      
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
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Product Image */}
            <div className="relative p-6 lg:p-8">
              {/* Main Image Carousel */}
              <div 
                className="mb-4 relative touch-pan-y select-none overflow-hidden rounded-lg cursor-grab active:cursor-grabbing bg-gray-100 dark:bg-gray-700"
                style={{ height: '320px' }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <div 
                  className={`flex h-full ${isTransitioning ? 'transition-transform duration-300 ease-out' : ''}`}
                  style={{
                    transform: `translateX(-${currentImageIndex * (100 / productImages.length)}%)`,
                    width: `${productImages.length * 100}%`
                  }}
                >
                  {productImages.length > 0 ? productImages.map((imageUrl: string, index: number) => (
                    <div 
                      key={index}
                      className="flex-shrink-0 h-full"
                      style={{ width: `${100 / productImages.length}%`, minWidth: `${100 / productImages.length}%` }}
                    >
                      <img
                        className="w-full h-full object-contain"
                        src={imageUrl || 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=400'}
                        alt={`${product.name} ${index + 1}`}
                        loading={index === currentImageIndex ? 'eager' : 'lazy'}
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=400';
                        }}
                      />
                    </div>
                  )) : (
                    // Fallback for when no images are available
                    <div className="flex-shrink-0 h-full w-full">
                      <img
                        className="w-full h-full object-contain"
                        src="https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=400"
                        alt={product?.name || 'Product Image'}
                      />
                    </div>
                  )}
                </div>

                {/* Swipe hint overlay */}
                {productImages.length > 1 && Math.abs(translateX) > 20 && !isTransitioning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none transition-opacity duration-200">
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-gray-800 shadow-lg">
                      {translateX > 0 ? '← Swipe for Previous' : 'Swipe for Next →'}
                    </div>
                  </div>
                )}

                {/* Loading state for images */}
                {productImages.length > 1 && isTransitioning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {/* Image indicators */}
                {productImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {productImages.map((_: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => goToImage(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          index === currentImageIndex 
                            ? 'bg-white shadow-lg scale-125' 
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Navigation arrows for desktop */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={previousImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0 hover:opacity-100 focus:opacity-100"
                      disabled={isTransitioning}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0 hover:opacity-100 focus:opacity-100"
                      disabled={isTransitioning}
                    >
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Image Gallery */}
              {productImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {productImages.map((imageUrl: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      disabled={isTransitioning}
                      className={`relative flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'ring-2 ring-green-500 scale-105 shadow-lg' 
                          : 'hover:scale-102 hover:shadow-md'
                      } ${isTransitioning ? 'pointer-events-none' : ''}`}
                    >
                      <img
                        src={imageUrl}
                        alt={`${product.name} ${index + 1}`}
                        className={`w-16 h-16 object-cover transition-all duration-300 ${
                          index === currentImageIndex 
                            ? 'opacity-100' 
                            : 'opacity-60 hover:opacity-80'
                        }`}
                      />
                      {/* Active indicator */}
                      {index === currentImageIndex && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      )}
                    </button>
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
            <div className="p-6 lg:p-10 border-l border-gray-100 dark:border-gray-700">
              <div className="mb-4">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">{product.name}</h1>
              </div>

              {/* Price */}
              <div className="mb-10">
                <div className="flex items-baseline mb-3">
                  <span className="text-3xl lg:text-4xl font-bold text-green-600">
                    {product.displayPrice || (typeof product.price === 'string' && product.price.includes('₹') ? product.price : `₹${productPrice}`)}
                  </span>
                </div>
                
                {/* Available Units */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <span className="text-base text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Available units:</span> {product.stock || 50}
                  </span>
                </div>
              </div>

              {/* Amount Selection Chips */}
              <div className="mb-10">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Select Amount</h3>
                <div className="flex flex-wrap gap-4">
                  {getAmountOptions().map((amount: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAmount(amount)}
                      className={`px-6 py-3 rounded-full border-2 font-medium transition-all duration-200 min-w-[80px] ${
                        selectedAmount === amount
                          ? 'border-green-500 bg-green-500 text-white shadow-lg transform scale-105'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-green-400 hover:shadow-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:border-green-400'
                      }`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
                {selectedAmount && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Selected: <span className="font-semibold text-green-600">{selectedAmount}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-10">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Description</h3>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-base whitespace-pre-line">
                    {product.description || 'Fresh and delicious fruit, perfect for healthy snacking and cooking.'}
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="space-y-6">
                <button 
                  onClick={handleAddToCart}
                  disabled={!isInStock}
                  className={`w-full py-5 px-8 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center shadow-lg ${
                    isInStock 
                      ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-xl transform hover:-translate-y-0.5' 
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
                  <div className="text-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                      🚚 Free delivery on orders above ₹1000
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Product Info */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 lg:p-10">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Product Information</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Fresh Quality</h4>
              <p className="text-gray-600 dark:text-gray-300">Hand-picked and quality checked</p>
            </div>
            <div className="text-center p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Fast Delivery</h4>
              <p className="text-gray-600 dark:text-gray-300">Same day delivery available</p>
            </div>
            <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Best Price</h4>
              <p className="text-gray-600 dark:text-gray-300">Competitive pricing guaranteed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;