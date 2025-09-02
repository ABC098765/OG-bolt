import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Package, Clock, CheckCircle, XCircle, Eye, Truck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { firestoreService } from '../services/firestoreService';
import { FirestoreOrder } from '../types/firestore';

const Orders = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  const { state: authState, dispatch: authDispatch } = useAuth();
  const { addToCart } = useCart();

  // Redirect to sign in if not authenticated
  React.useEffect(() => {
    if (!authState.isAuthenticated && authState.user === null) {
      authDispatch({ type: 'SHOW_AUTH_MODAL' });
    }
  }, [authState.isAuthenticated, authDispatch]);

  // Subscribe to real-time orders updates
  React.useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    if (authState.isAuthenticated && authState.user) {
      try {
        setLoading(true);
        console.log('🔄 Setting up real-time orders listener for user:', authState.user.id);
        
        unsubscribe = firestoreService.subscribeToUserOrders(
          authState.user.id,
          (userOrders) => {
            console.log('📦 Orders updated:', userOrders.length, 'orders');
            
            // Fix orders to use payment_status as order_status if available
            const fixedOrders = userOrders.map(order => {
              if (order.payment_status && order.payment_status !== order.order_status) {
                console.log('🔧 Fixing order', order.id, '- using payment_status:', order.payment_status);
                return { ...order, order_status: order.payment_status };
              }
              return order;
            });
            
            console.log('📦 Fixed order statuses:', fixedOrders.map(o => ({ id: o.id, status: o.order_status })));
            setOrders(fixedOrders);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error('Error setting up orders subscription:', error);
        setLoading(false);
      }
    }

    return () => {
      if (unsubscribe) {
        console.log('🔌 Cleaning up orders listener');
        unsubscribe();
      }
    };
  }, [authState.isAuthenticated, authState.user]);

  // Show loading or sign in prompt if not authenticated
  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Sign in required</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Please sign in to view your order history and track your orders.
            </p>
            <button 
              onClick={() => authDispatch({ type: 'SHOW_AUTH_MODAL' })}
              className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors font-semibold text-lg"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status?.toLowerCase()?.trim();
    
    switch (normalizedStatus) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'out for delivery':
      case 'outfordelivery':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'packed':
        return <Package className="w-5 h-5 text-purple-500" />;
      case 'ordered':
      case 'pending': // Map pending to ordered for display
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase()?.trim();
    
    switch (normalizedStatus) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'out for delivery':
      case 'outfordelivery':
        return 'bg-blue-100 text-blue-800';
      case 'packed':
        return 'bg-purple-100 text-purple-800';
      case 'ordered':
      case 'pending': // Map pending to ordered for display
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'failed':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to normalize status for filtering - maps pending to ordered
  const normalizeStatusForFilter = (status: string) => {
    const normalizedStatus = status?.toLowerCase()?.trim();
    return normalizedStatus === 'pending' ? 'ordered' : normalizedStatus;
  };

  // Helper function to check if order matches filter
  const orderMatchesFilter = (order: FirestoreOrder, filterStatus: string) => {
    if (filterStatus === 'all') return true;
    const normalizedOrderStatus = normalizeStatusForFilter(order.order_status);
    return normalizedOrderStatus === filterStatus;
  };

  const filteredOrders = selectedTab === 'all' 
    ? orders 
    : orders.filter(order => orderMatchesFilter(order, selectedTab));

  const tabs = [
    { id: 'all', name: 'All Orders', count: orders.length },
    { id: 'ordered', name: 'Ordered', count: orders.filter(o => orderMatchesFilter(o, 'ordered')).length },
    { id: 'packed', name: 'Packed', count: orders.filter(o => orderMatchesFilter(o, 'packed')).length },
    { id: 'out for delivery', name: 'Out for Delivery', count: orders.filter(o => orderMatchesFilter(o, 'out for delivery')).length },
    { id: 'delivered', name: 'Delivered', count: orders.filter(o => orderMatchesFilter(o, 'delivered')).length },
    { id: 'failed', name: 'Failed', count: orders.filter(o => orderMatchesFilter(o, 'failed')).length }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Your <span className="text-green-600">Orders</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Track and manage your fruit orders
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {tab.name} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
              <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No orders found</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                {selectedTab === 'all' 
                  ? "You haven't placed any orders yet." 
                  : `No ${selectedTab} orders found.`}
              </p>
              <button 
                onClick={() => navigate('/products')}
                className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors font-semibold"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                  <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                    {getStatusIcon(order.order_status)}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">#{order.id}</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Placed on {firestoreService.timestampToDate(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${getStatusColor(order.order_status)}`}>
                      {order.order_status === 'pending' ? 'ordered' : order.order_status}
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{order.total_amount}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Items Ordered</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="text-center">
                        <img
                          src={item.imageUrls?.[0] || 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=400'}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg mx-auto mb-2"
                        />
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t">
                  <button 
                    onClick={() => {
                      window.scrollTo(0, 0);
                      navigate(`/order/${order.id}`);
                    }}
                    className="flex items-center justify-center px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-semibold"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  
                  {order.order_status === 'delivered' && (
                    <button 
                      onClick={async () => {
                        try {
                          console.log('🔄 Reordering items from order:', order.id);
                          
                          // Add each item from the order to cart with fresh product data
                          for (const item of order.items) {
                            try {
                              console.log('🔍 Fetching fresh product data for:', item.product_id);
                              
                              // Fetch current product details from database
                              const currentProduct = await firestoreService.getProduct(item.product_id);
                              
                              if (currentProduct) {
                                console.log('✅ Found current product:', currentProduct.name);
                                console.log('💰 Current price:', currentProduct.displayPrice || currentProduct.price);
                                
                                // Use current product data instead of old order data
                                await addToCart(currentProduct);
                              } else {
                                console.log('⚠️ Product not found, skipping:', item.name);
                                // Could show a notification that some products are no longer available
                              }
                            } catch (error) {
                              console.error('❌ Error fetching product:', item.product_id, error);
                              // Could show a notification about unavailable products
                            }
                          }
                          
                          console.log('✅ All items reordered successfully!');
                          navigate('/cart');
                        } catch (error) {
                          console.error('❌ Error reordering items:', error);
                        }
                      }}
                      className="flex items-center justify-center px-6 py-2 border-2 border-orange-500 text-orange-500 rounded-full hover:bg-orange-50 transition-colors font-semibold"
                    >
                      Reorder
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;