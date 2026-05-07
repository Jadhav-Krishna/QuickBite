import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, ShoppingBag, Clock, Star, Store, Activity, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { restaurantService, type Restaurant, type UpsertRestaurantRequest } from '../../api/restaurant';
import { orderService, type OrderDTO } from '../../api/order';
import ImageUpload from '../../components/ImageUpload';

type RestaurantForm = {
  name: string;
  cuisineType: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phoneNumber: string;
  email: string;
  gstNumber: string;
  fssaiLicenseNumber: string;
  imageUrl: string;
  openingTime: string;
  closingTime: string;
  deliveryFee: string;
  estimatedDeliveryMin: string;
  latitude: string;
  longitude: string;
};

const EMPTY_FORM: RestaurantForm = {
  name: '',
  cuisineType: '',
  description: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  phoneNumber: '',
  email: '',
  gstNumber: '',
  fssaiLicenseNumber: '',
  imageUrl: '',
  openingTime: '10:00',
  closingTime: '23:00',
  deliveryFee: '39',
  estimatedDeliveryMin: '35',
  latitude: '12.9716',
  longitude: '77.5946',
};

const toForm = (restaurant: Restaurant): RestaurantForm => ({
  name: restaurant.name || '',
  cuisineType: restaurant.cuisineType || '',
  description: restaurant.description || '',
  address: restaurant.address || '',
  city: restaurant.city || '',
  state: restaurant.state || '',
  pincode: restaurant.pincode || '',
  phoneNumber: restaurant.phoneNumber || '',
  email: restaurant.email || '',
  gstNumber: restaurant.gstNumber || '',
  fssaiLicenseNumber: restaurant.fssaiLicenseNumber || '',
  imageUrl: restaurant.imageUrl || '',
  openingTime: restaurant.openingTime || '10:00',
  closingTime: restaurant.closingTime || '23:00',
  deliveryFee: String(restaurant.deliveryFee ?? 39),
  estimatedDeliveryMin: String(restaurant.estimatedDeliveryMin ?? 35),
  latitude: String(restaurant.latitude ?? 12.9716),
  longitude: String(restaurant.longitude ?? 77.5946),
});

