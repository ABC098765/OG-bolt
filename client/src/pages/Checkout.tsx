import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Plus, Edit3, Trash2, MapPin, CreditCard, Package, Check, XCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { FirestoreAddress } from '../types/firestore';

const Checkout = () => {
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  const { state: cartState, dispatch: cartDispatch } = useCart();
  const { clearCart } = useCart();
  const { state: authState, dispatch: authDispatch } = useAuth();
  
  // Track component mount status to prevent state updates on unmounted component
  const isMountedRef = useRef(true);
  
  const [addresses, setAddresses] = useState<FirestoreAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<FirestoreAddress | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderError, setOrderError] = useState<string>('');
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [lastOrderId, setLastOrderId] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'checkout' | 'payment'>('checkout');

  // Form fields
  const [addressName, setAddressName] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [landmark, setLandmark] = useState('');
  const [phone, setPhone] = useState('');

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!authState.isAuthenticated && authState.user === null) {
      authDispatch({ type: 'SHOW_AUTH_MODAL' });
    }
  }, [authState.isAuthenticated, authDispatch]);

  // Load addresses
  useEffect(() => {
    const loadAddresses = async () => {
      if (authState.user) {
        try {
          setLoading(true);
          const userAddresses = await firestoreService.getUserAddresses(authState.user.id);
          setAddresses(userAddresses);
        } catch (error) {
          console.error('Error loading addresses:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadAddresses();
  }, [authState.user]);

  // Redirect to cart if empty (but not during order processing)
  useEffect(() => {
    if (cartState.items.length === 0 && !isProcessingPayment) {
      navigate('/cart');
    }
  }, [cartState.items.length, navigate, isProcessingPayment]);

  // Cleanup mounted ref on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Show loading or sign in prompt if not authenticated
  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Sign in required</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Please sign in to proceed with checkout.
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

  if (cartState.items.length === 0 && !isProcessingPayment) {
    return null;
  }

  const startAddAddress = () => {
    setEditingAddress(null);
    setAddressName('');
    setFlatNo('');
    setBuildingName('');
    setLandmark('');
    setPhone(authState.user?.phone?.replace('+91', '') || '');
    setShowAddressForm(true);
  };

  const startEditAddress = (address: FirestoreAddress) => {
    setEditingAddress(address);
    setAddressName(address.name);
    setFlatNo(address.flatNo);
    setBuildingName(address.buildingName);
    setLandmark(address.landmark || '');
    setPhone(address.phone || '');
    setShowAddressForm(true);
  };

  const saveAddress = async () => {
    try {
      // Validate required fields
      if (!addressName.trim()) {
        alert('Please enter a name');
        return;
      }
      if (!flatNo.trim()) {
        alert('Please enter flat/house number');
        return;
      }
      if (!buildingName.trim()) {
        alert('Please enter building name');
        return;
      }
      if (!phone.trim()) {
        alert('Please enter a phone number');
        return;
      }
      if (phone.trim().length !== 10) {
        alert('Phone number must be 10 digits');
        return;
      }

      const addressData: Omit<FirestoreAddress, 'id'> = {
        name: addressName.trim(),
        phone: phone.trim(),
        flatNo: flatNo.trim(),
        buildingName: buildingName.trim(),
        landmark: landmark.trim() || undefined,
      };

      if (editingAddress) {
        await firestoreService.updateUserAddress(authState.user!.id, editingAddress.id, addressData);
        setAddresses(prev => prev.map(addr => 
          addr.id === editingAddress.id 
            ? { ...addr, ...addressData }
            : addr
        ));
      } else {
        const newAddress = await firestoreService.saveAddress(authState.user!.id, addressData);
        setAddresses(prev => [...prev, newAddress]);
      }

      cancelAddressForm();
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Error saving address. Please try again.');
    }
  };

  const deleteAddress = async (addressId: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await firestoreService.deleteUserAddress(authState.user!.id, addressId);
        setAddresses(prev => prev.filter(addr => addr.id !== addressId));
        if (selectedAddressId === addressId) {
          setSelectedAddressId('');
        }
      } catch (error) {
        console.error('Error deleting address:', error);
        alert('Error deleting address. Please try again.');
      }
    }
  };

  const cancelAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressName('');
    setFlatNo('');
    setBuildingName('');
    setLandmark('');
    setPhone('');
  };

  // Helper function to sleep for retry delays
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Helper function to determine if error is retryable
  const isRetryableError = (error: any): boolean => {
    const errorMessage = error?.message?.toLowerCase() || '';
    const isNetworkError = errorMessage.includes('network') || 
                          errorMessage.includes('timeout') || 
                          errorMessage.includes('connection') ||
                          errorMessage.includes('fetch');
    const isServerError = error?.code >= 500 && error?.code < 600;
    return isNetworkError || isServerError;
  };

  // Helper function to verify if order was actually created
  const verifyOrderCreation = async (orderData: any, maxAttempts = 3): Promise<string | null> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🔍 Verification attempt ${attempt}: Checking if order was created...`);
        
        // Get recent orders and check if any match our order data
        const userOrders = await firestoreService.getUserOrders(authState.user!.id);
        
        // Look for an order that matches our data (created within last 5 minutes)
        const recentOrder = userOrders.find(order => {
          const createdAtSeconds = order.created_at?.seconds ?? 0;
          const isRecent = Date.now() - createdAtSeconds * 1000 < 5 * 60 * 1000;
          const matchesTotal = (order.total_amount ?? 0) === (orderData.total_amount ?? 0);
          const matchesItemCount = (order.items?.length ?? 0) === (orderData.items?.length ?? 0);
          return isRecent && matchesTotal && matchesItemCount;
        });

        if (recentOrder) {
          console.log('✅ Order verification successful! Found order:', recentOrder.id);
          return recentOrder.id;
        }
        
        if (attempt < maxAttempts) {
          console.log(`⏳ Order not found yet, waiting before next verification attempt...`);
          await sleep(2000 * attempt); // Increasing delay
        }
      } catch (verifyError) {
        console.error(`❌ Verification attempt ${attempt} failed:`, verifyError);
        if (attempt < maxAttempts) {
          await sleep(1000 * attempt);
        }
      }
    }
    
    console.log('⚠️ Order verification failed - could not confirm order creation');
    return null;
  };

  // Main order creation function with retry logic
  const createOrderWithRetry = async (orderData: any, attempt = 1): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    const maxAttempts = 3;
    
    try {
      console.log(`🚀 Order creation attempt ${attempt}/${maxAttempts}`);
      
      // Save attempt to local storage for persistence
      localStorage.setItem('orderAttempt', JSON.stringify({ attempt, orderData, timestamp: Date.now() }));
      
      // Create order
      const createdOrder = await firestoreService.createOrder(orderData);
      const orderId = createdOrder.id;
      
      console.log('✅ Order created successfully:', orderId);
      
      // Verify order was actually created
      const verifiedOrderId = await verifyOrderCreation(orderData);
      
      if (verifiedOrderId) {
        // Clear stored attempt data
        localStorage.removeItem('orderAttempt');
        return { success: true, orderId: verifiedOrderId };
      } else {
        console.log('⚠️ Order created but verification failed, treating as success');
        localStorage.removeItem('orderAttempt');
        return { success: true, orderId };
      }
      
    } catch (error) {
      console.error(`❌ Order creation attempt ${attempt} failed:`, error);
      
      // Check if we should retry
      if (attempt < maxAttempts && isRetryableError(error)) {
        console.log(`🔄 Retrying order creation (attempt ${attempt + 1}/${maxAttempts})...`);
        
        // Update retry attempt state for UI
        setRetryAttempt(attempt);
        
        // Exponential backoff: 2s, 4s, 8s
        const delayMs = Math.pow(2, attempt) * 1000;
        await sleep(delayMs);
        
        // First, check if order might have been created despite the error
        const verifiedOrderId = await verifyOrderCreation(orderData);
        if (verifiedOrderId) {
          console.log('✅ Order was actually created despite error! Order ID:', verifiedOrderId);
          localStorage.removeItem('orderAttempt');
          setRetryAttempt(0);
          return { success: true, orderId: verifiedOrderId };
        }
        
        // Retry the creation
        return createOrderWithRetry(orderData, attempt + 1);
      }
      
      // No more retries or non-retryable error
      localStorage.removeItem('orderAttempt');
      
      let errorMessage = 'Failed to create order after multiple attempts.';
      if (!isRetryableError(error)) {
        errorMessage = 'Order creation failed. Please check your information and try again.';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const handleContinue = () => {
    if (!selectedAddressId) {
      setOrderError('Please select a delivery address');
      return;
    }
    setCurrentStep('payment');
    setOrderError(''); // Clear any previous errors
  };

  const handleBackToCheckout = () => {
    setCurrentStep('checkout');
    setOrderError('');
  };

  const createOrder = async () => {
    if (!selectedAddressId || !selectedPaymentMethod) {
      setOrderError('Please select an address and payment method');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to place this order? Once placed, the order cannot be cancelled.');
    if (!confirmed) return;

    setIsProcessingPayment(true);
    setOrderError('');
    setRetryAttempt(0);

    try {
      const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
      if (!selectedAddress) {
        throw new Error('Selected address not found');
      }

      // Calculate totals
      const subtotal = cartState.total;
      const deliveryFee = subtotal >= 1000 ? 0 : subtotal >= 500 ? 20 : 40;
      const totalAmount = subtotal + deliveryFee;

      // Prepare order data
      const orderData = {
        user_id: authState.user!.id,
        address: selectedAddress,
        total_amount: totalAmount,
        delivery_fee: deliveryFee,
        payment_status: selectedPaymentMethod === 'cod' ? 'pending' : 'paid',
        payment_id: selectedPaymentMethod === 'cod' ? 'COD' : 'ONLINE_PAYMENT',
        order_status: 'ordered',
        items: cartState.items.map(item => {
          const itemPrice = item.unitPrice || item.priceValue || 0;
          const itemQuantity = item.quantity || 1;
          const totalPrice = itemPrice * itemQuantity;
          
          // Create unit price display that matches Android app format
          const unitPriceWithUnit = item.priceLabel || (item.unit === 'kg' ? `₹${itemPrice}/kg` : 
                                                      item.unit === 'piece' ? `₹${itemPrice}/piece` : 
                                                      item.unit === 'box' ? `₹${itemPrice}/box` : 
                                                      `₹${itemPrice}`);
          
          // Calculate amount correctly to avoid quantity squaring bug
          const correctAmount = (() => {
            const normalizedUnit = (item.unit || 'piece').toLowerCase();
            if (normalizedUnit.includes('kg') || normalizedUnit.includes('g')) return `${itemQuantity}kg`;
            if (normalizedUnit.includes('piece') || normalizedUnit.includes('pc')) return `${itemQuantity} pcs`;
            if (normalizedUnit.includes('box')) return `${itemQuantity} box`;
            return `${itemQuantity} pcs`;
          })();

          return {
            product_id: item.productId || item.id?.toString() || '',
            name: item.name,
            quantity: 1, // Always 1 to match Android app format - admin calculates from amount
            amount: correctAmount, // This contains the actual quantity like "2kg"
            unit: item.unit || 'piece',
            displayPrice: item.priceLabel || unitPriceWithUnit,
            unitPriceDisplay: unitPriceWithUnit, // Include unit for Android app compatibility
            priceLabel: item.priceLabel || unitPriceWithUnit, // Ensure priceLabel is also saved for consistency
            numericPrice: itemPrice,
            price: itemPrice,
            totalPrice: totalPrice,
            total_price: totalPrice,
            imageUrls: item.imageUrls || [item.image].filter((url): url is string => url !== undefined),
          };
        }),
      };

      // Create order with retry logic
      const result = await createOrderWithRetry(orderData);
      
      if (result.success && result.orderId) {
        console.log('🎉 Order placement successful!');
        if (isMountedRef.current) {
          setLastOrderId(result.orderId);
        }
        
        // Only clear cart after successful order verification
        try {
          await clearCart();
          console.log('🛒 Cart cleared successfully');
        } catch (cartError) {
          console.error('⚠️ Order created but cart clearing failed:', cartError);
          // Don't fail the entire process if cart clearing fails
        }
        
        // Set processing to false before navigation to prevent early returns
        if (isMountedRef.current) {
          setIsProcessingPayment(false);
        }
        
        // Navigate to success page only if component is still mounted
        if (isMountedRef.current) {
          navigate('/order-success');
        }
      } else {
        // Order creation failed
        if (isMountedRef.current) {
          setOrderError(result.error || 'Unknown error occurred');
        }
        console.error('💥 Order creation failed:', result.error);
      }
      
    } catch (error) {
      console.error('💥 Unexpected error in order creation:', error);
      if (isMountedRef.current) {
        setOrderError('An unexpected error occurred. Please try again.');
      }
    } finally {
      if (isMountedRef.current) {
        setIsProcessingPayment(false);
      }
    }
  };

  // Check for interrupted order on component mount
  useEffect(() => {
    const checkInterruptedOrder = async () => {
      const storedAttempt = localStorage.getItem('orderAttempt');
      if (storedAttempt && authState.user) {
        try {
          const { orderData, timestamp } = JSON.parse(storedAttempt);
          
          // Only check if the attempt was recent (within last 10 minutes)
          if (Date.now() - timestamp < 10 * 60 * 1000) {
            console.log('🔍 Checking for interrupted order...');
            
            const verifiedOrderId = await verifyOrderCreation(orderData);
            if (verifiedOrderId) {
              console.log('✅ Found interrupted order that was actually created:', verifiedOrderId);
              localStorage.removeItem('orderAttempt');
              
              // Clear cart and navigate to success only if component is still mounted
              try {
                await clearCart();
                if (isMountedRef.current) {
                  navigate('/order-success');
                }
              } catch (error) {
                console.error('Error handling interrupted order:', error);
              }
            } else {
              // Clean up old attempt data
              localStorage.removeItem('orderAttempt');
            }
          } else {
            // Clean up old attempt data
            localStorage.removeItem('orderAttempt');
          }
        } catch (error) {
          console.error('Error checking interrupted order:', error);
          localStorage.removeItem('orderAttempt');
        }
      }
    };

    if (authState.user && !loading) {
      checkInterruptedOrder();
    }
  }, [authState.user, loading]);

  // Calculate pricing
  const subtotal = cartState.total;
  const deliveryFee = subtotal >= 1000 ? 0 : subtotal >= 500 ? 20 : 40;
  const grandTotal = subtotal + deliveryFee;

  // Step state logic
  const getStepState = (step: number) => {
    if (step === 0) return !showAddressForm && selectedAddressId ? 'complete' : 'editing';
    if (step === 1) return currentStep === 'payment' && selectedPaymentMethod ? 'complete' : currentStep === 'payment' ? 'editing' : 'indexed';
    if (step === 2) return 'indexed'; // Confirmation step - not implemented yet
    return 'indexed';
  };

  const StepCircle = ({ step, state, label }: { step: number; state: string; label: string }) => {
    const getColor = () => {
      switch (state) {
        case 'complete': return 'bg-green-600';
        case 'editing': return 'bg-orange-500';
        default: return 'bg-gray-300';
      }
    };

    const getIcon = () => {
      switch (state) {
        case 'complete': return <Check className="w-4 h-4" />;
        case 'editing': return <Edit3 className="w-4 h-4" />;
        default: return <div className="w-2 h-2 bg-white rounded-full" />;
      }
    };

    return (
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getColor()}`}>
          {getIcon()}
        </div>
        <span className={`text-xs mt-1 ${state === 'indexed' ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <button 
            onClick={() => navigate('/cart')}
            className="flex items-center text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Cart
          </button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            <span className="text-green-600">Checkout</span>
          </h1>
        </div>

        {/* Progress Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <StepCircle step={0} state={getStepState(0)} label="Address" />
            <div className="flex-1 h-0.5 bg-gray-300 dark:bg-gray-600 mx-4"></div>
            <StepCircle step={1} state={getStepState(1)} label="Payment" />
            <div className="flex-1 h-0.5 bg-gray-300 dark:bg-gray-600 mx-4"></div>
            <StepCircle step={2} state={getStepState(2)} label="Confirmation" />
          </div>
        </div>

        {/* Address Section */}
        {currentStep === 'checkout' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Select Delivery Address
            </h3>
            <button
              onClick={startAddAddress}
              disabled={showAddressForm}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </button>
          </div>

          {/* Address Form */}
          {showAddressForm && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                  <input
                    type="text"
                    value={addressName}
                    onChange={(e) => setAddressName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter 10-digit phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Flat/House No. *</label>
                  <input
                    type="text"
                    value={flatNo}
                    onChange={(e) => setFlatNo(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter flat/house number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Building Name *</label>
                  <input
                    type="text"
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter building name"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter landmark"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={saveAddress}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Save Address
                </button>
                <button
                  onClick={cancelAddressForm}
                  className="flex-1 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Address List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Loading addresses...</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No addresses found. Add one to continue!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedAddressId === address.id
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedAddressId(address.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                        className="mt-1"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{address.name}</h4>
                        <p className="text-gray-600 dark:text-gray-300">{address.flatNo}</p>
                        <p className="text-gray-600 dark:text-gray-300">{address.buildingName}</p>
                        {address.landmark && (
                          <p className="text-gray-600 dark:text-gray-300">Landmark: {address.landmark}</p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone: {address.phone}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditAddress(address);
                        }}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAddress(address.id);
                        }}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Order Summary */}
        {currentStep === 'checkout' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Order Summary
          </h3>
          
          <div className="space-y-4 mb-6">
            {cartState.items.map((item, index) => (
              <div key={item.productId || item.id || index} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.imageUrls?.[0] || (item as any)['image_urls']?.[0] || (item as any).image || 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {item.quantity} × {item.priceLabel || item.displayPrice || `₹${item.price}/${item.unit}`}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ₹{(item.unitPrice || item.priceValue || 0) * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2 border-t dark:border-gray-600">
              <span>Total</span>
              <span className="text-green-600">₹{grandTotal}</span>
            </div>
          </div>

          {deliveryFee > 0 && (
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-4">
              {subtotal < 500 
                ? `Add ₹${500 - subtotal} more for ₹20 delivery!`
                : `Add ₹${1000 - subtotal} more for free delivery!`
              }
            </p>
          )}
        </div>
        )}

        {/* Payment Method */}
        {currentStep === 'payment' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Select Payment Method
          </h3>
          
          <div className="space-y-4">
            <div
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedPaymentMethod === 'cod'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
              onClick={() => setSelectedPaymentMethod('cod')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    checked={selectedPaymentMethod === 'cod'}
                    onChange={() => setSelectedPaymentMethod('cod')}
                  />
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                      <img 
                        src="/cod-icon.png" 
                        alt="Cash on Delivery" 
                        className="w-8 h-8 rounded-full"
                      />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">Cash on Delivery</span>
                  </div>
                </div>
                {selectedPaymentMethod === 'cod' && (
                  <Check className="w-5 h-5 text-green-600" />
                )}
              </div>
            </div>
            
            {/* Online Payment - Disabled */}
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 opacity-60 cursor-not-allowed">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    disabled
                    className="cursor-not-allowed"
                  />
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      💳
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Online Payment</span>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Cards • UPI • Net Banking</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 pl-11">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  📱 Download our app for online payment
                </p>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Error Message */}
        {orderError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Order Failed</h3>
                <p className="text-red-700 dark:text-red-300 mb-4">{orderError}</p>
                <div className="space-y-2">
                  <p className="text-sm text-red-600 dark:text-red-400">What you can do:</p>
                  <ul className="text-sm text-red-600 dark:text-red-400 list-disc list-inside space-y-1">
                    <li>Check your internet connection and try again</li>
                    <li>Verify your address and payment method are correct</li>
                    <li>If the problem persists, check your Orders page to see if the order was created</li>
                  </ul>
                </div>
                <button
                  onClick={() => setOrderError('')}
                  className="mt-4 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Continue/Place Order Button */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          {currentStep === 'payment' && (
            <button
              onClick={handleBackToCheckout}
              className="w-full mb-4 border-2 border-green-600 text-green-600 py-3 px-6 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 transition-colors font-semibold"
            >
              ← Back to Address & Summary
            </button>
          )}
          
          <button
            onClick={currentStep === 'checkout' ? handleContinue : createOrder}
            disabled={
              currentStep === 'checkout' 
                ? !selectedAddressId 
                : !selectedAddressId || !selectedPaymentMethod || isProcessingPayment
            }
            className="w-full bg-green-600 text-white py-4 px-8 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessingPayment ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Processing Order...
                {retryAttempt > 0 && <span className="ml-2 text-sm">(Attempt {retryAttempt}/3)</span>}
              </>
            ) : (
              currentStep === 'checkout' ? 'Continue' : 'Place Order'
            )}
          </button>
          
          {currentStep === 'checkout' && !selectedAddressId && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2 text-center">Please select a delivery address</p>
          )}
          {currentStep === 'payment' && !selectedPaymentMethod && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2 text-center">Please select a payment method</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;