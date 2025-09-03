import React, { useState } from 'react';
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Filter, Search, ShoppingCart, RefreshCw, AlertCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../services/firestoreService';
import OptimizedProductCard from '../components/OptimizedProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';


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

  // Sample fallback products
  const sampleProducts = [
    {
      id: 'apple-001',
      name: "Fresh Red Apples",
      category: "Fruits",
      price: 120,
      displayPrice: "₹120/kg",
      unit: "kg",
      imageUrls: [
        "https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=400"
      ],
      inStock: true,
      rating: 4.5,
      description: "Fresh, crispy red apples perfect for snacking and cooking."
    },
    {
      id: 'banana-002',
      name: "Fresh Bananas",
      category: "Fruits",
      price: 60,
      displayPrice: "₹60/kg",
      unit: "kg",
      imageUrls: [
        "https://images.pexels.com/photos/61127/pexels-photo-61127.jpeg?auto=compress&cs=tinysrgb&w=400"
      ],
      inStock: true,
      rating: 4.2,
      description: "Ripe yellow bananas rich in potassium and natural sweetness."
    },
    {
      id: 'orange-003',
      name: "Fresh Oranges",
      category: "Fruits",
      price: 80,
      displayPrice: "₹80/kg",
      unit: "kg",
      imageUrls: [
        "https://images.pexels.com/photos/1414110/pexels-photo-1414110.jpeg?auto=compress&cs=tinysrgb&w=400"
      ],
      inStock: true,
      rating: 4.3,
      description: "Juicy oranges packed with vitamin C and refreshing flavor."
    },
    {
      id: 'mango-004',
      name: "Fresh Mangoes",
      category: "Fruits",
      price: 200,
      displayPrice: "₹200/kg",
      unit: "kg",
      imageUrls: [
        "https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=400"
      ],
      inStock: true,
      rating: 4.8,
      description: "Sweet and juicy mangoes, the king of fruits."
    },
    {
      id: 'grapes-005',
      name: "Fresh Grapes",
      category: "Fruits",
      price: 150,
      displayPrice: "₹150/kg",
      unit: "kg",
      imageUrls: [
        "https://images.pexels.com/photos/708777/pexels-photo-708777.jpeg?auto=compress&cs=tinysrgb&w=400"
      ],
      inStock: true,
      rating: 4.4,
      description: "Sweet purple grapes perfect for snacking."
    },
    {
      id: 'strawberry-006',
      name: "Fresh Strawberries",
      category: "Fruits",
      price: 300,
      displayPrice: "₹300/kg",
      unit: "kg",
      imageUrls: [
        "https://images.pexels.com/photos/89778/strawberries-red-fruit-royalty-free-89778.jpeg?auto=compress&cs=tinysrgb&w=400"
      ],
      inStock: true,
      rating: 4.7,
      description: "Fresh red strawberries bursting with flavor."
    },
    {
      id: 'pineapple-007',
      name: "Fresh Pineapple",
      category: "Fruits",
      price: 250,
      displayPrice: "₹250/piece",
      unit: "piece",
      imageUrls: [
        "https://images.pexels.com/photos/708777/pexels-photo-708777.jpeg?auto=compress&cs=tinysrgb&w=400"
      ],
      inStock: true,
      rating: 4.6,
      description: "Sweet and tangy pineapple rich in vitamins."
    },
    {
      id: 'watermelon-008',
      name: "Fresh Watermelon",
      category: "Fruits",
      price: 40,
      displayPrice: "₹40/kg",
      unit: "kg",
      imageUrls: [
        "https://images.pexels.com/photos/708777/pexels-photo-708777.jpeg?auto=compress&cs=tinysrgb&w=400"
      ],
      inStock: true,
      rating: 4.1,
      description: "Juicy and refreshing watermelon perfect for summer."
    }
  ];

  // Load products from Firestore
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const productsData = await firestoreService.getProducts().catch((err) => {
        console.error('Firebase products error:', err);
        throw err;
      });
      
      if (productsData && productsData.length > 0) {
        setProducts(productsData);
        
        // Extract unique categories from products
        const uniqueCategories = Array.from(new Set(productsData.map(product => product.category).filter(Boolean)));
        const categoryOptions = [
          { id: 'all', name: 'All Products' },
          ...uniqueCategories.map(cat => ({ id: cat, name: cat }))
        ];
        setCategories(categoryOptions);
      } else {
        // Use fallback sample products
        console.log('No products in database, using sample data');
        setProducts(sampleProducts);
        setCategories([
          { id: 'all', name: 'All Products' },
          { id: 'Fruits', name: 'Fruits' }
        ]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // Use fallback sample products on error
      console.log('Firebase error, using sample data');
      setProducts(sampleProducts);
      setCategories([
        { id: 'all', name: 'All Products' },
        { id: 'Fruits', name: 'Fruits' }
      ]);
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
      }).catch((err) => {
        console.error('Add to cart error:', err);
        throw err;
      });
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="text-center mb-6 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our <span className="text-green-600 underline-animated">Fresh Products</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto animate-slide-up">
            Discover our complete selection of premium fresh fruits.
          </p>
          <div className="mt-6 flex justify-center items-center space-x-4 animate-slide-up" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-medium">{products.length} Products Available</span>
            </div>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center text-orange-500">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-medium">Fresh Daily</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
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
          <div>
            <div className="text-center mb-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
              <p className="text-lg text-gray-600 dark:text-gray-300">Loading fresh products...</p>
            </div>
            <div className="product-grid-container">
              {[...Array(10)].map((_, index) => (
                <div 
                  key={index}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="flex flex-col items-center max-w-md mx-auto">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Failed to Load Products</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">{error}</p>
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
          <div className="product-grid-container">
            {filteredProducts.map((product, index) => (
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
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !loading && !error && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
              <p className="text-gray-600 dark:text-gray-300">Try adjusting your search criteria or browse all products.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="mt-4 bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;