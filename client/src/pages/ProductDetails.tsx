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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h2>
            <p className="text-xl text-gray-600 mb-8">
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

    addToCart(product);
  };

  const productPrice = product.displayPrice ? parseFloat(product.displayPrice.replace('₹', '')) : product.price;
  const productImages = product.imageUrls || product.image_urls || (product.image ? [product.image] : []);
  const primaryImage = productImages[0] || 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=400';
  const isInStock = product.inStock !== false && (product.stock === undefined || product.stock > 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <button 
            onClick={() => navigate('/products')}
            className="flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Products
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="relative p-4">
              {/* Main Image */}
              <div className="mb-4">
                <img
                  className="main-product-image w-full h-80 lg:h-96 object-cover rounded-lg"
                  src={primaryImage}
                  alt={product.name}
                />
              </div>
              
              {/* Image Gallery */}
              {productImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {productImages.map((imageUrl: string, index: number) => (
                    <img
                      key={index}
                      src={imageUrl}
                      alt={`${product.name} ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity flex-shrink-0"
                      onClick={() => {
                        // Update main image when thumbnail is clicked
                        const mainImg = document.querySelector('.main-product-image') as HTMLImageElement;
                        if (mainImg) mainImg.src = imageUrl;
                      }}
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
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                
                {/* Category */}
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-6">
                  {product.category}
                </span>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-green-600">
                    {product.displayPrice ? product.displayPrice : `₹${productPrice}`}
                  </span>
                  <span className="text-xl text-gray-600 ml-2">{product.displayPrice && product.displayPrice.includes('/') ? '' : `per ${product.unit || 'piece'}`}</span>
                </div>
                
                {/* Available Units */}
                <div className="mt-4">
                  <span className="text-lg text-gray-700">
                    <span className="font-semibold">Available units:</span> {product.stock || 50}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
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
                    <p className="text-sm text-gray-600">
                      Free delivery on orders above ₹1000
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Product Info */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Product Information</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Fresh Quality</h4>
              <p className="text-gray-600 text-sm">Hand-picked and quality checked</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Fast Delivery</h4>
              <p className="text-gray-600 text-sm">Same day delivery available</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Best Price</h4>
              <p className="text-gray-600 text-sm">Competitive pricing guaranteed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;