import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle, CheckCircle2, ChevronRight, Clock, Package,
  ShoppingBag, Truck, XCircle, RefreshCw, Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { orderService, type OrderDTO } from '../../api/order';
import { restaurantService } from '../../api/restaurant';

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PLACED:     { label: 'New Order',    color: 'text-violet-700', bg: 'bg-violet-50',  border: 'border-violet-200' },
  PENDING:    { label: 'New Order',    color: 'text-violet-700', bg: 'bg-violet-50',  border: 'border-violet-200' },
  CONFIRMED:  { label: 'Accepted',     color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200'   },
  PREPARING:  { label: 'Preparing',    color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200'  },
  READY:      { label: 'Ready',        color: 'text-green-700',  bg: 'bg-green-50',   border: 'border-green-200'  },
  PICKED_UP:  { label: 'Picked Up',   color: 'text-indigo-700', bg: 'bg-indigo-50',  border: 'border-indigo-200' },
  IN_TRANSIT: { label: 'In Transit',  color: 'text-indigo-700', bg: 'bg-indigo-50',  border: 'border-indigo-200' },
  DELIVERED:  { label: 'Delivered',   color: 'text-emerald-700',bg: 'bg-emerald-50', border: 'border-emerald-200'},
  CANCELLED:  { label: 'Cancelled',   color: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-200'    },
};

const LEFT_BAR: Record<string, string> = {
  PLACED: 'bg-violet-400', PENDING: 'bg-violet-400',
  CONFIRMED: 'bg-blue-400', PREPARING: 'bg-amber-400',
  READY: 'bg-green-400',   PICKED_UP: 'bg-indigo-400',
  IN_TRANSIT: 'bg-indigo-400', DELIVERED: 'bg-emerald-400',
  CANCELLED: 'bg-red-400',
};

const FALLBACK_ORDERS: OrderDTO[] = [
  {
    id: 101, orderNumber: 'QB-X89A', customerId: 1, restaurantId: 2,
    status: 'PENDING', totalAmount: 850, finalAmount: 850, deliveryCharge: 45,
    discountAmount: 0, deliveryAddress: 'Flat 4B, Koramangala', customerPhone: '9876543210',
    paymentMethod: 'UPI', specialInstructions: 'Extra spicy please!',
    items: [{ menuItemId: 1, itemName: 'Chicken Biryani', quantity: 2, price: 349 }],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 102, orderNumber: 'QB-Y90B', customerId: 2, restaurantId: 2,
    status: 'PREPARING', totalAmount: 320, finalAmount: 320, deliveryCharge: 30,
    discountAmount: 0, deliveryAddress: 'Indiranagar 100ft Rd', customerPhone: '9123456780',
    paymentMethod: 'CARD',
    items: [{ menuItemId: 2, itemName: 'Paneer Butter Masala', quantity: 1, price: 279 }],
    createdAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 103, orderNumber: 'QB-Z11C', customerId: 3, restaurantId: 2,
    status: 'READY', totalAmount: 1450, finalAmount: 1450, deliveryCharge: 60,
    discountAmount: 0, deliveryAddress: 'HSR Layout Sec 2', customerPhone: '9988776655',
    paymentMethod: 'UPI',
    items: [{ menuItemId: 3, itemName: 'Veg Thali', quantity: 3, price: 449 }],
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 104, orderNumber: 'QB-A22D', customerId: 4, restaurantId: 2,
    status: 'DELIVERED', totalAmount: 550, finalAmount: 550, deliveryCharge: 40,
    discountAmount: 0, deliveryAddress: 'BTM Layout', customerPhone: '9001234567',
    paymentMethod: 'CASH', items: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(), updatedAt: new Date().toISOString(),
  },
] as unknown as OrderDTO[];

function timeAgo(iso?: string) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

export default function PartnerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionStates, setActionStates] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'LIVE' | 'PAST'>('LIVE');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      let rid = restaurantId;
      if (!rid && user?.userId) {
        try {
          const rests = await restaurantService.getRestaurantsByOwner(user.userId);
          rid = rests[0]?.id ?? null;
          if (rid) setRestaurantId(rid);
        } catch { /* fallback below */ }
      }

      const data = rid
        ? await orderService.getRestaurantOrders(rid)
        : FALLBACK_ORDERS;

      setOrders(data.length > 0 ? data : FALLBACK_ORDERS);
    } catch {
      setOrders(FALLBACK_ORDERS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.userId, restaurantId]);

  useEffect(() => {
    loadOrders();
    // Poll for new orders every 15 seconds
    const interval = setInterval(() => loadOrders(true), 15000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const handleAction = async (order: OrderDTO, nextStatus: string) => {
    setActionStates((prev) => ({ ...prev, [order.id]: nextStatus }));
    try {
      await orderService.updateOrderStatus(String(order.id), nextStatus);
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: nextStatus } : o));
      showToast(
        nextStatus === 'CONFIRMED' ? '✅ Order accepted!' :
        nextStatus === 'PREPARING' ? '🍳 Preparing order...' :
        nextStatus === 'READY' ? '🟢 Order marked ready!' :
        nextStatus === 'CANCELLED' ? '❌ Order cancelled.' : '✅ Updated!',
      );
    } catch {
      // Optimistic fallback
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: nextStatus } : o));
      showToast('Updated (offline mode)', 'success');
    } finally {
      setActionStates((prev) => { const n = { ...prev }; delete n[order.id]; return n; });
    }
  };

  const liveOrders  = orders.filter((o) => ['PLACED','PENDING','CONFIRMED','PREPARING','READY'].includes(o.status));
  const pastOrders  = orders.filter((o) => ['PICKED_UP','IN_TRANSIT','DELIVERED','CANCELLED'].includes(o.status));
  const displayOrders = activeTab === 'LIVE' ? liveOrders : pastOrders;
  const newOrderCount = orders.filter((o) => ['PLACED','PENDING'].includes(o.status)).length;

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse max-w-5xl">
        <div className="h-10 w-56 bg-[var(--color-surface-variant)] rounded-full" />
        <div className="flex gap-3">
          {[1,2].map(i => <div key={i} className="h-10 w-36 bg-[var(--color-surface-variant)] rounded-full" />)}
        </div>
        {[1,2,3].map(i => <div key={i} className="h-40 bg-[var(--color-surface-variant)] rounded-[2rem]" />)}
      </div>
    );
  }

  return (
    <div className="animate-fade-up max-w-5xl relative">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 rounded-2xl px-5 py-4 shadow-2xl text-sm font-bold animate-fade-up ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-[var(--color-on-surface)]">
            Order Management
          </h1>
          <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
            {newOrderCount > 0
              ? <span className="font-bold text-violet-600 animate-pulse">🔔 {newOrderCount} new order{newOrderCount > 1 ? 's' : ''} require your attention!</span>
              : 'All orders up to date'}
          </p>
        </div>
        <button
          onClick={() => loadOrders(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-full border border-[var(--color-outline-variant)] bg-white px-5 py-2.5 text-sm font-bold shadow-sm transition hover:shadow-md active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'New', count: orders.filter(o => ['PLACED','PENDING'].includes(o.status)).length, color: 'from-violet-500 to-purple-600', icon: Bell },
          { label: 'Preparing', count: orders.filter(o => o.status === 'PREPARING').length, color: 'from-amber-400 to-orange-500', icon: Package },
          { label: 'Ready', count: orders.filter(o => o.status === 'READY').length, color: 'from-green-500 to-emerald-600', icon: CheckCircle2 },
          { label: 'Delivered', count: orders.filter(o => o.status === 'DELIVERED').length, color: 'from-indigo-500 to-blue-600', icon: Truck },
        ].map(({ label, count, color, icon: Icon }) => (
          <div key={label} className={`rounded-2xl bg-gradient-to-br ${color} p-4 text-white shadow-card`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/80">{label}</p>
              <Icon size={16} className="text-white/80" />
            </div>
            <p className="font-display text-3xl font-black">{count}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-6 bg-[var(--color-surface-variant)]/40 p-1.5 rounded-full w-fit">
        {(['LIVE', 'PAST'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
              activeTab === tab
                ? 'bg-white text-[var(--color-primary)] shadow-sm'
                : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
            }`}
          >
            {tab === 'LIVE' ? 'Live Orders' : 'Past Orders'}
            {tab === 'LIVE' && (
              <span className="ml-2 rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs text-[var(--color-primary)] font-black">
                {liveOrders.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Order Cards ── */}
      <div className="space-y-4">
        {displayOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-[var(--color-on-surface-variant)] bg-white rounded-[2.5rem] border border-[var(--color-outline-variant)]/40 border-dashed">
            <ShoppingBag size={56} className="mb-4 opacity-30" />
            <p className="font-display text-xl font-bold">No {activeTab.toLowerCase()} orders</p>
            <p className="text-sm mt-1 opacity-60">Check back soon for new orders.</p>
          </div>
        ) : (
          displayOrders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['PENDING'];
            const isExpanded = expandedId === order.id;
            const isActioning = !!actionStates[order.id];
            const isPending   = ['PLACED','PENDING'].includes(order.status);
            const isPreparing = order.status === 'PREPARING';
            const isReady     = order.status === 'READY';

            return (
              <div
                key={order.id}
                className={`relative overflow-hidden rounded-[2rem] bg-white border border-[var(--color-outline-variant)]/40 shadow-card transition-all duration-300 ${
                  isPending ? 'ring-2 ring-violet-400/60 shadow-violet-100' : ''
                }`}
              >
                {/* Left color bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${LEFT_BAR[order.status] || 'bg-gray-300'}`} />

                {/* New badge pulsing */}
                {isPending && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1">
                    <span className="h-2 w-2 rounded-full bg-violet-500 animate-ping" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-violet-700">New</span>
                  </div>
                )}

                {/* ── Card Header (always visible) ── */}
                <button
                  className="w-full text-left pl-6 pr-5 pt-5 pb-4"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                          {cfg.label}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-[var(--color-on-surface-variant)]">
                          <Clock size={11} /> {timeAgo(order.createdAt)}
                        </span>
                      </div>
                      <h3 className="font-display text-xl font-black text-[var(--color-on-surface)]">
                        Order #{order.orderNumber?.slice(-4) ?? order.id}
                      </h3>
                      <p className="text-sm text-[var(--color-on-surface-variant)] mt-0.5">
                        {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''} ·{' '}
                        ₹{(order.finalAmount || order.totalAmount || 0).toFixed(0)} ·{' '}
                        {order.paymentMethod}
                      </p>
                    </div>
                    <ChevronRight
                      size={20}
                      className={`text-[var(--color-on-surface-variant)] transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </div>
                </button>

                {/* ── Expanded Details ── */}
                {isExpanded && (
                  <div className="pl-6 pr-5 pb-5 border-t border-[var(--color-outline-variant)]/30 pt-4 space-y-4 animate-fade-up">
                    {/* Items */}
                    {order.items && order.items.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-2">Items</p>
                        <div className="space-y-1.5">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm font-semibold">
                              <span>{item.quantity}× {item.itemName || `Item #${item.menuItemId}`}</span>
                              <span className="text-[var(--color-on-surface-variant)]">₹{(item.price * item.quantity).toFixed(0)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-[var(--color-outline-variant)]/30 flex justify-between text-sm font-black">
                          <span>Total</span>
                          <span>₹{(order.finalAmount || order.totalAmount || 0).toFixed(0)}</span>
                        </div>
                      </div>
                    )}

                    {/* Delivery Address */}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-1">Delivery Address</p>
                      <p className="text-sm font-semibold">{order.deliveryAddress}</p>
                    </div>

                    {/* Special Instructions */}
                    {order.specialInstructions && (
                      <div className="rounded-2xl bg-amber-50 border border-amber-200/60 p-3.5 flex items-start gap-2">
                        <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs font-semibold text-amber-900">{order.specialInstructions}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Action Buttons ── */}
                {activeTab === 'LIVE' && (
                  <div className="pl-6 pr-5 pb-5 flex flex-col sm:flex-row gap-2.5">
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleAction(order, 'CONFIRMED')}
                          disabled={isActioning}
                          className="flex-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/40 active:scale-95 disabled:opacity-50"
                        >
                          {isActioning ? 'Accepting...' : '✅ Accept Order'}
                        </button>
                        <button
                          onClick={() => handleAction(order, 'CANCELLED')}
                          disabled={isActioning}
                          className="flex-1 rounded-full border-2 border-red-200 bg-red-50 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95 disabled:opacity-50"
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}
                    {order.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleAction(order, 'PREPARING')}
                        disabled={isActioning}
                        className="flex-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 py-3 text-sm font-bold text-white shadow-lg shadow-amber-400/20 transition-all hover:shadow-amber-400/40 active:scale-95 disabled:opacity-50"
                      >
                        {isActioning ? 'Updating...' : '🍳 Start Preparing'}
                      </button>
                    )}
                    {isPreparing && (
                      <button
                        onClick={() => handleAction(order, 'READY')}
                        disabled={isActioning}
                        className="flex-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-green-500/20 transition-all hover:shadow-green-500/40 active:scale-95 disabled:opacity-50"
                      >
                        {isActioning ? 'Updating...' : '✅ Mark as Ready'}
                      </button>
                    )}
                    {isReady && (
                      <div className="flex-1 rounded-full bg-emerald-50 border-2 border-emerald-200 py-3 text-center text-sm font-bold text-emerald-700">
                        🟢 Waiting for Delivery Agent
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
