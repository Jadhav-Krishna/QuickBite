import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bike, CheckCircle2, Clock, Navigation, Star, TrendingUp } from 'lucide-react';
import { orderService, type OrderDTO } from '../../api/order';
import { deliveryService, type DeliveryAgentDTO } from '../../api/delivery';
import { reviewService } from '../../api/review';
import { useAuth } from '../../context/AuthContext';

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
      const resolved = await deliveryService.resolveAgentForUser(user.userId);
      const [earningsProfile, agentOrders, agentRating, readyOrders] = await Promise.all([
        deliveryService.getAgentEarnings(resolved.agentId).catch(() => resolved.agent),
        orderService.getAgentOrders(resolved.agentId).catch(() => []),
        reviewService.getDeliveryAgentRating(resolved.agentId).catch(() => 0),
        orderService.getAvailableOrders().catch(() => []),
      ]);

      setAgent({ ...resolved.agent, ...earningsProfile });
      setOrders(agentOrders);
      setAvailableOrders(readyOrders);
      setRating(Number(agentRating) || Number(resolved.agent.averageRating || 0));
    } catch (err: any) {
      setError(err?.message || 'Unable to load agent dashboard.');
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
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">
              {agent?.isOnline
                ? 'No active order. Accept the next available delivery to start navigation.'
                : 'Go online to receive and accept delivery orders.'}
            </p>
            {agent?.isOnline ? (
              <button
                type="button"
                onClick={() => void acceptNextOrder()}
                disabled={acceptingOrder || availableOrders.length === 0}
                className="mt-4 rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-red-600/20"
              >
                {acceptingOrder
                  ? 'Accepting...'
                  : availableOrders.length > 0
                    ? `Accept Next Order (${availableOrders.length} waiting)`
                    : 'No Ready Orders'}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
