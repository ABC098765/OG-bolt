import React from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, Package, Clock, CheckCircle, Truck, MapPin, CreditCard, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { FirestoreOrder } from '../types/firestore';

const OrderDetails = () => {
  const { orderId } = useParams();
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  const { state: authState, dispatch: authDispatch } = useAuth();
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
            console.log('📦 Order updated:', orderData?.order_status);
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sign in required</h2>
            <p className="text-xl text-gray-600 mb-8">
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Not Found</h2>
            <p className="text-xl text-gray-600 mb-8">
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
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'out for delivery':
        return <Truck className="w-6 h-6 text-blue-500" />;
      case 'packed':
        return <Package className="w-6 h-6 text-purple-500" />;
      case 'ordered':
        return <Clock className="w-6 h-6 text-orange-500" />;
      default:
        return <Package className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'out for delivery':
        return 'bg-blue-100 text-blue-800';
      case 'packed':
        return 'bg-purple-100 text-purple-800';
      case 'ordered':
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <button 
            onClick={() => navigate('/orders')}
            className="flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Orders
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Order <span className="text-green-600">Details</span>
          </h1>
        </div>

        <div className="space-y-6">
          {/* Order Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                {getStatusIcon(order.order_status)}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">#{order.id}</h2>
                  <div className="flex items-center space-x-4 text-gray-600">
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
                  {order.order_status}
                </span>
                <span className="text-3xl font-bold text-green-600">
                  ₹{order.total_amount}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <MapPin className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Delivery Address</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800 leading-relaxed">
                <strong>{order.address.name}</strong><br />
                Flat: {order.address.flatNo}<br />
                Building: {order.address.buildingName}<br />
                Phone: {order.address.phone}
              </p>
            </div>
          </div>

          {/* Items Ordered */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Items Ordered</h3>
            <div className="space-y-4">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.imageUrls?.[0] || 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">
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
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Price Details</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal ({order.items.length} items)</span>
                <span className="font-semibold">₹{subtotal}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-semibold">
                  {order.delivery_fee === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    `₹${order.delivery_fee}`
                  )}
                </span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total Amount</span>
                  <span className="text-green-600">₹{order.total_amount}</span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium">
                    {order.payment_id === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {order.order_status === 'delivered' && (
                <button className="flex items-center justify-center px-6 py-3 border-2 border-orange-500 text-orange-500 rounded-full hover:bg-orange-50 transition-colors font-semibold">
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