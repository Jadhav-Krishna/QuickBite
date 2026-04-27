import { useEffect, useState } from 'react';
import { User, Mail, Phone, Shield, Camera, Award, Package, Heart, LogOut, Edit2, Check, X, MapPin, Plus, Trash2, Navigation, Star } from 'lucide-react';
import { authService, type UserProfile } from '../../api/auth';
import { addressService, getCurrentLocation, reverseGeocode, type Address, type CreateAddressRequest } from '../../api/address';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ModernProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'addresses'>('profile');

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');

  // Password states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Address states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [addressForm, setAddressForm] = useState<CreateAddressRequest>({
    label: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    latitude: undefined,
    longitude: undefined,
    isDefault: false,
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      navigate('/login');
      return;
    }
    loadProfile();
    loadAddresses();
  }, [user, navigate]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await authService.getProfile();
      setProfile(data);
      setFullName(data.fullName || '');
      setPhone(data.phone || '');
      setProfilePictureUrl(data.profilePictureUrl || '');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const loadAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const data = await addressService.getAllAddresses();
      setAddresses(data);
    } catch (err: unknown) {
      // Silently fail for addresses - user can still use profile without addresses
      console.error('Failed to load addresses:', err);
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    setError(null);
    try {
      console.log('Getting current location...');
      const coords = await getCurrentLocation();
      console.log('Coordinates:', coords);
      
      console.log('Reverse geocoding...');
      const address = await reverseGeocode(coords.latitude, coords.longitude);
      console.log('Address:', address);
      
      setAddressForm(prev => ({
        ...prev,
        addressLine1: address.addressLine1,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));
      
      setSuccess('Location detected successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      console.error('Location detection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to detect location');
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleSaveAddress = async () => {
    try {
      const payload = {
        ...addressForm,
        latitude: addressForm.latitude || undefined,
        longitude: addressForm.longitude || undefined,
      };
      
      if (editingAddressId) {
        await addressService.updateAddress(editingAddressId, payload);
      } else {
        await addressService.createAddress(payload);
      }
      await loadAddresses();
      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddressForm({
        label: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        latitude: undefined,
        longitude: undefined,
        isDefault: false,
      });
      setSuccess(editingAddressId ? 'Address updated!' : 'Address added!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save address');
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      label: address.label,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      latitude: address.latitude,
      longitude: address.longitude,
      isDefault: address.isDefault,
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('Delete this address?')) return;
    try {
      await addressService.deleteAddress(id);
      await loadAddresses();
      setSuccess('Address deleted!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await addressService.setDefaultAddress(id);
      await loadAddresses();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to set default address');
    }
  };

  const handleUpdateProfile = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const updated = await authService.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        profilePictureUrl: profilePictureUrl.trim() || undefined,
      });
      setProfile(updated);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      setSuccess('Password changed successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await authService.logoutFromServer();
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'CUSTOMER':
        return 'bg-blue-100 text-blue-700';
      case 'RESTAURANT_OWNER':
        return 'bg-purple-100 text-purple-700';
      case 'DELIVERY_AGENT':
        return 'bg-green-100 text-green-700';
      case 'APPLICATION_ADMIN':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
              {/* Avatar */}
              <div className="relative inline-block mb-6">
                {profilePictureUrl ? (
                  <img
                    src={profilePictureUrl}
                    alt={profile?.fullName}
                    className="w-32 h-32 rounded-full object-cover border-4 border-red-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-4xl font-black border-4 border-red-100">
                    {getInitials(profile?.fullName || 'U')}
                  </div>
                )}
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition shadow-lg">
                  <Camera size={18} />
                </button>
              </div>

              {/* Name & Role */}
              <h2 className="text-2xl font-black text-gray-900 mb-2">{profile?.fullName}</h2>
              <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold ${getRoleBadgeColor(profile?.role || 'CUSTOMER')}`}>
                {profile?.role?.replace('_', ' ')}
              </span>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100">
                <div>
                  <div className="text-2xl font-black text-red-600">24</div>
                  <div className="text-xs text-gray-500 font-semibold">Orders</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-red-600">12</div>
                  <div className="text-xs text-gray-500 font-semibold">Reviews</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-red-600">5</div>
                  <div className="text-xs text-gray-500 font-semibold">Favorites</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8 space-y-3">
                <button
                  onClick={() => navigate('/customer/history')}
                  className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Package size={18} />
                  Order History
                </button>
                <button
                  onClick={() => navigate('/customer/reviews')}
                  className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Star size={18} />
                  My Reviews
                </button>
                <button
                  onClick={() => navigate('/wallet')}
                  className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Award size={18} />
                  My Wallet
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-gray-900">Personal Information</h3>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-bold text-sm"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={saving}
                      className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-700 transition disabled:opacity-50"
                    >
                      <Check size={16} />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setFullName(profile?.fullName || '');
                        setPhone(profile?.phone || '');
                        setProfilePictureUrl(profile?.profilePictureUrl || '');
                      }}
                      className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-200 transition"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <User size={16} />
                    Full Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-semibold">
                      {profile?.fullName || '-'}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <Mail size={16} />
                    Email Address
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-semibold flex items-center justify-between">
                    <span>{profile?.email}</span>
                    {profile?.isEmailVerified && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <Phone size={16} />
                    Phone Number
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition"
                      placeholder="+919876543210"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-semibold">
                      {profile?.phone || 'Not provided'}
                    </div>
                  )}
                </div>

                {/* Profile Picture URL */}
                {editing && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                      <Camera size={16} />
                      Profile Picture URL
                    </label>
                    <input
                      type="url"
                      value={profilePictureUrl}
                      onChange={(e) => setProfilePictureUrl(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Addresses */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  <MapPin size={24} />
                  Saved Addresses
                </h3>
                <button
                  onClick={() => {
                    setShowAddressForm(true);
                    setEditingAddressId(null);
                    setAddressForm({
                      label: '',
                      addressLine1: '',
                      addressLine2: '',
                      city: '',
                      state: '',
                      pincode: '',
                      latitude: undefined,
                      longitude: undefined,
                      isDefault: false,
                    });
                  }}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-700 transition"
                >
                  <Plus size={16} />
                  Add Address
                </button>
              </div>

              {showAddressForm && (
                <div className="mb-6 p-6 bg-gray-50 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">{editingAddressId ? 'Edit Address' : 'New Address'}</h4>
                    <button
                      onClick={handleDetectLocation}
                      disabled={detectingLocation}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 font-bold text-sm disabled:opacity-50"
                    >
                      <Navigation size={16} />
                      {detectingLocation ? 'Detecting...' : 'Auto-detect'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Label (Home, Work, etc.)"
                      value={addressForm.label}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, label: e.target.value }))}
                      className="col-span-2 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      value={addressForm.addressLine1}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                      className="col-span-2 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2 (Optional)"
                      value={addressForm.addressLine2}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, addressLine2: e.target.value }))}
                      className="col-span-2 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, pincode: e.target.value }))}
                      className="col-span-2 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition"
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Latitude (Optional)"
                      value={addressForm.latitude || ''}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, latitude: e.target.value ? parseFloat(e.target.value) : undefined }))}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition"
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Longitude (Optional)"
                      value={addressForm.longitude || ''}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, longitude: e.target.value ? parseFloat(e.target.value) : undefined }))}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Set as default address</span>
                  </label>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveAddress}
                      className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition"
                    >
                      {editingAddressId ? 'Update' : 'Save'} Address
                    </button>
                    <button
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddressId(null);
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {loadingAddresses ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-semibold">No saved addresses yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="p-4 border-2 border-gray-200 rounded-xl hover:border-red-300 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-black text-gray-900">{address.label}</span>
                            {address.isDefault && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {address.addressLine1}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {!address.isDefault && (
                            <button
                              onClick={() => handleSetDefault(address.id)}
                              className="text-gray-400 hover:text-red-600 transition"
                              title="Set as default"
                            >
                              <Heart size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="text-gray-400 hover:text-blue-600 transition"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-gray-400 hover:text-red-600 transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Security */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  <Shield size={24} />
                  Security
                </h3>
              </div>

              {!showPasswordForm ? (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-4 px-6 rounded-xl transition text-left flex items-center justify-between"
                >
                  <span>Change Password</span>
                  <Edit2 size={18} />
                </button>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50"
                    >
                      {changingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Account Info */}
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Status</span>
                  <span className={`font-bold ${profile?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {profile?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {profile?.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-bold text-gray-900">
                      {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
                {profile?.oauthProvider && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Login Method</span>
                    <span className="font-bold text-gray-900 capitalize">
                      {profile.oauthProvider}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
