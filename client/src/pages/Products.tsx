import React, { useState } from 'react';
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Filter, Search, ShoppingCart, RefreshCw, AlertCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../services/firestoreService';


const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState([
    { id: 'all', name: 'All Products' }
  ]);
  
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  const { addToCart } = useCart();
  const { state: authState, dispatch: authDispatch } = useAuth();

  // Load products from Firestore
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const productsData = await firestoreService.getProducts();
      
      if (productsData && productsData.length > 0) {
        setProducts(productsData);
        
        // Extract unique categories from products
        const uniqueCategories = Array.from(new Set(productsData.map(product => product.category)));
        const categoryOptions = [
          { id: 'all', name: 'All Products' },
          ...uniqueCategories.map(cat => ({ id: cat, name: cat }))
        ];
        setCategories(categoryOptions);
      } else {
        setError('No products found in the database.');
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products. Please check your connection and try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: any) => {
    if (!authState.isAuthenticated) {
      authDispatch({ type: 'SHOW_AUTH_MODAL' });
      return;
    }

    // Extract numeric price for cart calculations
    const productPrice = (() => {
      if (product.displayPrice && typeof product.displayPrice === 'string') {
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
      displayPrice: product.displayPrice || product.price,
      image: productImage,
      unit: product.unit || 'piece'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our <span className="text-green-600">Fresh Products</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our complete selection of premium fresh fruits, sourced daily from the finest farms.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="flex flex-col items-center max-w-md mx-auto">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Products</h2>
              <p className="text-gray-600 mb-6 text-center">{error}</p>
              <button
                onClick={loadProducts}
                className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors flex items-center"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              // Since prices are stored as strings with ₹ already included, use displayPrice directly
              const productImages = product.imageUrls || product.image_urls || [];
              const primaryImage = productImages[0] || product.image || 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=400';
              const isInStock = product.inStock !== false && (product.stock === undefined || product.stock > 0);
              
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="relative overflow-hidden rounded-t-2xl">
                    <img
                      src={primaryImage}
                      alt={product.name}
                      className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                    />
                    {!isInStock && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    </div>
                    
                    <p className="text-gray-600 mb-4 text-sm">
                      {product.description 
                        ? product.description.length > 80 
                          ? `${product.description.substring(0, 80)}...`
                          : product.description
                        : 'Fresh and delicious fruit'
                      }
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-green-600">
                        {product.displayPrice || product.price || 'Price not available'}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className={`px-4 py-2 rounded-full font-medium transition-colors ${
                          isInStock 
                            ? 'bg-orange-500 text-white hover:bg-orange-600' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        } flex items-center`}
                        disabled={!isInStock}
                      >
                        {isInStock ? (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            {authState.isAuthenticated ? 'Add to Cart' : 'Sign In to Add'}
                          </>
                        ) : (
                          'Out of Stock'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredProducts.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;