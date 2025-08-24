import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Package, Clock, CheckCircle, XCircle, Eye, Truck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { FirestoreOrder } from '../types/firestore';

const Orders = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  const { state: authState, dispatch: authDispatch } = useAuth();

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
            console.log('📦 Order statuses:', userOrders.map(o => ({ id: o.id, status: o.order_status })));
            setOrders(userOrders);
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sign in required</h2>
            <p className="text-xl text-gray-600 mb-8">
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading your orders...</p>
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
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'failed':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = selectedTab === 'all' 
    ? orders 
    : orders.filter(order => order.order_status === selectedTab);

  const tabs = [
    { id: 'all', name: 'All Orders', count: orders.length },
    { id: 'ordered', name: 'Ordered', count: orders.filter(o => o.order_status === 'ordered').length },
    { id: 'packed', name: 'Packed', count: orders.filter(o => o.order_status === 'packed').length },
    { id: 'out for delivery', name: 'Out for Delivery', count: orders.filter(o => o.order_status === 'out for delivery').length },
    { id: 'delivered', name: 'Delivered', count: orders.filter(o => o.order_status === 'delivered').length },
    { id: 'failed', name: 'Failed', count: orders.filter(o => o.order_status === 'failed').length }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your <span className="text-green-600">Orders</span>
          </h1>
          <p className="text-xl text-gray-600">
            Track and manage your fruit orders
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No orders found</h3>
              <p className="text-gray-600 mb-8">
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
              <div key={order.id} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                  <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                    {getStatusIcon(order.order_status)}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">#{order.id}</h3>
                      <p className="text-gray-600">
                        Placed on {firestoreService.timestampToDate(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${getStatusColor(order.order_status)}`}>
                      {order.order_status}
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{order.total_amount}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Items Ordered</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="text-center">
                        <img
                          src={item.imageUrls?.[0] || 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=400'}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg mx-auto mb-2"
                        />
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
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
                    <button className="flex items-center justify-center px-6 py-2 border-2 border-orange-500 text-orange-500 rounded-full hover:bg-orange-50 transition-colors font-semibold">
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