import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { CheckCircle2, Clock, MapPin, Package, RefreshCw, Truck } from 'lucide-react';
import { orderService, type OrderDTO } from '../../api/order';
import { restaurantService } from '../../api/restaurant';
import { geocodeAddress, getDrivingRoute, type LatLng } from '../../api/maps';
import { getCurrentUser } from '../../utils/session';

const WS_URL = import.meta.env.VITE_WS_DELIVERY_URL || 'ws://localhost:8007/ws/tracking';
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
  const [roadRoute, setRoadRoute] = useState<LatLng[]>([]);
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
    const loadRoute = async () => {
      const routeResult = await getDrivingRoute(restaurantPos, customerPos);
      if (!cancelled) {
        setRoadRoute(routeResult.coordinates);
      }
    };

    void loadRoute();
    return () => {
      cancelled = true;
    };
  }, [restaurantPos, customerPos]);

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
    if (roadRoute.length < 2) return 0;
    if (!isInTransit) return Math.floor(roadRoute.length * 0.45);

    let nearestIdx = 0;
    let nearestDist = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < roadRoute.length; i += 1) {
      const currentDist = distanceSq(roadRoute[i], courierPos);
      if (currentDist < nearestDist) {
        nearestDist = currentDist;
        nearestIdx = i;
      }
    }

    return nearestIdx;
  }, [roadRoute, courierPos, isInTransit]);

  const completedRoute = roadRoute.length > 1 ? roadRoute.slice(0, Math.max(2, splitIndex + 1)) : [];
  const remainingRoute = roadRoute.length > 1 ? roadRoute.slice(Math.max(0, splitIndex)) : [];

  const isDelivered = order?.status === 'DELIVERED';
  const isCancelled = order?.status === 'CANCELLED';

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 animate-ping rounded-full bg-indigo-500/30" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
            <MapPin size={28} className="text-white" />
          </div>
        </div>
        <p className="animate-pulse font-bold text-[var(--color-on-surface-variant)]">Finding your order...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8 animate-fade-up">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-black text-[var(--color-on-surface)]">
            Order #{effectiveOrderNumber || 'N/A'}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            {wsConnected ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Live tracking active
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-on-surface-variant)]">
                <RefreshCw size={12} className="animate-spin" /> Connecting...
              </span>
            )}
          </div>
        </div>
        {isDelivered ? (
          <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">Delivered</span>
        ) : isCancelled ? (
          <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-black text-red-700">Cancelled</span>
        ) : (
          <span className="animate-pulse rounded-full bg-indigo-100 px-4 py-2 text-sm font-black text-indigo-700">On the way</span>
        )}
      </header>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="relative z-0 h-80 w-full overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-black/5 md:h-96">
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

          {completedRoute.length > 1 && (
            <Polyline positions={completedRoute} color="#6366f1" weight={7} opacity={1} />
          )}
          {remainingRoute.length > 1 && (
            <Polyline positions={remainingRoute} color="#94a3b8" weight={5} opacity={0.7} dashArray="12,8" />
          )}

          <Marker position={restaurantPos} icon={restaurantIcon} />
          <Marker position={customerPos} icon={userIcon} />
          {isInTransit && <Marker position={courierPos} icon={courierIcon} />}
        </MapContainer>

        <div className="absolute bottom-4 left-1/2 z-[1000] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/60 bg-white/90 px-5 py-2.5 shadow-xl backdrop-blur-lg">
          <Truck size={16} className="text-indigo-600" />
          <span className="text-sm font-black text-[var(--color-on-surface)]">
            {isDelivered ? 'Delivered' : isCancelled ? 'Order Cancelled' : 'Estimated: 15-20 min'}
          </span>
        </div>
      </div>

      <div className="rounded-[2rem] border border-[var(--color-outline-variant)]/40 bg-white p-6 shadow-card">
        <h3 className="mb-6 font-display text-xl font-black text-[var(--color-on-surface)]">Order Progress</h3>
        <div className="relative space-y-0">
          {STATUS_PIPELINE.map((step, idx) => {
            const isDone = idx < currentStatusIdx;
            const isActive = idx === currentStatusIdx;
            const isPending = idx > currentStatusIdx;
            const Icon = step.icon;

            return (
              <div key={step.key} className="relative flex items-start gap-4 pb-5 last:pb-0">
                {idx < STATUS_PIPELINE.length - 1 && (
                  <div
                    className={`absolute left-[19px] top-[38px] h-[calc(100%-20px)] w-0.5 ${
                      isDone ? 'bg-indigo-400' : 'bg-[var(--color-outline-variant)]/40'
                    }`}
                  />
                )}

                <div
                  className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    isActive
                      ? 'scale-110 border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                      : isDone
                        ? 'border-indigo-400 bg-indigo-400 text-white'
                        : 'border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]'
                  }`}
                >
                  {isActive && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-50" />
                  )}
                  <Icon size={16} className="relative z-10" />
                </div>

                <div className="pt-1.5">
                  <p
                    className={`text-sm font-bold ${
                      isActive
                        ? 'text-indigo-600'
                        : isDone
                          ? 'text-[var(--color-on-surface)]'
                          : 'text-[var(--color-on-surface-variant)]'
                    }`}
                  >
                    {step.label}
                    {isActive && (
                      <span className="ml-2 animate-pulse text-[10px] font-black uppercase tracking-widest text-indigo-500">
                        Current
                      </span>
                    )}
                  </p>
                  {isPending && <p className="mt-0.5 text-xs text-[var(--color-on-surface-variant)]">Upcoming</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {order && (
        <div className="space-y-4 rounded-[2rem] border border-[var(--color-outline-variant)]/40 bg-white p-6 shadow-card">
          <h3 className="font-display text-xl font-black">Order Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)]">Payment</p>
              <p className="mt-0.5 font-bold">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)]">Total</p>
              <p className="mt-0.5 font-bold">Rs {(order.finalAmount || order.totalAmount || 0).toFixed(0)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)]">Delivery Address</p>
              <p className="mt-0.5 font-bold">{order.deliveryAddress}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
