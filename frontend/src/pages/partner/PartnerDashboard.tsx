import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, ShoppingBag, Clock, Star, Store, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { type Restaurant } from '../../api/restaurant';
import { type OrderDTO } from '../../api/order';

const FALLBACK_RESTAURANT: Restaurant = {
  id: 2, ownerId: 4, name: 'Spice Route Kitchen', cuisineType: 'North Indian',
  description: 'Rich curries, tandoori platters.', address: '12 MG Road', city: 'Bengaluru',
  state: 'Karnataka', pincode: '560038', rating: 4.5, reviewCount: 214, isActive: true, isOpen: true,
  deliveryFee: 39, estimatedDeliveryMin: 35, imageUrl: '', openingTime: '11:00', closingTime: '23:00'
};

const FALLBACK_ORDERS: OrderDTO[] = [
  { id: 101, orderNumber: 'QB-X89A', customerId: 1, restaurantId: 2, status: 'PREPARING', totalAmount: 850, finalAmount: 850, deliveryAddress: '', paymentMethod: 'UPI', items: [{ id: 1, orderId: 101, menuItemId: 1, quantity: 2, price: 349, specialInstructions: '' }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 102, orderNumber: 'QB-Y90B', customerId: 2, restaurantId: 2, status: 'PENDING', totalAmount: 320, finalAmount: 320, deliveryAddress: '', paymentMethod: 'CARD', items: [{ id: 2, orderId: 102, menuItemId: 2, quantity: 1, price: 279, specialInstructions: '' }], createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), updatedAt: new Date().toISOString() },
  { id: 103, orderNumber: 'QB-Z11C', customerId: 3, restaurantId: 2, status: 'READY', totalAmount: 1450, finalAmount: 1450, deliveryCharge: 60, discountAmount: 0, deliveryAddress: '', paymentMethod: 'UPI', items: [], createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), updatedAt: new Date().toISOString() },
] as unknown as OrderDTO[];

export default function PartnerDashboard() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const primaryRestaurant = restaurants[0] || FALLBACK_RESTAURANT;
  const displayOrders = orders.length > 0 ? orders : FALLBACK_ORDERS;

  useEffect(() => {
    // Simulate loading to show off skeleton
    setTimeout(() => setLoading(false), 800);
  }, []);

  const todayMetrics = useMemo(() => {
    return {
      todaysOrders: displayOrders,
      revenue: 14520, // Mock revenue
      activeOrders: displayOrders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status)).length,
      avgPrep: 18,
    };
  }, [displayOrders]);

  const toggleOpenState = async () => {
    setRestaurants([{ ...primaryRestaurant, isOpen: !primaryRestaurant.isOpen }]);
  };

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-12 w-64 bg-[var(--color-surface-variant)] rounded-lg" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-[var(--color-surface-variant)] rounded-[2rem]" />)}
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
      {/* ── Header ── */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-2 font-display text-4xl font-black">Overview</h1>
          <p className="text-[var(--color-on-surface-variant)] font-medium flex items-center gap-2">
            <Store size={16} /> Welcome back, {user?.fullName || 'Partner'}
          </p>
        </div>
        <button 
          onClick={toggleOpenState}
          className={`relative flex items-center gap-3 rounded-full pl-2 pr-6 py-2 transition-all duration-300 shadow-sm border ${
            primaryRestaurant.isOpen 
              ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
              : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
          }`}
        >
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm transition-colors ${primaryRestaurant.isOpen ? 'bg-green-500' : 'bg-red-500'}`}>
            {primaryRestaurant.isOpen ? <Activity size={16} /> : <Store size={16} />}
          </div>
          <span className="font-bold">{primaryRestaurant.isOpen ? 'Accepting Orders' : 'Paused'}</span>
        </button>
      </header>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-[2rem] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary-container)] p-6 text-white shadow-glow transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Today's Revenue</p>
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
          <h2 className="font-display text-4xl font-black">{primaryRestaurant.rating.toFixed(1)}</h2>
        </div>
      </div>

      {/* ── Content Grid ── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Orders List */}
        <section className="lg:col-span-2 rounded-[2.5rem] bg-white border border-[var(--color-outline-variant)]/40 p-8 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-2xl font-black">Live Orders</h3>
            <button className="text-sm font-bold text-[var(--color-primary)] hover:underline">View All</button>
          </div>
          
          <div className="space-y-4">
            {displayOrders.slice(0, 4).map((order) => {
              const isPending = order.status === 'PENDING';
              return (
                <div key={order.orderNumber} className="group relative overflow-hidden rounded-2xl bg-[var(--color-surface-container-lowest)] p-5 border border-[var(--color-outline-variant)]/30 transition-all hover:border-[var(--color-primary)]/30 hover:shadow-ambient">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`h-2 w-2 rounded-full ${isPending ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'}`} />
                        <h4 className="font-bold">#{order.orderNumber}</h4>
                      </div>
                      <p className="text-sm text-[var(--color-on-surface-variant)] mt-1 font-medium flex items-center gap-1.5">
                        <Clock size={14} /> 
                        {order.items?.length || 2} items • ₹{(order.finalAmount || order.totalAmount || 0).toFixed(0)}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                        isPending ? 'bg-amber-100 text-amber-800' : 
                        order.status === 'READY' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  {/* Action button reveal on hover */}
                  {isPending && (
                    <div className="mt-4 flex gap-2 pt-4 border-t border-[var(--color-outline-variant)]/30 opacity-0 transform translate-y-2 transition-all group-hover:opacity-100 group-hover:translate-y-0">
                      <button className="flex-1 rounded-full bg-[var(--color-primary)] py-2 text-xs font-bold text-white shadow-glow hover:bg-[var(--color-primary-container)]">Accept Order</button>
                      <button className="flex-1 rounded-full bg-[var(--color-surface-variant)] py-2 text-xs font-bold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-highest)]">Reject</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Operational Snapshot */}
        <section className="rounded-[2.5rem] bg-gradient-to-b from-[var(--color-surface-container-lowest)] to-white border border-[var(--color-outline-variant)]/40 p-8 shadow-card flex flex-col">
          <h3 className="font-display text-2xl font-black mb-6">Operations</h3>
          
          <div className="flex-1 space-y-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-2">Average Prep Time</p>
              <div className="flex items-end gap-2">
                <span className="font-display text-3xl font-black">{todayMetrics.avgPrep}</span>
                <span className="font-bold text-[var(--color-on-surface-variant)] mb-1">mins</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-[var(--color-surface-variant)] overflow-hidden">
                <div className="h-full w-[60%] bg-amber-400 rounded-full" />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-2">Platform Delivery Fee</p>
              <span className="font-display text-3xl font-black">₹{(primaryRestaurant.deliveryFee || 0).toFixed(0)}</span>
            </div>

            <div className="rounded-2xl bg-[var(--color-primary)]/5 p-4 border border-[var(--color-primary)]/20 mt-auto">
              <h4 className="font-bold text-[var(--color-primary)] flex items-center gap-2">
                <Store size={16} /> Store Hours
              </h4>
              <p className="text-sm font-medium mt-1">{primaryRestaurant.openingTime} - {primaryRestaurant.closingTime}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
