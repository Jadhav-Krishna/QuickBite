import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { orderService, type OrderDTO } from '../../api/order';
import { CheckCircle2, Clock, MapPin, Package, RefreshCw, Truck } from 'lucide-react';

const WS_URL = import.meta.env.VITE_WS_DELIVERY_URL || 'ws://localhost:8007/ws/tracking';
const OSRM_URL = import.meta.env.VITE_OSRM_URL || 'https://router.project-osrm.org/route/v1/driving';

// ── Map icons ────────────────────────────────────────────────────────────────
const courierIcon = L.divIcon({
  className: '',
  html: `<div style="width:44px;height:44px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 24px rgba(99,102,241,0.55);border:3px solid white;"><span style='transform:rotate(45deg);font-size:18px;'>🏍️</span></div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 44],
});
const restaurantIcon = L.divIcon({
  className: '',
  html: `<div style="width:38px;height:38px;background:linear-gradient(135deg,#f97316,#ef4444);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(249,115,22,0.5);border:3px solid white;font-size:18px;">🍽️</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});
const userIcon = L.divIcon({
  className: '',
  html: `<div style="width:38px;height:38px;background:linear-gradient(135deg,#22c55e,#16a34a);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(34,197,94,0.5);border:3px solid white;font-size:18px;">🏠</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

// ── Auto-pan helper ────────────────────────────────────────────────────────
function AutoPan({ pos }: { pos: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.panTo(pos, { animate: true, duration: 0.8 }); }, [pos, map]);
  return null;
}

// ── Order status pipeline ────────────────────────────────────────────────────
const STATUS_PIPELINE = [
  { key: 'PLACED',     label: 'Order Placed',     icon: Package },
  { key: 'CONFIRMED',  label: 'Confirmed',         icon: CheckCircle2 },
  { key: 'PREPARING',  label: 'Preparing',         icon: Clock },
  { key: 'READY',      label: 'Ready for Pickup',  icon: Package },
  { key: 'PICKED_UP',  label: 'Picked Up',         icon: Truck },
  { key: 'IN_TRANSIT', label: 'On the Way',        icon: MapPin },
  { key: 'DELIVERED',  label: 'Delivered',         icon: CheckCircle2 },
];

// Fixed demo positions (Mumbai-ish)
const RESTAURANT_POS: [number, number] = [19.0596, 72.8295];
const CUSTOMER_POS: [number, number]   = [19.076,  72.8777];

async function fetchRoadRoute(from: [number, number], to: [number, number]): Promise<[number, number][]> {
  try {
    const url = `${OSRM_URL}/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    const res  = await fetch(url);
    const data = await res.json();
    return data.routes[0].geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
    );
  } catch {
    return [from, to];
  }
}

