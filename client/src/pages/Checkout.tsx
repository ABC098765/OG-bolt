import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Plus, Edit3, Trash2, MapPin, CreditCard, Package, Check } from 'lucide-react';
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
  
  const [addresses, setAddresses] = useState<FirestoreAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<FirestoreAddress | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [loading, setLoading] = useState(true);

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

  // Show loading or sign in prompt if not authenticated
  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sign in required</h2>
            <p className="text-xl text-gray-600 mb-8">
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

  // Redirect to cart if empty
  if (cartState.items.length === 0) {
    navigate('/cart');
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

  const createOrder = async () => {
    if (!selectedAddressId || !selectedPaymentMethod) {
      alert('Please select an address and payment method');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to place this order? Once placed, the order cannot be cancelled.');
    if (!confirmed) return;

    setIsProcessingPayment(true);

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
          
          return {
            product_id: item.productId || item.id?.toString() || '',
            name: item.name,
            quantity: itemQuantity,
            amount: item.amount || `${itemQuantity} ${item.unit || 'pcs'}`,
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

      // Create order
      await firestoreService.createOrder(orderData);

      // Clear cart
      await clearCart();

      // Navigate to success page
      navigate('/order-success');
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Calculate pricing
  const subtotal = cartState.total;
  const deliveryFee = subtotal >= 1000 ? 0 : subtotal >= 500 ? 20 : 40;
  const grandTotal = subtotal + deliveryFee;

  // Step state logic
  const getStepState = (step: number) => {
    if (step === 0) return !showAddressForm && !selectedAddressId ? 'editing' : 'complete';
    if (step === 1) return selectedAddressId ? 'editing' : 'indexed';
    if (step === 2) return isProcessingPayment ? 'editing' : 'indexed';
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
        <span className={`text-xs mt-1 ${state === 'indexed' ? 'text-gray-400' : 'text-gray-700'}`}>
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <button 
            onClick={() => navigate('/cart')}
            className="flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Cart
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="text-green-600">Checkout</span>
          </h1>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <StepCircle step={0} state={getStepState(0)} label="Address" />
            <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
            <StepCircle step={1} state={getStepState(1)} label="Summary" />
            <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
            <StepCircle step={2} state={getStepState(2)} label="Payment" />
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
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
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold mb-4">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={addressName}
                    onChange={(e) => setAddressName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter 10-digit phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Flat/House No. *</label>
                  <input
                    type="text"
                    value={flatNo}
                    onChange={(e) => setFlatNo(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter flat/house number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Building Name *</label>
                  <input
                    type="text"
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter building name"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
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
              <p className="text-gray-600 mt-2">Loading addresses...</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No addresses found. Add one to continue!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedAddressId === address.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
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
                        <h4 className="font-semibold text-gray-900">{address.name}</h4>
                        <p className="text-gray-600">{address.flatNo}</p>
                        <p className="text-gray-600">{address.buildingName}</p>
                        {address.landmark && (
                          <p className="text-gray-600">Landmark: {address.landmark}</p>
                        )}
                        <p className="text-sm text-gray-500">Phone: {address.phone}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditAddress(address);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAddress(address.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
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

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Order Summary
          </h3>
          
          <div className="space-y-4 mb-6">
            {cartState.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × {item.priceLabel || item.displayPrice || `₹${item.price}/${item.unit}`}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900">
                  ₹{(item.unitPrice || item.priceValue || 0) * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span className="text-green-600">₹{grandTotal}</span>
            </div>
          </div>

          {deliveryFee > 0 && (
            <p className="text-sm text-orange-600 mt-4">
              {subtotal < 500 
                ? `Add ₹${500 - subtotal} more for ₹20 delivery!`
                : `Add ₹${1000 - subtotal} more for free delivery!`
              }
            </p>
          )}
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Select Payment Method
          </h3>
          
          <div className="space-y-4">
            <div
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedPaymentMethod === 'cod'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
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
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      💰
                    </div>
                    <span className="font-medium">Cash on Delivery</span>
                  </div>
                </div>
                {selectedPaymentMethod === 'cod' && (
                  <Check className="w-5 h-5 text-green-600" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <button
            onClick={createOrder}
            disabled={!selectedAddressId || !selectedPaymentMethod || isProcessingPayment}
            className="w-full bg-green-600 text-white py-4 px-8 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessingPayment ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Processing Order...
              </>
            ) : (
              'Place Order'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;