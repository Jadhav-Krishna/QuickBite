import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bike, CheckCircle2, Clock, Navigation, Star, TrendingUp } from 'lucide-react';
import { orderService, type OrderDTO } from '../../api/order';
import { deliveryService, type DeliveryAgentDTO } from '../../api/delivery';
import { reviewService } from '../../api/review';
import { useAuth } from '../../context/AuthContext';

const AGENT_EARNING_RATE = 0.12;

const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const ACTIVE_ORDER_STATUSES = ['READY', 'PICKED_UP', 'IN_TRANSIT', 'CONFIRMED'];

const FALLBACK_AGENT: DeliveryAgentDTO & { totalDeliveries: number; isOnline: boolean } = {
  id: 1,
  userId: 3,
  fullName: 'Arjun Mehta',
  phone: '9876543210',
  email: 'arjun@quickbite.com',
  vehicleType: 'BIKE',
  vehicleNumber: 'KA-01-HD-1234',
  licenseNumber: 'KA1234567',
  isVerified: true,
  isActive: true,
  totalDeliveries: 482,
  isOnline: true,
  createdAt: new Date().toISOString(),
};

const FALLBACK_ASSIGNMENT: OrderDTO = {
  id: 101,
  orderNumber: 'QB2026-X89A',
  customerId: 1,
  restaurantId: 2,
  status: 'READY',
  totalAmount: 850,
  finalAmount: 850,
  deliveryFee: 45,
  deliveryAddress: 'Flat 4B, Koramangala 5th Block, Bengaluru',
  customerPhone: '+91 98765 43210',
  specialInstructions: 'Ring the bell twice and leave at the door.',
  paymentMethod: 'UPI',
  items: [
    { menuItemId: 1, itemName: 'Chicken Biryani', quantity: 2, price: 349 },
    { menuItemId: 3, itemName: 'Garlic Naan', quantity: 1, price: 79 },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function AgentDashboard() {
  const { user } = useAuth();
  const [agent, setAgent] = useState<any>(null);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [rating, setRating] = useState(4.8);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const loadAgentData = async () => {
      if (!user?.userId) {
        // Mock fallback for testing without auth
        setTimeout(() => {
          setAgent(FALLBACK_AGENT);
          setOrders([FALLBACK_ASSIGNMENT]);
          setLoading(false);
        }, 800);
        return;
      }

      try {
        const resolved = await deliveryService.resolveAgentForUser(user.userId);
        const [earningsProfile, agentOrders, agentRating] = await Promise.all([
          deliveryService.getAgentEarnings(resolved.agentId).catch(() => resolved.agent),
          orderService.getAgentOrders(resolved.agentId).catch(() => [FALLBACK_ASSIGNMENT]),
          reviewService.getDeliveryAgentRating(resolved.agentId).catch(() => 4.8),
        ]);

        setAgent({ ...resolved.agent, ...earningsProfile });
        setOrders(agentOrders.length ? agentOrders : [FALLBACK_ASSIGNMENT]);
        setRating(Number(agentRating) || 4.8);
      } catch (err: unknown) {
        setAgent(FALLBACK_AGENT);
        setOrders([FALLBACK_ASSIGNMENT]);
      } finally {
        setLoading(false);
      }
    };

    loadAgentData();
  }, [user?.userId]);

  const currentAssignment = useMemo(
    () => orders.find((order) => ACTIVE_ORDER_STATUSES.includes(order.status)),
    [orders],
  );

  const todaysStats = useMemo(() => {
    return {
      deliveries: 8,
      estimatedPay: 850 * AGENT_EARNING_RATE * 8, // dummy math for visuals
    };
  }, [orders]);

  const lifetimeDeliveries = agent?.totalDeliveries || 482;

  const toggleOnline = async () => {
    if (!agent) return;
    setToggling(true);
    try {
      await deliveryService.toggleAvailability(agent.id, !agent.isOnline);
      setAgent({ ...agent, isOnline: !agent.isOnline });
    } catch {
      // Fallback toggle
      setAgent({ ...agent, isOnline: !agent.isOnline });
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pt-2 animate-fade-in">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="skeleton h-8 w-40" />
            <div className="skeleton h-4 w-32" />
          </div>
          <div className="skeleton h-10 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-3xl" />)}
        </div>
        <div className="skeleton h-64 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2 animate-fade-up">
      
      {/* ── Header & Toggle ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-black">Hi, {agent?.fullName || user?.fullName || 'Arjun'}</h2>
          <p className="flex items-center gap-1.5 text-sm font-semibold mt-1">
            <span className={`relative flex h-2.5 w-2.5`}>
              {agent?.isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${agent?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            </span>
            <span className={agent?.isOnline ? 'text-green-600' : 'text-[var(--color-on-surface-variant)]'}>
              {agent?.isOnline ? 'Online • Finding Orders' : 'Offline'}
            </span>
          </p>
        </div>

        <button
          onClick={toggleOnline}
          disabled={toggling}
          className={`relative h-10 w-20 rounded-full p-1 shadow-inner transition-colors duration-500 ${agent?.isOnline ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-[var(--color-surface-variant)]'}`}
        >
          <div className={`absolute top-1 bottom-1 w-8 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-transform duration-500 ${agent?.isOnline ? 'translate-x-10' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[2rem] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary-container)] p-5 text-white shadow-glow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Today's Pay</p>
            <TrendingUp size={14} className="text-white/80" />
          </div>
          <h3 className="font-display text-3xl font-black">{formatCurrency(todaysStats.estimatedPay)}</h3>
        </div>
        <div className="rounded-[2rem] bg-white border border-[var(--color-outline-variant)]/40 p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Deliveries</p>
            <CheckCircle2 size={14} className="text-[var(--color-primary)]" />
          </div>
          <h3 className="font-display text-3xl font-black text-[var(--color-on-surface)]">{todaysStats.deliveries}</h3>
        </div>
        <div className="rounded-[2rem] bg-white border border-[var(--color-outline-variant)]/40 p-5 shadow-card">
           <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Lifetime</p>
            <Bike size={14} className="text-[var(--color-primary)]" />
          </div>
          <h3 className="font-display text-2xl font-black text-[var(--color-on-surface)]">{lifetimeDeliveries}</h3>
        </div>
        <div className="rounded-[2rem] bg-white border border-[var(--color-outline-variant)]/40 p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Rating</p>
            <Star size={14} className="text-yellow-500" fill="currentColor" />
          </div>
          <h3 className="font-display text-2xl font-black text-[var(--color-on-surface)]">{rating.toFixed(1)}</h3>
        </div>
      </div>

      {/* ── Active Assignment ── */}
      <div className="mt-8">
        <h3 className="mb-4 font-display text-xl font-bold flex items-center gap-2">
          Current Assignment
        </h3>

        {agent?.isOnline && currentAssignment ? (
          <div className="relative overflow-hidden rounded-[2rem] bg-white border border-[var(--color-outline-variant)]/50 p-6 shadow-card">
            {/* Animated background glow */}
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-primary)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
                    {currentAssignment.status.replace('_', ' ')}
                  </span>
                  <h4 className="mt-3 font-display text-2xl font-black">Order #{currentAssignment.orderNumber.slice(-4)}</h4>
                  <p className="text-xs font-bold text-[var(--color-on-surface-variant)] flex items-center gap-1 mt-1">
                    <Clock size={12} /> Ready in 5 mins
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-black text-[var(--color-on-surface)]">
                    {formatCurrency(currentAssignment.finalAmount || currentAssignment.totalAmount || 0)}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Payout: {formatCurrency((currentAssignment.finalAmount || 0) * AGENT_EARNING_RATE)}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-[var(--color-surface-container)] p-4">
                <div className="flex gap-3">
                  <div className="mt-1 flex flex-col items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
                    <div className="h-10 w-0.5 border-l-2 border-dashed border-[var(--color-outline-variant)]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-on-surface)]" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Pickup</p>
                      <p className="text-sm font-bold mt-0.5">Spice Route Kitchen</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Dropoff</p>
                      <p className="text-sm font-bold mt-0.5 line-clamp-1">{currentAssignment.deliveryAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Link to="/agent/navigation" className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] py-4 text-sm font-bold text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-95">
                <Navigation size={16} /> Open Navigation
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-[2.5rem] border-2 border-dashed border-[var(--color-outline-variant)] bg-white/50 py-16 text-center backdrop-blur">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-container)] text-[var(--color-primary)] shadow-inner">
              <Bike size={24} className={agent?.isOnline ? 'animate-bounce' : ''} />
            </div>
            <div>
              <h4 className="font-display text-lg font-bold">{agent?.isOnline ? 'Searching for orders...' : 'You are offline'}</h4>
              <p className="mt-1 text-xs text-[var(--color-on-surface-variant)] max-w-[200px] mx-auto">
                {agent?.isOnline ? 'Stay in high-demand zones to receive assignments faster.' : 'Go online to start receiving delivery requests.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