export default function OrderTracking() {
  const { orderNumber = '' } = useParams();
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(Boolean(orderNumber));
  const [error, setError] = useState<string | null>(null);
  const [courierPos, setCourierPos] = useState<[number, number]>(RESTAURANT_POS);
  const [roadRoute, setRoadRoute] = useState<[number, number][]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // ── Fetch order ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!orderNumber) return;
    let cancelled = false;

    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrder(orderNumber);
        if (!cancelled) { setOrder(data); setError(null); }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to track order.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 20000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [orderNumber]);

  // ── OSRM road route ─────────────────────────────────────────────────────
  useEffect(() => {
    fetchRoadRoute(RESTAURANT_POS, CUSTOMER_POS).then(setRoadRoute);
  }, []);

  // ── WebSocket for live courier position ─────────────────────────────────
  useEffect(() => {
    if (!orderNumber) return;

    const connect = () => {
      const ws = new WebSocket(`${WS_URL}?orderId=${orderNumber}`);
      wsRef.current = ws;

      ws.onopen  = () => setWsConnected(true);
      ws.onclose = () => { setWsConnected(false); setTimeout(connect, 5000); };
      ws.onerror = () => ws.close();

      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          if (data.latitude && data.longitude) {
            setCourierPos([data.latitude, data.longitude]);
          }
        } catch { /* ignore parse errors */ }
      };
    };

    connect();
    return () => { wsRef.current?.close(); };
  }, [orderNumber]);

  // ── Status index ─────────────────────────────────────────────────────────
  const currentStatusIdx = useMemo(() => {
    if (!order?.status) return 0;
    const idx = STATUS_PIPELINE.findIndex((s) => s.key === order.status.toUpperCase());
    return idx >= 0 ? idx : 0;
  }, [order?.status]);

  const isDelivered = order?.status === 'DELIVERED';
  const isInTransit = ['PICKED_UP', 'IN_TRANSIT'].includes(order?.status || '');

  // Split the road route into completed + remaining based on courier proximity
  const completedRoute = roadRoute.length > 1 ? roadRoute.slice(0, Math.ceil(roadRoute.length * 0.45)) : [];
  const remainingRoute = roadRoute.length > 1 ? roadRoute.slice(Math.ceil(roadRoute.length * 0.45) - 1) : [];

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 animate-ping rounded-full bg-indigo-500/30" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
            <MapPin size={28} className="text-white" />
          </div>
        </div>
        <p className="font-bold text-[var(--color-on-surface-variant)] animate-pulse">Finding your order...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8 animate-fade-up">

      {/* ── Header ── */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-black text-[var(--color-on-surface)]">
            Order #{orderNumber || 'N/A'}
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
          <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">
            ✅ Delivered
          </span>
        ) : (
          <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-black text-indigo-700 animate-pulse">
            🚴 On the way
          </span>
        )}
      </header>

      {/* ── Error ── */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* ── Leaflet Map ── */}
      <div className="relative z-0 h-80 md:h-96 w-full overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-black/5">
        <MapContainer
          center={isInTransit ? courierPos : RESTAURANT_POS}
          zoom={14}
          scrollWheelZoom={false}
          className="h-full w-full"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          <AutoPan pos={isInTransit ? courierPos : RESTAURANT_POS} />

          {/* Completed path — vivid indigo */}
          {completedRoute.length > 1 && (
            <Polyline positions={completedRoute} color="#6366f1" weight={7} opacity={1} />
          )}
          {/* Remaining path — grey dashed */}
          {remainingRoute.length > 1 && (
            <Polyline positions={remainingRoute} color="#94a3b8" weight={5} opacity={0.7} dashArray="12,8" />
          )}

          <Marker position={RESTAURANT_POS} icon={restaurantIcon} />
          <Marker position={CUSTOMER_POS} icon={userIcon} />
          {isInTransit && <Marker position={courierPos} icon={courierIcon} />}
        </MapContainer>

        {/* Map overlay — ETA chip */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] rounded-full bg-white/90 backdrop-blur-lg shadow-xl px-5 py-2.5 flex items-center gap-2 border border-white/60">
          <Truck size={16} className="text-indigo-600" />
          <span className="text-sm font-black text-[var(--color-on-surface)]">
            {isDelivered ? 'Delivered!' : 'Estimated: 15–20 min'}
          </span>
        </div>
      </div>

      {/* ── Progress Timeline ── */}
      <div className="rounded-[2rem] bg-white border border-[var(--color-outline-variant)]/40 shadow-card p-6">
        <h3 className="mb-6 font-display text-xl font-black text-[var(--color-on-surface)]">Order Progress</h3>
        <div className="relative space-y-0">
          {STATUS_PIPELINE.map((step, idx) => {
            const isDone    = idx < currentStatusIdx;
            const isActive  = idx === currentStatusIdx;
            const isPending = idx > currentStatusIdx;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex items-start gap-4 pb-5 last:pb-0 relative">
                {/* Vertical connector line */}
                {idx < STATUS_PIPELINE.length - 1 && (
                  <div className={`absolute left-[19px] top-[38px] w-0.5 h-[calc(100%-20px)] ${isDone ? 'bg-indigo-400' : 'bg-[var(--color-outline-variant)]/40'}`} />
                )}

                {/* Step icon */}
                <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-110'
                    : isDone
                    ? 'border-indigo-400 bg-indigo-400 text-white'
                    : 'border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]'
                }`}>
                  {isActive && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-50" />
                  )}
                  <Icon size={16} className="relative z-10" />
                </div>

                {/* Step info */}
                <div className="pt-1.5">
                  <p className={`text-sm font-bold ${
                    isActive ? 'text-indigo-600' : isDone ? 'text-[var(--color-on-surface)]' : 'text-[var(--color-on-surface-variant)]'
                  }`}>
                    {step.label}
                    {isActive && <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 animate-pulse">← Current</span>}
                  </p>
                  {isPending && (
                    <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">Upcoming</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Order Summary Card ── */}
      {order && (
        <div className="rounded-[2rem] bg-white border border-[var(--color-outline-variant)]/40 shadow-card p-6 space-y-4">
          <h3 className="font-display text-xl font-black">Order Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)]">Payment</p>
              <p className="font-bold mt-0.5">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)]">Total</p>
              <p className="font-bold mt-0.5">₹{(order.finalAmount || order.totalAmount || 0).toFixed(0)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)]">Delivery Address</p>
              <p className="font-bold mt-0.5">{order.deliveryAddress}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
