import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import type { CreateOrderRequest } from '../api/order';
import { orderService } from '../api/order';
import { paymentService } from '../api/payment';
import { getCurrentUser, requireCurrentUserId } from '../utils/session';
import { getRazorpayKeyId, loadRazorpayScript, openRazorpayCheckout } from '../utils/razorpay';
import type { AddressDTO, CreateAddressRequest } from '../api/address';
import { addressService } from '../api/address';

type CheckoutPaymentMethod = 'CASH_ON_DELIVERY' | 'WALLET' | 'UPI' | 'CREDIT_CARD';

export default function Checkout() {
  const navigate = useNavigate();
  const { 
    items, 
    subtotal,
    discountAmount,
    totalPrice: cartTotal,
    promoCode,
    appliedPromoCode,
    applyPromoCode,
    removePromoCode,
    clearCart 
  } = useCart();

  const [addresses, setAddresses] = useState<AddressDTO[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressDTO | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>('CASH_ON_DELIVERY');
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [newAddress, setNewAddress] = useState<CreateAddressRequest>({
    label: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  const deliveryFee = items.length > 0 ? 49 : 0;
  const finalAmount = cartTotal + deliveryFee;

  const restaurantId = useMemo(() => items[0]?.restaurantId, [items]);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const data = await addressService.getAllAddresses();
      setAddresses(data);
      const defaultAddr = data.find(a => a.isDefault);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
        setDeliveryAddress(`${defaultAddr.addressLine1}, ${defaultAddr.city}, ${defaultAddr.state} ${defaultAddr.pincode}`);
      } else if (data.length > 0) {
        setSelectedAddress(data[0]);
        setDeliveryAddress(`${data[0].addressLine1}, ${data[0].city}, ${data[0].state} ${data[0].pincode}`);
      }
      if (data.length === 0) {
        setShowAddressForm(true);
      }
    } catch (error) {
      setShowAddressForm(true);
    }
  };

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    setError(null);
    setLocationSuccess(false);
    try {
      const coords = await addressService.getCurrentLocation();
      const address = await addressService.reverseGeocode(coords.latitude, coords.longitude);
      setNewAddress({
        ...newAddress,
        addressLine1: address.addressLine1 || '',
        addressLine2: '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      setLocationSuccess(true);
      setTimeout(() => setLocationSuccess(false), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to detect location.';
      setError(errorMsg);
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.label || !newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      setError('Please fill in all required fields');
      return;
    }
    try {
      setLoading(true);
      let addressWithCoords = { ...newAddress };
      if (!newAddress.latitude || !newAddress.longitude) {
        const fullAddress = `${newAddress.addressLine1}, ${newAddress.city}, ${newAddress.state} ${newAddress.pincode}`;
        try {
          const coords = await addressService.geocodeAddress(fullAddress);
          addressWithCoords.latitude = coords.latitude;
          addressWithCoords.longitude = coords.longitude;
        } catch (error) {
          // Continue without coordinates
        }
      }
      const created = await addressService.createAddress(addressWithCoords);
      setAddresses([...addresses, created]);
      setSelectedAddress(created);
      setDeliveryAddress(`${created.addressLine1}, ${created.city}, ${created.state} ${created.pincode}`);
      setShowAddressForm(false);
      setNewAddress({
        label: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false,
      });
    } catch (error) {
      setError('Failed to add address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = (addr: AddressDTO) => {
    setSelectedAddress(addr);
    setDeliveryAddress(`${addr.addressLine1}, ${addr.city}, ${addr.state} ${addr.pincode}`);
  };

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    setIsApplyingPromo(true);
    setPromoError('');

    try {
      await applyPromoCode(promoInput.trim().toUpperCase());
      setPromoInput('');
    } catch (error: any) {
      setPromoError(error.message || 'Invalid promo code');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = async () => {
    try {
      await removePromoCode();
      setPromoInput('');
      setPromoError('');
    } catch (error) {
      console.error('Failed to remove promo code:', error);
    }
  };

  const buildCreateOrderPayload = (customerId: number): CreateOrderRequest => ({
    customerId,
    restaurantId: restaurantId!,
    deliveryAddress: deliveryAddress.trim(),
    deliveryLatitude: selectedAddress?.latitude,
    deliveryLongitude: selectedAddress?.longitude,
    customerPhone: customerPhone.trim(),
    specialInstructions: specialInstructions.trim() || undefined,
    paymentMethod: paymentMethod === 'CASH_ON_DELIVERY' ? 'CASH_ON_DELIVERY' : paymentMethod === 'WALLET' ? 'ONLINE' : 'CARD',
    items: items.map((item) => ({
      menuItemId: item.id,
      itemName: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    totalAmount: subtotal,
    deliveryCharge: deliveryFee,
    discountAmount: discountAmount,
    finalAmount: finalAmount,
  });

  const handlePlaceOrder = async () => {
    setError(null);

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (!deliveryAddress.trim() || !customerPhone.trim()) {
      setError('Please provide delivery address and phone number.');
      return;
    }

    if (!restaurantId) {
      setError('Unable to identify restaurant for this order.');
      return;
    }

    setLoading(true);
    try {
      const customerId = requireCurrentUserId();
      const currentUser = getCurrentUser();

      if (paymentMethod === 'CASH_ON_DELIVERY') {
        const order = await orderService.createOrder(buildCreateOrderPayload(customerId));
        navigate('/success', {
          state: {
            orderNumber: order.orderNumber,
            amount: order.finalAmount,
          },
        });
        clearCart();
        return;
      }

      if (paymentMethod === 'WALLET') {
        await paymentService.payAmountFromWallet(
          customerId,
          Number(finalAmount.toFixed(2)),
          'Checkout payment via wallet',
        );
        const order = await orderService.createOrder(buildCreateOrderPayload(customerId));
        navigate('/success', {
          state: {
            orderNumber: order.orderNumber,
            amount: order.finalAmount,
          },
        });
        clearCart();
        return;
      }

      const razorpayKey = getRazorpayKeyId();
      if (!razorpayKey) {
        throw new Error('Razorpay key is missing. Set VITE_RAZORPAY_KEY_ID in frontend environment.');
      }

      await loadRazorpayScript();

      // For non-COD flow, collect payment first and place order only after successful verification.
      const temporaryOrderRef = Date.now();
      const initiatedPayment = await paymentService.initiatePayment({
        orderId: temporaryOrderRef,
        customerId,
        amount: Number(finalAmount.toFixed(2)),
        currency: 'INR',
        paymentMethod,
        description: `QuickBite checkout payment`,
        customerEmail: currentUser?.email,
        customerPhone: customerPhone.trim(),
      });

      if (!initiatedPayment.razorpayOrderId) {
        throw new Error('Could not create Razorpay order. Please try again.');
      }
      const razorpayOrderId = initiatedPayment.razorpayOrderId;

      await new Promise<void>((resolve, reject) => {
        openRazorpayCheckout({
          key: razorpayKey,
          amount: Math.round(finalAmount * 100),
          currency: 'INR',
          name: 'QuickBite',
          description: 'Order payment',
          order_id: razorpayOrderId,
          prefill: {
            name: currentUser?.fullName,
            email: currentUser?.email,
            contact: customerPhone.trim(),
          },
          modal: {
            ondismiss: () => {
              void paymentService
                .markPaymentFailed(razorpayOrderId, 'Payment cancelled by user')
                .catch(() => undefined);
              reject(new Error('Payment was cancelled.'));
            },
          },
          handler: async (response) => {
            try {
              await paymentService.verifyPayment(
                response.razorpay_payment_id,
                response.razorpay_signature,
                response.razorpay_order_id,
              );
            } catch (verificationError) {
              const failureMessage = verificationError instanceof Error
                ? verificationError.message
                : 'Payment verification failed';
              try {
                await paymentService.markPaymentFailed(razorpayOrderId, failureMessage);
              } catch {
                // Ignore failure tracking errors so the original verification error surfaces.
              }
              reject(verificationError);
              return;
            }

            try {
              const order = await orderService.createOrder(buildCreateOrderPayload(customerId));
              navigate('/success', {
                state: {
                  orderNumber: order.orderNumber,
                  amount: order.finalAmount,
                },
              });
              clearCart();
              resolve();
            } catch (orderError) {
              reject(orderError);
            }
          },
          theme: {
            color: '#f97316',
          },
        });
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] pb-24">
      <header className="sticky top-0 z-50 flex items-center justify-between bg-[var(--color-surface)]/80 p-6 backdrop-blur-md">
        <Link to="/cart" className="flex items-center gap-2 font-medium text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-primary-container)]">
          <span>←</span> Back to Cart
        </Link>
        <span className="font-display text-xl font-bold">Checkout</span>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 pt-8 md:flex-row md:px-8">
        <div className="flex-1 space-y-8">
          {error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}

          <section>
            <h2 className="mb-6 font-serif text-2xl font-bold text-[var(--color-on-surface)]">Delivery Address</h2>
            <div className="space-y-5 rounded-[2rem] bg-gradient-to-br from-[var(--color-surface-container-lowest)] to-[var(--color-surface-container)] p-8 shadow-lg">
              {addresses.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wide">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>Saved Addresses</span>
                  </div>
                  <div className="space-y-3">
                    {addresses.map(addr => (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectAddress(addr)}
                        className={`group cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 hover:shadow-xl ${
                          selectedAddress?.id === addr.id
                            ? 'border-[var(--color-primary)] bg-gradient-to-br from-[var(--color-primary-container)] to-[var(--color-primary-container)]/50 shadow-lg scale-[1.02]'
                            : 'border-[var(--color-outline)]/30 bg-white hover:border-[var(--color-primary)]/50 hover:scale-[1.01]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="font-bold text-lg text-[var(--color-on-surface)]">{addr.label}</p>
                              {addr.isDefault && (
                                <span className="rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] px-3 py-1 text-xs font-bold text-white shadow-md">Default</span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-[var(--color-on-surface)] mb-1">{addr.addressLine1}</p>
                            {addr.addressLine2 && <p className="text-sm text-[var(--color-on-surface-variant)] mb-1">{addr.addressLine2}</p>}
                            <p className="text-sm text-[var(--color-on-surface-variant)]">{addr.city}, {addr.state} - {addr.pincode}</p>
                            {addr.latitude && addr.longitude && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-green-600 font-medium">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Location Verified</span>
                              </div>
                            )}
                          </div>
                          {selectedAddress?.id === addr.id && (
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 shadow-lg">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!showAddressForm && (
                <button
                  type="button"
                  onClick={() => setShowAddressForm(true)}
                  className="w-full rounded-2xl border-2 border-dashed border-[var(--color-primary)]/40 bg-gradient-to-br from-white to-[var(--color-primary-container)]/10 p-4 text-sm font-bold text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add New Address</span>
                </button>
              )}
              {showAddressForm && (
                <div className="space-y-4 rounded-2xl border-2 border-[var(--color-primary)]/20 bg-gradient-to-br from-white to-[var(--color-surface-container-highest)] p-6 shadow-inner">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-[var(--color-on-surface)]">
                      <svg className="w-6 h-6 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                      <span>Add New Address</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={detectingLocation}
                      className="flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:cursor-not-allowed"
                    >
                      {detectingLocation ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Detecting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span>Use My Location</span>
                        </>
                      )}
                    </button>
                  </div>
                  {detectingLocation && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg p-4 animate-pulse">
                      <p className="font-bold text-sm text-blue-900 mb-1 flex items-center gap-2">
                        <svg className="w-5 h-5 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span>Detecting your location...</span>
                      </p>
                      <p className="text-xs text-blue-700">Please allow location access when prompted by your browser.</p>
                    </div>
                  )}
                  {locationSuccess && (
                    <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 rounded-lg p-4 animate-fade-in">
                      <p className="font-bold text-sm text-green-900 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Location detected successfully! Please verify the details below.</span>
                      </p>
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2">Address Label *</label>
                      <input
                        type="text"
                        placeholder="e.g., Home, Office, Friend's Place"
                        value={newAddress.label}
                        onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}
                        className="w-full rounded-xl border-2 border-[var(--color-outline)]/30 bg-white px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2">Flat / House No., Building Name *</label>
                      <input
                        type="text"
                        placeholder="e.g., Flat 301, Sunrise Apartments"
                        value={newAddress.addressLine1}
                        onChange={e => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                        className="w-full rounded-xl border-2 border-[var(--color-outline)]/30 bg-white px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2">Area, Street, Landmark</label>
                      <input
                        type="text"
                        placeholder="e.g., Near City Mall, MG Road"
                        value={newAddress.addressLine2}
                        onChange={e => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                        className="w-full rounded-xl border-2 border-[var(--color-outline)]/30 bg-white px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2">City *</label>
                        <input
                          type="text"
                          placeholder="e.g., Bangalore"
                          value={newAddress.city}
                          onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="w-full rounded-xl border-2 border-[var(--color-outline)]/30 bg-white px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2">State *</label>
                        <input
                          type="text"
                          placeholder="e.g., Karnataka"
                          value={newAddress.state}
                          onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="w-full rounded-xl border-2 border-[var(--color-outline)]/30 bg-white px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2">Pincode *</label>
                      <input
                        type="text"
                        placeholder="e.g., 560001"
                        value={newAddress.pincode}
                        onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        className="w-full rounded-xl border-2 border-[var(--color-outline)]/30 bg-white px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                        maxLength={6}
                      />
                    </div>
                    
                    <div className="flex items-center gap-3 bg-gradient-to-r from-[var(--color-primary-container)]/20 to-transparent rounded-xl p-4 border border-[var(--color-primary)]/20">
                      <input
                        type="checkbox"
                        id="setDefault"
                        checked={newAddress.isDefault || false}
                        onChange={e => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                        className="w-5 h-5 text-[var(--color-primary)] rounded focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
                      />
                      <label htmlFor="setDefault" className="text-sm font-bold text-[var(--color-on-surface)] cursor-pointer flex items-center gap-2">
                        <svg className="w-5 h-5 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>Set as default address</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleAddAddress}
                      disabled={loading}
                      className="flex-1 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] px-6 py-3.5 text-sm font-bold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Save Address</span>
                        </>
                      )}
                    </button>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="flex-1 rounded-xl border-2 border-[var(--color-outline)] bg-white px-6 py-3.5 text-sm font-bold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-highest)] hover:scale-[1.02] transition-all duration-300"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span>Phone Number *</span>
                  </label>
                  <input
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    className="w-full rounded-xl border-2 border-[var(--color-outline)]/30 bg-white px-4 py-3.5 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                    placeholder="+91 9999999999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Delivery Instructions</span>
                  </label>
                  <textarea
                    value={specialInstructions}
                    onChange={(event) => setSpecialInstructions(event.target.value)}
                    className="w-full rounded-xl border-2 border-[var(--color-outline)]/30 bg-white px-4 py-3.5 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all resize-none"
                    placeholder="e.g., Ring bell once, Leave at door"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl">Payment Method</h2>
            <div className="space-y-3 rounded-[2rem] bg-[var(--color-surface-container-lowest)] p-6 shadow-ambient">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${paymentMethod === 'CASH_ON_DELIVERY' ? 'border-[var(--color-primary-container)] bg-[var(--color-surface-container-low)]' : 'border-transparent bg-[var(--color-surface-container-highest)]'}`}
              >
                Cash on Delivery
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('WALLET')}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${paymentMethod === 'WALLET' ? 'border-[var(--color-primary-container)] bg-[var(--color-surface-container-low)]' : 'border-transparent bg-[var(--color-surface-container-highest)]'}`}
              >
                QuickBite Wallet
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${paymentMethod === 'UPI' ? 'border-[var(--color-primary-container)] bg-[var(--color-surface-container-low)]' : 'border-transparent bg-[var(--color-surface-container-highest)]'}`}
              >
                UPI
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${paymentMethod === 'CREDIT_CARD' ? 'border-[var(--color-primary-container)] bg-[var(--color-surface-container-low)]' : 'border-transparent bg-[var(--color-surface-container-highest)]'}`}
              >
                Card
              </button>
            </div>
          </section>
        </div>

        <div className="w-full md:w-96">
          <div className="sticky top-24 rounded-[2rem] bg-[var(--color-surface-container-lowest)] p-6 shadow-ambient">
            <h2 className="mb-6 font-serif text-2xl">Order Summary</h2>
            <div className="mb-6 space-y-4 border-b border-[var(--color-surface-variant)] pb-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span>
                    {item.quantity} x {item.name}
                  </span>
                  <span>₹ {(item.quantity * item.price).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mb-6 space-y-2">
              <div className="flex justify-between text-[var(--color-on-surface-variant)]">
                <span>Subtotal</span>
                <span>₹ {subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({promoCode})</span>
                  <span>-₹ {discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[var(--color-on-surface-variant)]">
                <span>Delivery Fee</span>
                <span>₹ {deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--color-surface-variant)] pt-3 text-lg font-bold">
                <span>Total</span>
                <span>₹ {finalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Promo Code Section */}
            <div className="mb-6 rounded-2xl bg-gradient-to-br from-[var(--color-primary-container)]/20 to-transparent p-4 border border-[var(--color-primary)]/20">
              <h3 className="mb-3 text-sm font-bold flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span>Have a Promo Code?</span>
              </h3>
              {promoCode ? (
                <div className="rounded-xl bg-green-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      <span className="font-bold text-green-700">{promoCode}</span>
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700 transition hover:bg-green-200"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {appliedPromoCode?.description && (
                    <p className="text-xs text-green-600">{appliedPromoCode.description}</p>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value.toUpperCase());
                        setPromoError('');
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
                      placeholder="Enter code"
                      className="flex-1 rounded-xl border border-[var(--color-outline-variant)] px-3 py-2 text-sm font-semibold uppercase outline-none focus:border-[var(--color-primary)]"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={isApplyingPromo}
                      className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                      {isApplyingPromo ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                  {promoError && (
                    <p className="mt-2 text-xs text-red-500">{promoError}</p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || items.length === 0}
              className={`w-full rounded-[1.5rem] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary-container)] py-4 text-white transition ${loading ? 'cursor-not-allowed opacity-70' : 'hover:scale-[1.01]'}`}
            >
              {loading ? 'Placing order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
