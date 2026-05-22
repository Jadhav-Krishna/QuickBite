import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bike, CheckCircle2, Clock, Navigation, Star, TrendingUp } from 'lucide-react';
import { orderService, type OrderDTO } from '../../api/order';
import { deliveryService, type DeliveryAgentDTO } from '../../api/delivery';
import { reviewService } from '../../api/review';
import { useAuth } from '../../context/AuthContext';
import { useLocationTracking } from '../../hooks/useLocationTracking';

const AGENT_EARNING_RATE = 0.12;
const ACTIVE_ORDER_STATUSES = ['READY', 'PICKED_UP', 'IN_TRANSIT', 'CONFIRMED'];
const DASHBOARD_REFRESH_MS = 10000;

const formatCurrency = (amount: number) =>
  `Rs ${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function AgentDashboard() {
  const { user } = useAuth();
  const [agent, setAgent] = useState<DeliveryAgentDTO | null>(null);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [availableOrders, setAvailableOrders] = useState<OrderDTO[]>([]);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [acceptingOrder, setAcceptingOrder] = useState(false);
  const [assignmentAction, setAssignmentAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAgentData = useCallback(async () => {
    if (!user?.userId) {
      setError('Please sign in as a delivery agent.');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('Loading agent data for user:', user.userId);
      
      const resolved = await deliveryService.resolveAgentForUser(user.userId);
      console.log('Agent resolved:', resolved);
      
      const [earningsProfile, agentOrders, agentRating, readyOrders] = await Promise.all([
        deliveryService.getAgentEarnings(resolved.agentId).catch((err) => {
          console.warn('Failed to load earnings:', err);
          return resolved.agent;
        }),
        orderService.getAgentOrders(resolved.agentId).catch((err) => {
          console.warn('Failed to load agent orders:', err);
          return [];
        }),
        reviewService.getDeliveryAgentRating(resolved.agentId).catch((err) => {
          console.warn('Failed to load rating:', err);
          return 0;
        }),
        orderService.getAvailableOrders().catch((err) => {
          console.warn('Failed to load available orders:', err);
          return [];
        }),
      ]);

      console.log('All data loaded successfully');
      setAgent({ ...resolved.agent, ...earningsProfile });
      setOrders(agentOrders);
      setAvailableOrders(readyOrders);
      setRating(Number(agentRating) || Number(resolved.agent.averageRating || 0));
    } catch (err: any) {
      console.error('Error loading agent data:', err);
      setError(err?.message || 'Unable to load agent dashboard. Make sure you are registered as a delivery agent.');
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    void loadAgentData();
    const intervalId = setInterval(() => {
      void loadAgentData();
    }, DASHBOARD_REFRESH_MS);
    return () => clearInterval(intervalId);
  }, [loadAgentData]);

  const currentAssignment = useMemo(
    () => orders.find((order) => ACTIVE_ORDER_STATUSES.includes(order.status)),
    [orders],
  );

  // Enable location tracking when agent has an active order in PICKED_UP or IN_TRANSIT status
  const shouldTrackLocation = useMemo(
    () => currentAssignment && ['PICKED_UP', 'IN_TRANSIT'].includes(currentAssignment.status),
    [currentAssignment],
  );

  const { isTracking } = useLocationTracking({
    agentId: agent?.id || 0,
    orderId: currentAssignment?.id || null,
    enabled: !!shouldTrackLocation && !!agent,
    updateInterval: 5000, // Update every 5 seconds
  });

  const todaysStats = useMemo(() => {
    const activeOrders = orders.filter((order) => ACTIVE_ORDER_STATUSES.includes(order.status));
    const activePayout = activeOrders.reduce(
      (sum, order) => sum + Number(order.finalAmount || order.totalAmount || 0) * AGENT_EARNING_RATE,
      0,
    );

    return {
      activeOrders: activeOrders.length,
      estimatedPay: activePayout,
    };
  }, [orders]);

  const toggleOnline = async () => {
    if (!agent) return;
    setToggling(true);
    try {
      await deliveryService.toggleAvailability(agent.id, !agent.isOnline);
      setAgent({ ...agent, isOnline: !agent.isOnline });
    } catch (err: any) {
      setError(err?.message || 'Unable to update online status.');
    } finally {
      setToggling(false);
    }
  };

  const acceptNextOrder = async () => {
    if (!agent || availableOrders.length === 0 || acceptingOrder) return;
    setAcceptingOrder(true);
    setError(null);

    try {
      const nextOrder = availableOrders[0];
      await orderService.claimOrder(nextOrder.orderNumber, agent.id);
      await loadAgentData();
    } catch (err: any) {
      setError(err?.message || 'Unable to accept order.');
    } finally {
      setAcceptingOrder(false);
    }
  };

  const updateAssignmentStatus = async (nextStatus: 'PICKUP_CONFIRM' | 'IN_TRANSIT' | 'DELIVERED') => {
    if (!agent || !currentAssignment) return;
    setAssignmentAction(nextStatus);
    setError(null);
    try {
      if (nextStatus === 'PICKUP_CONFIRM') {
        await orderService.confirmPickupByAgent(currentAssignment.orderNumber, agent.id);
      } else if (nextStatus === 'DELIVERED') {
        await orderService.updateOrderStatus(currentAssignment.orderNumber, nextStatus);
        const orderAmount = currentAssignment.finalAmount || currentAssignment.totalAmount || 0;
        await deliveryService.markDelivered(agent.id, currentAssignment.id, orderAmount);
      } else {
        await orderService.updateOrderStatus(currentAssignment.orderNumber, nextStatus);
      }
      await loadAgentData();
    } catch (err: any) {
      setError(err?.message || 'Unable to update delivery status.');
    } finally {
      setAssignmentAction(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pt-2 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton h-8 w-40" />
            <div className="skeleton h-4 w-32" />
          </div>
          <div className="skeleton h-10 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="skeleton h-24 rounded-3xl" />
          ))}
        </div>
        <div className="skeleton h-64 rounded-3xl" />
        <p className="text-center text-sm text-slate-500 animate-pulse">Loading agent dashboard...</p>
      </div>
    );
  }

  if (error && !agent) {
    return (
      <div className="space-y-6 pt-4">
        <div className="rounded-3xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50 p-8 text-center shadow-lg">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-black text-red-900 mb-2">Unable to Load Dashboard</h2>
          <p className="text-sm font-semibold text-red-700 mb-6">{error}</p>
          <div className="bg-white rounded-2xl p-4 text-left">
            <p className="text-xs font-bold text-slate-700 mb-2">Possible reasons:</p>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              <li>You are not registered as a delivery agent</li>
              <li>Your agent account is not activated</li>
              <li>Network connection issue</li>
              <li>Backend service is not running</li>
            </ul>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              loadAgentData();
            }}
            className="mt-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4 animate-fade-up">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-black text-slate-900">Hi, {agent?.fullName?.split(' ')[0] || user?.fullName?.split(' ')[0] || 'Agent'}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              {agent?.isOnline ? (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              ) : null}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  agent?.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
            </span>
            <span className={agent?.isOnline ? 'text-emerald-600' : 'text-slate-500'}>
              {agent?.isOnline ? 'Online' : 'Offline'}
            </span>
          </p>
        </div>

        <button
          onClick={toggleOnline}
          disabled={toggling || !agent}
          type="button"
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
            agent?.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
              agent?.isOnline ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 p-4 text-white shadow-lg shadow-red-600/20 hover:shadow-xl hover:shadow-red-600/30 transition-shadow">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/80">Active Pay</p>
            <TrendingUp size={12} className="text-white/80" />
          </div>
          <h3 className="font-display text-xl font-black">{formatCurrency(todaysStats.estimatedPay)}</h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Active</p>
            <CheckCircle2 size={12} className="text-red-600" />
          </div>
          <h3 className="font-display text-xl font-black text-slate-900">{todaysStats.activeOrders}</h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Lifetime</p>
            <Bike size={12} className="text-red-600" />
          </div>
          <h3 className="font-display text-lg font-black text-slate-900">{agent?.totalDeliveries || 0}</h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Rating</p>
            <Star size={12} className="text-yellow-500" fill="currentColor" />
          </div>
          <h3 className="font-display text-lg font-black text-slate-900">{rating.toFixed(1)}</h3>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-slate-900">Current Assignment</h3>

        {currentAssignment ? (
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-red-600/10 blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-600">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-600" />
                    {currentAssignment.status.replace('_', ' ')}
                  </span>
                  <h4 className="mt-3 font-display text-2xl font-black text-slate-900">
                    Order #{currentAssignment.orderNumber.slice(-4)}
                  </h4>
                  <p className="mt-1 flex items-center gap-1 text-xs font-bold text-slate-500">
                    <Clock size={12} /> Live assignment
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-black text-slate-900">
                    {formatCurrency(currentAssignment.finalAmount || currentAssignment.totalAmount || 0)}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Payout: {formatCurrency((currentAssignment.finalAmount || 0) * AGENT_EARNING_RATE)}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <div className="flex gap-3">
                  <div className="mt-1 flex flex-col items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-600" />
                    <div className="h-10 w-0.5 border-l-2 border-dashed border-slate-300" />
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-900" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Pickup</p>
                      <p className="mt-0.5 text-sm font-bold text-slate-900">Restaurant #{currentAssignment.restaurantId}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Dropoff</p>
                      <p className="mt-0.5 line-clamp-1 text-sm font-bold text-slate-900">{currentAssignment.deliveryAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                to="/agent/navigation"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-red-600 py-4 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-transform hover:scale-[1.02] active:scale-95"
              >
                <Navigation size={16} /> Open Navigation
                {isTracking && (
                  <span className="ml-2 flex items-center gap-1.5 rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    Live
                  </span>
                )}
              </Link>

              {currentAssignment.status === 'READY' && !currentAssignment.agentPickupConfirmed ? (
                <button
                  type="button"
                  onClick={() => void updateAssignmentStatus('PICKUP_CONFIRM')}
                  disabled={!!assignmentAction}
                  className="mt-3 flex w-full items-center justify-center rounded-full bg-indigo-600 py-3.5 text-sm font-bold text-white disabled:opacity-60"
                >
                  {assignmentAction === 'PICKUP_CONFIRM' ? 'Confirming Pickup...' : 'Confirm Pickup'}
                </button>
              ) : null}

              {currentAssignment.status === 'READY' &&
              currentAssignment.agentPickupConfirmed &&
              !currentAssignment.restaurantPickupConfirmed ? (
                <div className="mt-3 rounded-full border border-indigo-200 bg-indigo-50 py-3 text-center text-sm font-bold text-indigo-700">
                  Waiting Restaurant Pickup Confirm
                </div>
              ) : null}

              {currentAssignment.status === 'PICKED_UP' ? (
                <button
                  type="button"
                  onClick={() => void updateAssignmentStatus('IN_TRANSIT')}
                  disabled={!!assignmentAction}
                  className="mt-3 flex w-full items-center justify-center rounded-full bg-emerald-600 py-3.5 text-sm font-bold text-white disabled:opacity-60"
                >
                  {assignmentAction === 'IN_TRANSIT' ? 'Starting Delivery...' : 'Start Delivery'}
                </button>
              ) : null}

              {currentAssignment.status === 'IN_TRANSIT' ? (
                <button
                  type="button"
                  onClick={() => void updateAssignmentStatus('DELIVERED')}
                  disabled={!!assignmentAction}
                  className="mt-3 flex w-full items-center justify-center rounded-full bg-emerald-700 py-3.5 text-sm font-bold text-white disabled:opacity-60"
                >
                  {assignmentAction === 'DELIVERED' ? 'Completing...' : 'Delivery Done'}
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-600 mb-4">
                {agent?.isOnline
                  ? 'No active order. Review and accept available deliveries below.'
                  : 'Go online to receive and accept delivery orders.'}
              </p>
            </div>

            {/* Available Orders Section */}
            {agent?.isOnline && availableOrders.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-black text-red-600">
                      {availableOrders.length}
                    </span>
                    Available Orders
                  </h4>
                  <span className="text-xs font-bold text-slate-500">Tap to accept</span>
                </div>

                {availableOrders.slice(0, 5).map((order) => {
                  const orderAmount = order.finalAmount || order.totalAmount || 0;
                  const agentPayout = orderAmount * AGENT_EARNING_RATE;
                  const itemCount = order.items?.length || 0;

                  return (
                    <div
                      key={order.id}
                      className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg hover:border-red-300 transition-all cursor-pointer group"
                      onClick={() => {
                        if (!acceptingOrder) {
                          setAcceptingOrder(true);
                          setError(null);
                          orderService.claimOrder(order.orderNumber, agent!.id)
                            .then(() => loadAgentData())
                            .catch((err: any) => setError(err?.message || 'Unable to accept order.'))
                            .finally(() => setAcceptingOrder(false));
                        }
                      }}
                    >
                      {/* Gradient Background */}
                      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-red-100 to-orange-100 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity" />

                      <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Ready
                              </span>
                              <span className="text-xs font-bold text-slate-500">
                                Order #{order.orderNumber.slice(-4)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                {itemCount} item{itemCount !== 1 ? 's' : ''}
                              </div>
                              <span className="text-slate-300">•</span>
                              <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {order.paymentMethod}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-display text-2xl font-black text-slate-900">
                              {formatCurrency(orderAmount)}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mt-0.5">
                              Earn: {formatCurrency(agentPayout)}
                            </p>
                          </div>
                        </div>

                        {/* Order Items */}
                        {order.items && order.items.length > 0 && (
                          <div className="mb-4 rounded-xl bg-slate-50 p-3 border border-slate-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Order Items</p>
                            <div className="space-y-1.5 max-h-20 overflow-y-auto">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                  <span className="font-semibold text-slate-700">
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-[10px] font-black text-slate-600 mr-2">
                                      {item.quantity}
                                    </span>
                                    {item.itemName}
                                  </span>
                                  <span className="font-bold text-slate-600">₹{(item.price * item.quantity).toFixed(0)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Delivery Details */}
                        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-3 border border-blue-100">
                          <div className="flex gap-3">
                            <div className="mt-1 flex flex-col items-center">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 shadow-sm">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                                </svg>
                              </div>
                              <div className="h-8 w-0.5 border-l-2 border-dashed border-blue-300" />
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-sm">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                            <div className="flex-1 space-y-3">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-0.5">Pickup From</p>
                                <p className="text-xs font-bold text-slate-900">Restaurant #{order.restaurantId}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-0.5">Deliver To</p>
                                <p className="text-xs font-bold text-slate-900 line-clamp-2">{order.deliveryAddress}</p>
                                {order.customerPhone && (
                                  <p className="text-[10px] font-semibold text-slate-500 mt-1 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                    {order.customerPhone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Special Instructions */}
                        {order.specialInstructions && (
                          <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
                            <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                              <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-1">Special Instructions</p>
                              <p className="text-xs font-semibold text-amber-900">{order.specialInstructions}</p>
                            </div>
                          </div>
                        )}

                        {/* Accept Button */}
                        <button
                          type="button"
                          disabled={acceptingOrder}
                          className="mt-4 w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {acceptingOrder ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Accepting Order...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Accept Order • Earn {formatCurrency(agentPayout)}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {availableOrders.length > 5 && (
                  <div className="text-center py-3">
                    <p className="text-xs font-bold text-slate-500">
                      +{availableOrders.length - 5} more order{availableOrders.length - 5 !== 1 ? 's' : ''} available
                    </p>
                  </div>
                )}
              </div>
            )}

            {agent?.isOnline && availableOrders.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <div className="flex justify-center mb-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <Clock size={32} className="text-slate-400" />
                  </div>
                </div>
                <p className="font-bold text-slate-600 mb-1">No Orders Available</p>
                <p className="text-xs text-slate-500">New orders will appear here automatically</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
