import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';
import { addressService, type AddressDTO, type CreateAddressRequest } from '../../api/address';
import { orderService, type CreateOrderRequest } from '../../api/order';
import { paymentService } from '../../api/payment';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [addresses, setAddresses] = useState<AddressDTO[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressDTO | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [phone, setPhone] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [newAddress, setNewAddress] = useState<CreateAddressRequest>({
    label: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  const deliveryFee = 49;
  const taxes = totalPrice * 0.05;
  const grandTotal = totalPrice + deliveryFee + taxes;

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      console.log('Loading addresses...');
      const data = await addressService.getAllAddresses();
      console.log('Addresses loaded:', data);
      setAddresses(data);
      const defaultAddr = data.find(a => a.isDefault);
      if (defaultAddr) {
        console.log('Setting default address:', defaultAddr);
        setSelectedAddress(defaultAddr);
      } else if (data.length > 0) {
        console.log('Setting first address:', data[0]);
        setSelectedAddress(data[0]);
      }
      // Only show address form if no addresses exist
      if (data.length === 0) {
        console.log('No addresses found, showing form');
        setShowAddressForm(true);
      } else {
        console.log('Addresses exist, hiding form');
        setShowAddressForm(false);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
      setShowAddressForm(true);
    }
  };

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      // Step 1: Get browser location (latitude, longitude)
      const coords = await addressService.getCurrentLocation();
      
      // Step 2: Convert coordinates to address using Nominatim API
      const address = await addressService.reverseGeocode(coords.latitude, coords.longitude);
      
      // Step 3: Auto-fill the form with detected location and address
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
      
      alert(`Location detected: ${address.addressLine1}, ${address.city}`);
    } catch (error) {
      console.error('Failed to detect location:', error);
      alert(error instanceof Error ? error.message : 'Failed to detect location. Please enter manually.');
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.label || !newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      let addressWithCoords = { ...newAddress };
      
      // Only geocode if coordinates are not already set (from auto-detect)
      if (!newAddress.latitude || !newAddress.longitude) {
        const fullAddress = `${newAddress.addressLine1}, ${newAddress.city}, ${newAddress.state} ${newAddress.pincode}`;
        try {
          const coords = await addressService.geocodeAddress(fullAddress);
          addressWithCoords.latitude = coords.latitude;
          addressWithCoords.longitude = coords.longitude;
        } catch (error) {
          console.warn('Geocoding failed, saving without coordinates:', error);
        }
      }
      
      const created = await addressService.createAddress(addressWithCoords);
      setAddresses([...addresses, created]);
      setSelectedAddress(created);
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
      console.error('Failed to add address:', error);
      alert('Failed to add address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select a delivery address');
      return;
    }
    if (!phone) {
      alert('Please enter your phone number');
      return;
    }

    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.userId || user.id;
      const restaurantId = items[0]?.restaurantId || 1;

      const orderRequest: CreateOrderRequest = {
        customerId: userId,
        restaurantId,
        deliveryAddress: `${selectedAddress.addressLine1}, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.pincode}`,
        deliveryLatitude: selectedAddress.latitude,
        deliveryLongitude: selectedAddress.longitude,
        customerPhone: phone,
        specialInstructions: instructions,
        paymentMethod: 'CASH_ON_DELIVERY',
        items: items.map(item => ({
          menuItemId: item.id,
          itemName: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const order = await orderService.createOrder(orderRequest);
      
      // Create COD payment record
      await paymentService.createCODPayment(order.id, userId, grandTotal);
      
      clearCart();
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <Card className="text-center">
          <h2 className="mb-2 font-serif text-2xl font-bold">Your cart is empty</h2>
          <p className="mb-6 text-[var(--color-on-surface-variant)]">Add items to proceed with checkout.</p>
          <Button variant="primary" onClick={() => navigate('/restaurants')}>Browse Restaurants</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <h1 className="mb-4 font-display text-4xl font-bold">Checkout</h1>

      <Card>
        <h2 className="mb-4 font-serif text-2xl font-bold">Delivery Address</h2>
        
        {addresses.length > 0 ? (
          <>
            <div className="mb-4">
              <p className="text-sm text-slate-600 mb-3 flex items-center gap-2">
                <span className="text-lg">📍</span>
                <span>Select a saved address or add a new one</span>
              </p>
              <div className="space-y-3">
                {addresses.map(addr => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddress(addr)}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                      selectedAddress?.id === addr.id
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-container)] shadow-md'
                        : 'border-[var(--color-outline)] hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-bold text-lg">{addr.label}</p>
                          {addr.isDefault && (
                            <span className="rounded-full bg-[var(--color-primary)] px-2.5 py-0.5 text-xs font-bold text-white">Default</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 font-medium">{addr.addressLine1}</p>
                        {addr.addressLine2 && <p className="text-sm text-slate-600">{addr.addressLine2}</p>}
                        <p className="text-sm text-slate-600 mt-1">{addr.city}, {addr.state} - {addr.pincode}</p>
                        {addr.latitude && addr.longitude && (
                          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <span>📍</span>
                            <span>Location verified</span>
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {selectedAddress?.id === addr.id && (
                          <div className="flex items-center gap-1 text-green-600 font-bold text-sm">
                            <span className="text-lg">✓</span>
                            <span>Selected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {!showAddressForm && (
              <Button variant="secondary" onClick={() => setShowAddressForm(true)} className="w-full">
                + Add New Address
              </Button>
            )}
          </>
        ) : (
          <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <p className="font-bold text-amber-900 mb-1">No saved addresses found</p>
                <p className="text-sm text-amber-800">Please add a delivery address to continue with your order.</p>
              </div>
            </div>
          </div>
        )}
        {showAddressForm && (
          <div className="space-y-4 rounded-xl border-2 border-[var(--color-primary)]/30 bg-slate-50 p-5 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span>🏠</span>
                <span>Add New Address</span>
              </h3>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition"
              >
                <span>📍</span>
                <span>{detectingLocation ? 'Detecting...' : 'Use Current Location'}</span>
              </button>
            </div>
            
            {detectingLocation && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 text-sm text-blue-700 flex items-center gap-2">
                <span className="animate-pulse">📍</span>
                <span>Getting your location... Please allow location access when prompted.</span>
              </div>
            )}
            
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600 mb-3 flex items-start gap-2">
                <span className="text-base">💡</span>
                <span><strong>Tip:</strong> Add detailed address like flat/house number, building name, and nearby landmarks for accurate delivery.</span>
              </p>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Address Label *</label>
                <input
                  type="text"
                  placeholder="e.g., Home, Office, Friend's Place"
                  value={newAddress.label}
                  onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}
                  className="w-full rounded-lg border-2 border-slate-300 p-3 focus:border-[var(--color-primary)] focus:outline-none transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Flat / House No., Building Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Flat 301, Sunrise Apartments"
                  value={newAddress.addressLine1}
                  onChange={e => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                  className="w-full rounded-lg border-2 border-slate-300 p-3 focus:border-[var(--color-primary)] focus:outline-none transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Area, Street, Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Near City Mall, MG Road"
                  value={newAddress.addressLine2}
                  onChange={e => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                  className="w-full rounded-lg border-2 border-slate-300 p-3 focus:border-[var(--color-primary)] focus:outline-none transition"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    placeholder="e.g., Bangalore"
                    value={newAddress.city}
                    onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full rounded-lg border-2 border-slate-300 p-3 focus:border-[var(--color-primary)] focus:outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    placeholder="e.g., Karnataka"
                    value={newAddress.state}
                    onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full rounded-lg border-2 border-slate-300 p-3 focus:border-[var(--color-primary)] focus:outline-none transition"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  placeholder="e.g., 560001"
                  value={newAddress.pincode}
                  onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })}
                  className="w-full rounded-lg border-2 border-slate-300 p-3 focus:border-[var(--color-primary)] focus:outline-none transition"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                />
              </div>
              
              <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-slate-200">
                <input
                  type="checkbox"
                  id="setDefault"
                  checked={newAddress.isDefault || false}
                  onChange={e => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                  className="w-4 h-4 text-[var(--color-primary)] rounded focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <label htmlFor="setDefault" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Set as default address
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button variant="primary" onClick={handleAddAddress} disabled={loading} className="flex-1">
                {loading ? 'Saving Address...' : '✓ Save Address'}
              </Button>
              {addresses.length > 0 && (
                <Button variant="secondary" onClick={() => setShowAddressForm(false)} className="flex-1">
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 font-serif text-2xl font-bold">Contact Details</h2>
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="w-full rounded border p-3"
        />
      </Card>

      <Card>
        <h2 className="mb-4 font-serif text-2xl font-bold">Special Instructions</h2>
        <textarea
          placeholder="Any special instructions for delivery?"
          value={instructions}
          onChange={e => setInstructions(e.target.value)}
          className="w-full rounded border p-3"
          rows={3}
        />
      </Card>

      <Card>
        <h2 className="mb-4 font-serif text-2xl font-bold">Order Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rs {totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>Rs {deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxes</span>
            <span>Rs {taxes.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-xl font-bold">
            <span>Total</span>
            <span>Rs {grandTotal.toFixed(2)}</span>
          </div>
        </div>
        <Button
          variant="primary"
          fullWidth
          onClick={handlePlaceOrder}
          disabled={loading || !selectedAddress}
          className="mt-6"
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </Button>
      </Card>
    </div>
  );
}
