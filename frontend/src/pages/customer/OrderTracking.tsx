import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { CheckCircle2, Clock, MapPin, Package, RefreshCw, Truck } from 'lucide-react';
import { orderService } from '../../api/order';
import { restaurantService } from '../../api/restaurant';
import { geocodeAddress, getDrivingRoute, type LatLng } from '../../api/maps';
import { getCurrentUser } from '../../utils/session';
import type { OrderDTO } from '../../api/order';

const WS_URL = import.meta.env.VITE_WS_DELIVERY_URL || 'ws://' + window.location.hostname + ':8000/ws/tracking';
const DEFAULT_RESTAURANT_POS: LatLng = [19.0596, 72.8295];
const DEFAULT_CUSTOMER_POS: LatLng = [19.076, 72.8777];

const courierIcon = L.divIcon({
  className: '',
  html: `<div style="width:44px;height:44px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 24px rgba(99,102,241,0.55);border:3px solid white;"><span style='transform:rotate(45deg);font-size:18px;'>A</span></div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 44],
});

const restaurantIcon = L.divIcon({
  className: '',
  html: `<div style="width:38px;height:38px;background:linear-gradient(135deg,#f97316,#ef4444);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(249,115,22,0.5);border:3px solid white;font-size:16px;">R</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

const userIcon = L.divIcon({
  className: '',
  html: `<div style="width:38px;height:38px;background:linear-gradient(135deg,#22c55e,#16a34a);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(34,197,94,0.5);border:3px solid white;font-size:16px;">C</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

const STATUS_PIPELINE = [
  { key: 'PLACED', label: 'Order Placed', icon: Package },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'PREPARING', label: 'Preparing', icon: Clock },
  { key: 'READY', label: 'Ready for Pickup', icon: Package },
  { key: 'PICKED_UP', label: 'Picked Up', icon: Truck },
  { key: 'IN_TRANSIT', label: 'On the Way', icon: MapPin },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
  { key: 'CANCELLED', label: 'Cancelled', icon: CheckCircle2 },
];

function AutoPan({ pos }: { pos: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.panTo(pos, { animate: true, duration: 0.8 });
  }, [pos, map]);
  return null;
}

const distanceSq = (a: LatLng, b: LatLng) => {
  const dLat = a[0] - b[0];
  const dLng = a[1] - b[1];
  return dLat * dLat + dLng * dLng;
};

export default function OrderTracking() {
  const { orderNumber = '' } = useParams();
  const [resolvedOrderNumber, setResolvedOrderNumber] = useState('');
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [restaurantPos, setRestaurantPos] = useState<LatLng>(DEFAULT_RESTAURANT_POS);
  const [customerPos, setCustomerPos] = useState<LatLng>(DEFAULT_CUSTOMER_POS);
  const [courierPos, setCourierPos] = useState<LatLng>(DEFAULT_RESTAURANT_POS);
  const [agentToRestaurantRoute, setAgentToRestaurantRoute] = useState<LatLng[]>([]);
  const [restaurantToCustomerRoute, setRestaurantToCustomerRoute] = useState<LatLng[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const effectiveOrderNumber = orderNumber || resolvedOrderNumber;
  const isInTransit = ['PICKED_UP', 'IN_TRANSIT'].includes(order?.status || '');

  useEffect(() => {
    if (orderNumber) return;

    let cancelled = false;
    const resolveLatestOrder = async () => {
      try {
        const user = getCurrentUser();
        if (!user?.userId) {
          if (!cancelled) {
            setError('Please login to track your order.');
            setLoading(false);
          }
          return;
        }

        const customerOrders = await orderService.getCustomerOrders(user.userId);
        const latest = customerOrders[0];
        if (!cancelled) {
          if (latest?.orderNumber) {
            setResolvedOrderNumber(latest.orderNumber);
          } else {
            setError('No orders found to track.');
            setLoading(false);
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to fetch your latest order.');
          setLoading(false);
        }
      }
    };

    void resolveLatestOrder();
    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  useEffect(() => {
    if (!effectiveOrderNumber) return;
    let cancelled = false;

    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrder(effectiveOrderNumber);
        if (!cancelled) {
          setOrder(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to track order.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchOrder();
    const interval = setInterval(() => {
      void fetchOrder();
    }, 20000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [effectiveOrderNumber]);

  useEffect(() => {
    if (!order) return;

    let cancelled = false;
    const resolveRouteEndpoints = async () => {
      try {
        const restaurant = await restaurantService.getRestaurantById(order.restaurantId);
        const customerCoordsPromise = geocodeAddress(order.deliveryAddress || '');

        let resolvedRestaurant: LatLng | null = null;
        if (typeof restaurant.latitude === 'number' && typeof restaurant.longitude === 'number') {
          resolvedRestaurant = [restaurant.latitude, restaurant.longitude];
        } else {
          const restaurantAddress = [restaurant.address, restaurant.city, restaurant.state]
            .filter(Boolean)
            .join(', ');
          resolvedRestaurant = await geocodeAddress(restaurantAddress);
        }

        const resolvedCustomer = await customerCoordsPromise;
        if (cancelled) return;

        const finalRestaurant = resolvedRestaurant || DEFAULT_RESTAURANT_POS;
        const finalCustomer = resolvedCustomer || DEFAULT_CUSTOMER_POS;

        setRestaurantPos(finalRestaurant);
        setCustomerPos(finalCustomer);

        if (!['PICKED_UP', 'IN_TRANSIT'].includes(order.status || '')) {
          setCourierPos(finalRestaurant);
        }
      } catch {
        if (!cancelled) {
          setRestaurantPos(DEFAULT_RESTAURANT_POS);
          setCustomerPos(DEFAULT_CUSTOMER_POS);
        }
      }
    };

    void resolveRouteEndpoints();
    return () => {
      cancelled = true;
    };
  }, [order?.restaurantId, order?.deliveryAddress, order?.status]);

  useEffect(() => {
    let cancelled = false;
    const loadRoutes = async () => {
      // Always load restaurant to customer route (blue)
      const restaurantToCustomerResult = await getDrivingRoute(restaurantPos, customerPos);
      if (!cancelled) {
        setRestaurantToCustomerRoute(restaurantToCustomerResult.coordinates);
      }
      
      // Load agent to restaurant route (red) when order is picked up or in transit
      if (isInTransit) {
        const agentToRestaurantResult = await getDrivingRoute(courierPos, restaurantPos);
        if (!cancelled) {
          setAgentToRestaurantRoute(agentToRestaurantResult.coordinates);
        }
      } else {
        // Clear agent route when not in transit
        if (!cancelled) {
          setAgentToRestaurantRoute([]);
        }
      }
    };

    void loadRoutes();
    return () => {
      cancelled = true;
    };
  }, [restaurantPos, customerPos, courierPos, isInTransit]);

  useEffect(() => {
    if (!effectiveOrderNumber) return;

    const connect = () => {
      const ws = new WebSocket(`${WS_URL}?orderId=${effectiveOrderNumber}`);
      wsRef.current = ws;

      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => {
        setWsConnected(false);
        setTimeout(connect, 5000);
      };
      ws.onerror = () => ws.close();

      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          if (data.latitude && data.longitude) {
            const lat = Number(data.latitude);
            const lng = Number(data.longitude);
            if (Number.isFinite(lat) && Number.isFinite(lng)) {
              setCourierPos([lat, lng]);
            }
            return;
          }

          if (data.type === 'DELIVERY_STATUS' && data.payload?.orderStatus) {
            setOrder((current) =>
              current
                ? {
                    ...current,
                    status: String(data.payload.orderStatus),
                  }
                : current,
            );
          }
        } catch {
          // Ignore malformed websocket payloads.
        }
      };
    };

    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [effectiveOrderNumber]);

  const currentStatusIdx = useMemo(() => {
    if (!order?.status) return 0;
    const idx = STATUS_PIPELINE.findIndex((s) => s.key === order.status.toUpperCase());
    return idx >= 0 ? idx : 0;
  }, [order?.status]);

  const splitIndex = useMemo(() => {
    if (restaurantToCustomerRoute.length < 2) return 0;
    if (!isInTransit) return Math.floor(restaurantToCustomerRoute.length * 0.45);

    let nearestIdx = 0;
    let nearestDist = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < restaurantToCustomerRoute.length; i += 1) {
      const currentDist = distanceSq(restaurantToCustomerRoute[i], courierPos);
      if (currentDist < nearestDist) {
        nearestDist = currentDist;
        nearestIdx = i;
      }
    }

    return nearestIdx;
  }, [restaurantToCustomerRoute, courierPos, isInTransit]);

  const completedRoute = restaurantToCustomerRoute.length > 1 ? restaurantToCustomerRoute.slice(0, Math.max(2, splitIndex + 1)) : [];
  const remainingRoute = restaurantToCustomerRoute.length > 1 ? restaurantToCustomerRoute.slice(Math.max(0, splitIndex)) : [];

  const isDelivered = order?.status === 'DELIVERED';
  const isCancelled = order?.status === 'CANCELLED';

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 animate-ping rounded-full bg-indigo-500/30" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-2xl">
            <MapPin size={40} className="text-white animate-pulse" />
          </div>
        </div>
        <p className="mt-6 text-xl font-bold text-gray-700 animate-pulse">Finding your order...</p>
        <div className="mt-4 flex gap-2">
          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Header */}
      <div className="relative z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 truncate">
                Order #{effectiveOrderNumber || 'N/A'}
              </h1>
              <div className="mt-2 flex items-center gap-3 flex-wrap">
                {wsConnected ? (
                  <span className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>
                    Live Tracking
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                    <RefreshCw size={14} className="animate-spin" /> Connecting...
                  </span>
                )}
                {isDelivered ? (
                  <span className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-1.5 text-xs sm:text-sm font-black text-white shadow-lg">
                    <CheckCircle2 size={16} />
                    Delivered
                  </span>
                ) : isCancelled ? (
                  <span className="rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-4 py-1.5 text-xs sm:text-sm font-black text-white shadow-lg">
                    Cancelled
                  </span>
                ) : (
                  <span className="animate-pulse rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-1.5 text-xs sm:text-sm font-black text-white shadow-lg">
                    On the way
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="relative z-10 mx-4 mt-4 rounded-2xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 text-sm font-semibold text-red-700 shadow-lg">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Map Section */}
        <div className="relative flex-1 h-[40vh] lg:h-auto">
          <MapContainer
            center={isInTransit ? courierPos : restaurantPos}
            zoom={14}
            scrollWheelZoom={false}
            className="h-full w-full"
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            <AutoPan pos={isInTransit ? courierPos : restaurantPos} />

            {/* Red route: Agent to Restaurant (only when in transit) */}
            {agentToRestaurantRoute.length > 1 && isInTransit && (
              <Polyline positions={agentToRestaurantRoute} color="#ef4444" weight={6} opacity={0.9} dashArray="10,5" />
            )}

            {/* Blue route: Restaurant to Customer - Completed portion */}
            {completedRoute.length > 1 && (
              <Polyline positions={completedRoute} color="#3b82f6" weight={7} opacity={1} />
            )}
            {/* Blue route: Restaurant to Customer - Remaining portion */}
            {remainingRoute.length > 1 && (
              <Polyline positions={remainingRoute} color="#94a3b8" weight={5} opacity={0.7} dashArray="12,8" />
            )}

            <Marker position={restaurantPos} icon={restaurantIcon} />
            <Marker position={customerPos} icon={userIcon} />
            {isInTransit && <Marker position={courierPos} icon={courierIcon} />}
          </MapContainer>

          {/* Floating ETA Badge */}
          <div className="absolute bottom-6 left-1/2 z-[1000] flex -translate-x-1/2 items-center gap-3 rounded-2xl border-2 border-white/80 bg-white/95 px-6 py-3 shadow-2xl backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500">
              <Truck size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Estimated Time</p>
              <p className="text-lg font-black text-gray-900">
                {isDelivered ? 'Delivered!' : isCancelled ? 'Cancelled' : '15-20 min'}
              </p>
            </div>
          </div>

          {/* Map Legend */}
          <div className="absolute top-6 right-6 z-[1000] hidden lg:flex flex-col gap-2 rounded-xl bg-white/95 backdrop-blur-xl p-4 shadow-xl border border-gray-200/50">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gradient-to-br from-orange-500 to-red-500 border-2 border-white shadow" />
              <span className="text-xs font-bold text-gray-700">Restaurant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 border-2 border-white shadow" />
              <span className="text-xs font-bold text-gray-700">Your Location</span>
            </div>
            {isInTransit && (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border-2 border-white shadow" />
                <span className="text-xs font-bold text-gray-700">Delivery Agent</span>
              </div>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="flex-1 lg:max-w-xl overflow-y-auto bg-white shadow-2xl">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Order Progress */}
            <div className="rounded-3xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 sm:p-8 shadow-lg border border-indigo-100">
              <h3 className="mb-6 font-display text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                  <Package size={20} className="text-white" />
                </div>
                Order Progress
              </h3>
              <div className="relative space-y-0">
                {STATUS_PIPELINE.map((step, idx) => {
                  const isDone = idx < currentStatusIdx;
                  const isActive = idx === currentStatusIdx;
                  const isPending = idx > currentStatusIdx;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="relative flex items-start gap-4 pb-6 last:pb-0">
                      {idx < STATUS_PIPELINE.length - 1 && (
                        <div
                          className={`absolute left-[23px] top-[46px] h-[calc(100%-28px)] w-1 rounded-full transition-all ${
                            isDone ? 'bg-gradient-to-b from-indigo-500 to-purple-500' : 'bg-gray-200'
                          }`}
                        />
                      )}

                      <div
                        className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-3 transition-all duration-300 ${
                          isActive
                            ? 'scale-110 border-indigo-500 bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-2xl shadow-indigo-500/50'
                            : isDone
                              ? 'border-indigo-400 bg-gradient-to-br from-indigo-400 to-purple-400 text-white shadow-lg'
                              : 'border-gray-300 bg-white text-gray-400 shadow'
                        }`}
                      >
                        {isActive && (
                          <>
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-2xl bg-indigo-400 opacity-50" />
                            <span className="absolute inline-flex h-full w-full rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 opacity-75 blur-xl" />
                          </>
                        )}
                        <Icon size={20} className="relative z-10" />
                      </div>

                      <div className="pt-2 flex-1">
                        <p
                          className={`text-sm sm:text-base font-bold ${
                            isActive
                              ? 'text-indigo-600'
                              : isDone
                                ? 'text-gray-900'
                                : 'text-gray-500'
                          }`}
                        >
                          {step.label}
                          {isActive && (
                            <span className="ml-2 animate-pulse inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full">
                              Now
                            </span>
                          )}
                        </p>
                        {isPending && <p className="mt-1 text-xs text-gray-400 font-medium">Upcoming</p>}
                        {isDone && !isActive && <p className="mt-1 text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={12} /> Completed</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Details */}
            {order && (
              <div className="rounded-3xl bg-gradient-to-br from-slate-50 to-gray-100 p-6 sm:p-8 shadow-lg border border-gray-200">
                <h3 className="mb-6 font-display text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-gray-700 shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  Order Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-gray-200">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Payment Method</p>
                      <p className="text-base sm:text-lg font-bold text-gray-900">{order.paymentMethod}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-gray-200">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Total Amount</p>
                      <p className="text-2xl sm:text-3xl font-black text-gray-900">₹{(order.finalAmount || order.totalAmount || 0).toFixed(0)}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white shadow-sm border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
                        <MapPin size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Delivery Address</p>
                        <p className="text-sm sm:text-base font-bold text-gray-900 break-words">{order.deliveryAddress}</p>
                      </div>
                    </div>
                  </div>
                  {order.specialInstructions && (
                    <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200">
                      <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-1">Special Instructions</p>
                      <p className="text-sm font-medium text-amber-900">{order.specialInstructions}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Items */}
            {order?.items && order.items.length > 0 && (
              <div className="rounded-3xl bg-gradient-to-br from-orange-50 to-red-50 p-6 sm:p-8 shadow-lg border border-orange-200">
                <h3 className="mb-6 font-display text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  Order Items
                </h3>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-orange-200">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-red-100 text-orange-600 font-black">
                          {item.quantity}x
                        </div>
                        <p className="font-bold text-gray-900">{item.itemName}</p>
                      </div>
                      <p className="text-lg font-black text-gray-900">₹{(item.price * item.quantity).toFixed(0)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}