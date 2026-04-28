import { useState, useEffect } from 'react';
import { MapPin, Loader2, Navigation, Search } from 'lucide-react';
import { locationService, geolocationUtils, type Address } from '../../services/location/locationService';
import { useAuth } from '../../context/AuthContext';

export default function CustomerLocation() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<Partial<Address>>({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [detectedAddress, setDetectedAddress] = useState<string>('');

  const handleUseMyLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const position = await geolocationUtils.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      setCurrentLocation({ lat: latitude, lng: longitude });

      // Reverse geocode to get address
      const addressText = await geolocationUtils.reverseGeocode(latitude, longitude);
      setDetectedAddress(addressText);

      // Parse address (simplified)
      setAddress((prev) => ({
        ...prev,
        latitude,
        longitude,
      }));
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied. Please enable location access.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information unavailable.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out.');
            break;
        }
      } else {
        setError('Failed to get location');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!user?.userId) {
      setError('Please login to save address');
      return;
    }

    if (!address.addressLine1 || !address.city || !address.state || !address.pincode) {
      setError('Please fill all required fields');
      return;
    }

    if (!address.latitude || !address.longitude) {
      setError('Please select location on map or use "Use My Location"');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await locationService.saveAddress({
        userId: user.userId,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        latitude: address.latitude,
        longitude: address.longitude,
        isDefault: true,
      });

      alert('Address saved successfully!');
    } catch (err) {
      setError('Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-card">
        <h2 className="font-display text-2xl font-black mb-6 flex items-center gap-2">
          <MapPin className="text-red-600" size={24} />
          Delivery Location
        </h2>

        {/* Use My Location Button */}
        <button
          onClick={handleUseMyLocation}
          disabled={loading}
          className="w-full mb-6 flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-4 text-white font-bold shadow-lg hover:bg-red-700 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Detecting Location...
            </>
          ) : (
            <>
              <Navigation size={20} />
              Use My Current Location
            </>
          )}
        </button>

        {/* Detected Address */}
        {detectedAddress && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm font-semibold text-green-800">Detected Location:</p>
            <p className="text-sm text-green-700 mt-1">{detectedAddress}</p>
            {currentLocation && (
              <p className="text-xs text-green-600 mt-2">
                Coordinates: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm font-semibold text-red-800">{error}</p>
          </div>
        )}

        {/* Address Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Address Line 1 *
            </label>
            <input
              type="text"
              value={address.addressLine1}
              onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
              placeholder="House/Flat No., Building Name"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Address Line 2
            </label>
            <input
              type="text"
              value={address.addressLine2}
              onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
              placeholder="Street, Area, Landmark"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">City *</label>
              <input
                type="text"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                placeholder="City"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">State *</label>
              <input
                type="text"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                placeholder="State"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Pincode *</label>
            <input
              type="text"
              value={address.pincode}
              onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
              placeholder="Pincode"
              maxLength={6}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <button
            onClick={handleSaveAddress}
            disabled={loading}
            className="w-full rounded-2xl bg-red-600 px-6 py-4 text-white font-bold shadow-lg hover:bg-red-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Address'}
          </button>
        </div>
      </div>
    </div>
  );
}
