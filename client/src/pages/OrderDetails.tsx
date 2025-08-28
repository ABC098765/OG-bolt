import React from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, Package, Clock, CheckCircle, Truck, MapPin, CreditCard, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { firestoreService } from '../services/firestoreService';
import { FirestoreOrder } from '../types/firestore';

const OrderDetails = () => {
  const { orderId } = useParams();
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  const { state: authState, dispatch: authDispatch } = useAuth();
  const { addToCart } = useCart();
  const [order, setOrder] = React.useState<FirestoreOrder | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Redirect to sign in if not authenticated
  React.useEffect(() => {
    if (!authState.isAuthenticated && authState.user === null) {
      authDispatch({ type: 'SHOW_AUTH_MODAL' });
    }
  }, [authState.isAuthenticated, authDispatch]);

  // Subscribe to real-time order updates
  React.useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    if (orderId && authState.isAuthenticated) {
      try {
        setLoading(true);
        console.log('🔄 Setting up real-time order listener for order:', orderId);
        
        unsubscribe = firestoreService.subscribeToOrder(
          orderId,
          (orderData) => {
            console.log('📦 Order updated - Full data:', orderData);
            console.log('📦 order_status field:', orderData?.order_status);
            console.log('📦 payment_status field:', orderData?.payment_status);
            
            // Admin panel updates payment_status instead of order_status
            if (orderData && orderData.payment_status) {
              orderData.order_status = orderData.payment_status;
              console.log('✅ Using payment_status as order_status:', orderData.payment_status);
            }
            
            setOrder(orderData);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error('Error setting up order subscription:', error);
        setLoading(false);
      }
    }

    return () => {
      if (unsubscribe) {
        console.log('🔌 Cleaning up order listener');
        unsubscribe();
      }
    };
  }, [orderId, authState.isAuthenticated]);

  // Show loading or sign in prompt if not authenticated
  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Sign in required</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Please sign in to view your order details.
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
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Order Not Found</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              The order you're looking for doesn't exist or has been removed.
            </p>
            <button 
              onClick={() => navigate('/orders')}
              className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors font-semibold text-lg"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status?.toLowerCase()?.trim();
    console.log('🎯 Rendering status icon for:', status, '→', normalizedStatus);
    
    switch (normalizedStatus) {
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'out for delivery':
      case 'outfordelivery':
        return <Truck className="w-6 h-6 text-blue-500" />;
      case 'packed':
        return <Package className="w-6 h-6 text-purple-500" />;
      case 'ordered':
      case 'pending': // Map pending to ordered for display
        return <Clock className="w-6 h-6 text-orange-500" />;
      default:
        return <Package className="w-6 h-6 text-gray-500" />;
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate pricing - using same logic as Android app
  const subtotal = order.items.reduce((sum: number, item: any) => {
    // First try totalPrice (camelCase - what Android expects)
    if (item.totalPrice != null && item.totalPrice > 0) {
      return sum + item.totalPrice;
    }
    // Fallback to total_price (snake_case)
    if (item.total_price != null && item.total_price > 0) {
      return sum + item.total_price;
    }
    // Last fallback: calculate from price and quantity
    const itemPrice = item.price || item.numericPrice || 0;
    const itemQuantity = item.quantity || 1;
    return sum + (itemPrice * itemQuantity);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <button 
            onClick={() => navigate('/orders')}
            className="flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Orders
          </button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Order <span className="text-green-600">Details</span>
          </h1>
        </div>

        <div className="space-y-6">
          {/* Order Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                {getStatusIcon(order.order_status)}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">#{order.id}</h2>
                  <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Placed on {firestoreService.timestampToDate(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>at {firestoreService.timestampToDate(order.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${getStatusColor(order.order_status)}`}>
                  {order.order_status === 'pending' ? 'ordered' : order.order_status}
                </span>
                <span className="text-3xl font-bold text-green-600">
                  ₹{order.total_amount}
                </span>
              </div>
            </div>
          </div>

          {/* Order Tracking Status Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Tracking</h3>
            <div className="relative">
              {(() => {
                let currentStatus = order.order_status?.toLowerCase()?.trim();
                // Map pending to ordered for tracking display
                if (currentStatus === 'pending') {
                  currentStatus = 'ordered';
                }
                
                const steps = [
                  { 
                    id: 'ordered', 
                    name: 'Ordered', 
                    icon: <Clock className="w-5 h-5" />,
                    color: 'orange'
                  },
                  { 
                    id: 'packed', 
                    name: 'Packed', 
                    icon: <Package className="w-5 h-5" />,
                    color: 'purple'
                  },
                  { 
                    id: 'out for delivery', 
                    name: 'Out for Delivery', 
                    icon: <Truck className="w-5 h-5" />,
                    color: 'blue'
                  },
                  { 
                    id: 'delivered', 
                    name: 'Delivered', 
                    icon: <CheckCircle className="w-5 h-5" />,
                    color: 'green'
                  }
                ];

                const currentStepIndex = steps.findIndex(step => step.id === currentStatus);
                const isValidStatus = currentStepIndex !== -1;

                return (
                  <div className="flex items-center justify-between relative">
                    {/* Progress Line */}
                    <div className="absolute top-6 left-8 right-8 h-0.5 bg-gray-200 -z-10">
                      <div 
                        className="h-full bg-green-500 transition-all duration-500 ease-in-out"
                        style={{ 
                          width: isValidStatus ? `${(currentStepIndex / (steps.length - 1)) * 100}%` : '0%' 
                        }}
                      />
                    </div>

                    {steps.map((step, index) => {
                      const isActive = step.id === currentStatus;
                      const isCompleted = isValidStatus && index <= currentStepIndex;
                      
                      // Get specific colors for each step
                      const getActiveColors = (color: string) => {
                        switch (color) {
                          case 'orange': return 'bg-orange-500 border-orange-500 text-white shadow-lg scale-110';
                          case 'purple': return 'bg-purple-500 border-purple-500 text-white shadow-lg scale-110';
                          case 'blue': return 'bg-blue-500 border-blue-500 text-white shadow-lg scale-110';
                          case 'green': return 'bg-green-500 border-green-500 text-white shadow-lg scale-110';
                          default: return 'bg-gray-500 border-gray-500 text-white shadow-lg scale-110';
                        }
                      };

                      const getActiveTextColor = (color: string) => {
                        switch (color) {
                          case 'orange': return 'text-orange-600';
                          case 'purple': return 'text-purple-600';
                          case 'blue': return 'text-blue-600';
                          case 'green': return 'text-green-600';
                          default: return 'text-gray-600';
                        }
                      };

                      return (
                        <div key={step.id} className="flex flex-col items-center relative z-10">
                          <div 
                            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                              isActive 
                                ? getActiveColors(step.color)
                                : isCompleted 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'bg-white border-gray-300 text-gray-400'
                            }`}
                          >
                            {isCompleted && !isActive ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              step.icon
                            )}
                          </div>
                          <div className="mt-3 text-center">
                            <p 
                              className={`text-sm font-semibold ${
                                isActive 
                                  ? getActiveTextColor(step.color)
                                  : isCompleted 
                                  ? 'text-green-600' 
                                  : 'text-gray-400'
                              }`}
                            >
                              {step.name}
                            </p>
                            {isActive && (
                              <p className="text-xs text-gray-500 mt-1">Current Status</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <MapPin className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delivery Address</h3>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                <strong>{order.address.name}</strong><br />
                Flat: {order.address.flatNo}<br />
                Building: {order.address.buildingName}<br />
                Phone: {order.address.phone}
              </p>
            </div>
          </div>

          {/* Items Ordered */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Items Ordered</h3>
            <div className="space-y-4">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.imageUrls?.[0] || 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {item.name} ({item.amount}, {item.priceLabel || item.displayPrice})
                      </h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">₹{item.totalPrice || item.total_price || (item.price || item.numericPrice || 0) * (item.quantity || 1)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Price Details</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-300">Subtotal ({order.items.length} items)</span>
                <span className="font-semibold text-gray-900 dark:text-white">₹{subtotal}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-300">Delivery Fee</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {order.delivery_fee === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    `₹${order.delivery_fee}`
                  )}
                </span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-gray-900 dark:text-white">Total Amount</span>
                  <span className="text-green-600">₹{order.total_amount}</span>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Payment Method</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {order.payment_id === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row gap-4">
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
                  className="flex items-center justify-center px-6 py-3 border-2 border-orange-500 text-orange-500 rounded-full hover:bg-orange-50 transition-colors font-semibold"
                >
                  Reorder Items
                </button>
              )}
              
              <button 
                onClick={() => navigate('/orders')}
                className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-semibold"
              >
                View All Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;