export default function PartnerDashboard() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [restaurantForm, setRestaurantForm] = useState<RestaurantForm>(EMPTY_FORM);

  const primaryRestaurant = restaurants[0] || null;

  const loadDashboard = async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const ownerRestaurants = await restaurantService.getRestaurantsByOwner(user.userId);
      setRestaurants(ownerRestaurants);

      const rid = ownerRestaurants[0]?.id;
      if (rid) {
        const restaurantOrders = await orderService.getRestaurantOrders(rid);
        setOrders(restaurantOrders);
      } else {
        setOrders([]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load owner dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, [user?.userId]);

  const todayMetrics = useMemo(() => {
    const now = new Date();
    const todayOrders = orders.filter((o) => {
      if (!o.createdAt) return false;
      const d = new Date(o.createdAt);
      return d.getDate() === now.getDate()
        && d.getMonth() === now.getMonth()
        && d.getFullYear() === now.getFullYear();
    });

    return {
      todaysOrders: todayOrders,
      revenue: orders.filter((o) => o.status === 'DELIVERED').reduce((sum, o) => sum + (o.finalAmount || o.totalAmount || 0), 0),
      activeOrders: orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status)).length,
      avgPrep: 18,
    };
  }, [orders]);

  const toggleOpenState = async () => {
    if (!primaryRestaurant?.id) return;
    try {
      const updated = await restaurantService.toggleRestaurantOpen(primaryRestaurant.id);
      setRestaurants((prev) => prev.map((r, i) => (i === 0 ? { ...r, ...updated } : r)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update open status.');
    }
  };

  const openRestaurantForm = () => {
    if (primaryRestaurant) {
      setRestaurantForm(toForm(primaryRestaurant));
    } else {
      setRestaurantForm(EMPTY_FORM);
    }
    setShowRestaurantForm(true);
  };

  const closeRestaurantForm = () => {
    if (saving) return;
    setShowRestaurantForm(false);
  };

  const validateRestaurantForm = () => {
    const required = [
      restaurantForm.name,
      restaurantForm.cuisineType,
      restaurantForm.address,
      restaurantForm.city,
      restaurantForm.state,
      restaurantForm.pincode,
      restaurantForm.phoneNumber,
      restaurantForm.email,
      restaurantForm.gstNumber,
      restaurantForm.fssaiLicenseNumber,
      restaurantForm.imageUrl,
    ];
    return required.every((v) => v.trim().length > 0);
  };

  const handleRestaurantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.userId) return;

    if (!validateRestaurantForm()) {
      setError('Please fill all required restaurant fields.');
      return;
    }

    const payload: UpsertRestaurantRequest = {
      ownerId: user.userId,
      name: restaurantForm.name.trim(),
      cuisineType: restaurantForm.cuisineType.trim(),
      description: restaurantForm.description.trim(),
      address: restaurantForm.address.trim(),
      city: restaurantForm.city.trim(),
      state: restaurantForm.state.trim(),
      pincode: restaurantForm.pincode.trim(),
      phoneNumber: restaurantForm.phoneNumber.trim(),
      email: restaurantForm.email.trim(),
      gstNumber: restaurantForm.gstNumber.trim(),
      fssaiLicenseNumber: restaurantForm.fssaiLicenseNumber.trim(),
      imageUrl: restaurantForm.imageUrl.trim(),
      openingTime: restaurantForm.openingTime,
      closingTime: restaurantForm.closingTime,
      deliveryFee: Number(restaurantForm.deliveryFee),
      estimatedDeliveryMin: Number(restaurantForm.estimatedDeliveryMin),
      latitude: Number(restaurantForm.latitude),
      longitude: Number(restaurantForm.longitude),
    };

    setSaving(true);
    setError(null);
    try {
      if (primaryRestaurant?.id) {
        const updated = await restaurantService.updateRestaurant(primaryRestaurant.id, payload);
        setRestaurants((prev) => (prev.length > 0 ? [{ ...prev[0], ...updated }, ...prev.slice(1)] : [updated]));
      } else {
        const created = await restaurantService.createRestaurant(payload);
        setRestaurants([created]);
      }
      setShowRestaurantForm(false);
      await loadDashboard();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save restaurant.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-12 w-64 bg-[var(--color-surface-variant)] rounded-lg" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-[var(--color-surface-variant)] rounded-[2rem]" />)}
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="h-96 bg-[var(--color-surface-variant)] rounded-[2.5rem]" />
          <div className="h-96 bg-[var(--color-surface-variant)] rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-up">
      {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-2 font-display text-4xl font-black">Overview</h1>
          <p className="text-[var(--color-on-surface-variant)] font-medium flex items-center gap-2">
            <Store size={16} /> Welcome back, {user?.fullName || 'Restaurant Owner'}
          </p>
          {primaryRestaurant ? (
            <p className="mt-1 text-xs font-semibold text-[var(--color-on-surface-variant)]">
              Approval: {primaryRestaurant.isApproved ? 'Approved' : 'Pending Admin Approval'}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button
            onClick={openRestaurantForm}
            className="rounded-full border border-[var(--color-primary)]/30 px-5 py-2.5 text-sm font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
          >
            {primaryRestaurant ? 'Edit Restaurant' : 'Create Restaurant'}
          </button>
          <button
            onClick={() => void toggleOpenState()}
            disabled={!primaryRestaurant}
            className={`relative flex items-center gap-3 rounded-full pl-2 pr-6 py-2 transition-all duration-300 shadow-sm border ${
              primaryRestaurant?.isOpen
                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
            } disabled:opacity-60`}
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm transition-colors ${primaryRestaurant?.isOpen ? 'bg-green-500' : 'bg-red-500'}`}>
              {primaryRestaurant?.isOpen ? <Activity size={16} /> : <Store size={16} />}
            </div>
            <span className="font-bold">{primaryRestaurant?.isOpen ? 'Accepting Orders' : 'Paused'}</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-[2rem] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary-container)] p-6 text-white shadow-glow transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Revenue</p>
            <TrendingUp size={18} className="text-white/80" />
          </div>
          <h2 className="font-display text-4xl font-black">₹{(todayMetrics.revenue).toLocaleString()}</h2>
        </div>

        <div className="rounded-[2rem] bg-white border border-[var(--color-outline-variant)]/40 p-6 shadow-card transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Today's Orders</p>
            <ShoppingBag size={18} className="text-[var(--color-primary)]" />
          </div>
          <h2 className="font-display text-4xl font-black">{todayMetrics.todaysOrders.length}</h2>
        </div>

        <div className="rounded-[2rem] bg-white border border-[var(--color-outline-variant)]/40 p-6 shadow-card transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Active Orders</p>
            <Activity size={18} className="text-amber-500" />
          </div>
          <h2 className="font-display text-4xl font-black">{todayMetrics.activeOrders}</h2>
        </div>

        <div className="rounded-[2rem] bg-white border border-[var(--color-outline-variant)]/40 p-6 shadow-card transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Restaurant Rating</p>
            <Star size={18} className="text-yellow-500" fill="currentColor" />
          </div>
          <h2 className="font-display text-4xl font-black">{(primaryRestaurant?.rating ?? 0).toFixed(1)}</h2>
        </div>
      </div>

      {!primaryRestaurant ? (
        <section className="rounded-[2rem] border border-dashed border-[var(--color-outline-variant)]/50 bg-white p-8 text-center">
          <h3 className="font-display text-2xl font-black">Create your restaurant first</h3>
          <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">Once created, admin can approve it and you can go live.</p>
          <button
            onClick={openRestaurantForm}
            className="mt-5 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white shadow-glow"
          >
            Create Restaurant
          </button>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-[2.5rem] bg-white border border-[var(--color-outline-variant)]/40 p-8 shadow-card">
            <h3 className="font-display text-2xl font-black mb-6">Live Orders</h3>
            <div className="space-y-4">
              {orders.slice(0, 4).map((order) => (
                <div key={order.orderNumber} className="rounded-2xl bg-[var(--color-surface-container-lowest)] p-5 border border-[var(--color-outline-variant)]/30">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold">#{order.orderNumber}</h4>
                      <p className="text-sm text-[var(--color-on-surface-variant)] mt-1 font-medium flex items-center gap-1.5">
                        <Clock size={14} />
                        {(order.items?.length || 0)} items • ₹{(order.finalAmount || order.totalAmount || 0).toFixed(0)}
                      </p>
                    </div>
                    <span className="inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-blue-100 text-blue-800">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
              {orders.length === 0 ? <p className="text-sm text-[var(--color-on-surface-variant)]">No orders yet.</p> : null}
            </div>
          </section>

          <section className="rounded-[2.5rem] bg-gradient-to-b from-[var(--color-surface-container-lowest)] to-white border border-[var(--color-outline-variant)]/40 p-8 shadow-card">
            <h3 className="font-display text-2xl font-black mb-6">Operations</h3>
            <div className="space-y-5">
              <p className="text-sm font-medium text-[var(--color-on-surface-variant)]">Store Hours: {primaryRestaurant.openingTime} - {primaryRestaurant.closingTime}</p>
              <p className="text-sm font-medium text-[var(--color-on-surface-variant)]">Delivery Fee: ₹{(primaryRestaurant.deliveryFee || 0).toFixed(0)}</p>
              <p className="text-sm font-medium text-[var(--color-on-surface-variant)]">Estimated Delivery: {primaryRestaurant.estimatedDeliveryMin || 35} mins</p>
              <p className="text-sm font-medium text-[var(--color-on-surface-variant)]">Approval: {primaryRestaurant.isApproved ? 'Approved' : 'Pending'}</p>
            </div>
          </section>
        </div>
      )}

      {showRestaurantForm ? (
        <div className="fixed top-1/2 inset-0 z-50 bg-black/40 backdrop-blur-sm p-4 flex items-center justify-center">
          <form onSubmit={handleRestaurantSubmit} className="w-full max-w-4xl rounded-3xl border border-[var(--color-outline-variant)]/30 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl font-black">{primaryRestaurant ? 'Edit Restaurant Profile' : 'Create Restaurant Profile'}</h2>
              <button type="button" onClick={closeRestaurantForm} className="rounded-full p-2 hover:bg-[var(--color-surface-container)]">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'name', label: 'Restaurant Name*' },
                { key: 'cuisineType', label: 'Primary Cuisine*' },
                { key: 'phoneNumber', label: 'Phone Number*' },
                { key: 'email', label: 'Email*', type: 'email' },
                { key: 'gstNumber', label: 'GST Number* (15 digits)', maxLength: 15 },
                { key: 'fssaiLicenseNumber', label: 'FSSAI License* (14 digits)', maxLength: 14 },
                { key: 'address', label: 'Address*' },
                { key: 'city', label: 'City*' },
                { key: 'state', label: 'State*' },
                { key: 'pincode', label: 'Pincode*' },
                { key: 'imageUrl', label: 'Image URL*' },
                { key: 'openingTime', label: 'Opening Time', type: 'time' },
                { key: 'closingTime', label: 'Closing Time', type: 'time' },
                { key: 'deliveryFee', label: 'Delivery Fee', type: 'number' },
                { key: 'estimatedDeliveryMin', label: 'Estimated Delivery (mins)', type: 'number' },
                { key: 'latitude', label: 'Latitude*', type: 'number' },
                { key: 'longitude', label: 'Longitude*', type: 'number' },
              ].map((field) => (
                <label key={field.key} className="text-sm font-semibold text-[var(--color-on-surface)]">
                  <span className="mb-1.5 block">{field.label}</span>
                  <input
                    type={field.type || 'text'}
                    value={restaurantForm[field.key as keyof RestaurantForm]}
                    onChange={(e) => setRestaurantForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    maxLength={field.maxLength}
                    className="w-full rounded-xl border border-[var(--color-outline-variant)]/40 px-4 py-3 text-sm"
                    required={field.label.includes('*')}
                  />
                </label>
              ))}
            </div>

            <label className="mt-4 block text-sm font-semibold text-[var(--color-on-surface)]">
              <span className="mb-1.5 block">Description</span>
              <textarea
                rows={3}
                value={restaurantForm.description}
                onChange={(e) => setRestaurantForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-xl border border-[var(--color-outline-variant)]/40 px-4 py-3 text-sm"
              />
            </label>

            {primaryRestaurant?.id && (
              <div className="mt-4">
                <ImageUpload
                  currentImageUrl={primaryRestaurant.imageUrl}
                  onUpload={async (file) => {
                    const imageUrl = await restaurantService.uploadRestaurantImage(primaryRestaurant.id, file);
                    setRestaurants((prev) => prev.map((r) => (r.id === primaryRestaurant.id ? { ...r, imageUrl } : r)));
                    setRestaurantForm((prev) => ({ ...prev, imageUrl }));
                    return imageUrl;
                  }}
                  onDelete={async () => {
                    await restaurantService.deleteRestaurantImage(primaryRestaurant.id);
                    setRestaurants((prev) => prev.map((r) => (r.id === primaryRestaurant.id ? { ...r, imageUrl: undefined } : r)));
                    setRestaurantForm((prev) => ({ ...prev, imageUrl: '' }));
                  }}
                  maxSizeMB={10}
                  aspectRatio="16/9"
                  label="Restaurant Image"
                />
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={closeRestaurantForm} className="rounded-full border border-[var(--color-outline-variant)]/40 px-5 py-2.5 text-sm font-semibold">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                {saving ? 'Saving...' : primaryRestaurant ? 'Update Restaurant' : 'Create Restaurant'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
