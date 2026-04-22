import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, MapPin, Navigation2, CheckCircle2, ChevronLeft, AlertTriangle } from 'lucide-react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { orderService, type OrderDTO } from '../../api/order';
import { deliveryService } from '../../api/delivery';
import { useAuth } from '../../context/AuthContext';

const DELIVERY_SERVICE_URL = import.meta.env.VITE_DELIVERY_SERVICE_URL || 'http://localhost:8007';
const OSRM_URL = import.meta.env.VITE_OSRM_URL || 'https://router.project-osrm.org/route/v1/driving';

// ── Gorgeous DivIcon for the agent marker ──────────────────────────────────────
const agentIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:40px;height:40px;
    background:linear-gradient(135deg,#6366f1,#8b5cf6);
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 20px rgba(99,102,241,0.5);
    border:3px solid white;">
    <span style='transform:rotate(45deg);font-size:16px;'>🏍️</span>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const destIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:36px;height:36px;
    background:linear-gradient(135deg,#f97316,#ef4444);
    border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 16px rgba(239,68,68,0.5);
    border:3px solid white;
    font-size:16px;">📍</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const restaurantIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:36px;height:36px;
    background:linear-gradient(135deg,#22c55e,#16a34a);
    border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 16px rgba(34,197,94,0.5);
    border:3px solid white;
    font-size:16px;">🍽️</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

// ── Pan map to current agent position ────────────────────────────────────────
function MapPanner({ pos }: { pos: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.panTo(pos, { animate: true, duration: 0.8 }); }, [pos, map]);
  return null;
}

const ACTIVE_ORDER_STATUSES = ['READY', 'PICKED_UP', 'IN_TRANSIT', 'CONFIRMED'];

// Mumbai route coordinates (restaurant → customer)
const RESTAURANT_POS: [number, number] = [19.0596, 72.8295];
const CUSTOMER_POS: [number, number] = [19.076, 72.8777];

const FALLBACK_ASSIGNMENT: OrderDTO = {
  id: 101,
  orderNumber: 'QB2026-X89A',
  customerId: 1,
  restaurantId: 2,
  status: 'READY',
  totalAmount: 850,
  finalAmount: 850,
  deliveryAddress: 'Flat 4B, Koramangala 5th Block, Bengaluru',
  customerPhone: '+91 98765 43210',
  specialInstructions: 'Ring the bell twice and leave at the door.',
  paymentMethod: 'UPI',
  items: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
} as unknown as OrderDTO;

// ── Fetch OSRM road route between two lat/lng points ─────────────────────────
async function fetchRoadRoute(from: [number, number], to: [number, number]): Promise<[number, number][]> {
  try {
    const url = `${OSRM_URL}/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng]
    );
    return coords;
  } catch {
    // Fallback straight line if OSRM fails
    return [from, to];
  }
}

export default function AgentNavigation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [eta, setEta] = useState<string>('~8 min');
  const agentIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!user?.userId) {
        setTimeout(() => {
          setAssignment(FALLBACK_ASSIGNMENT);
          setLoading(false);
        }, 600);
        return;
      }
      try {
        const resolved = await deliveryService.resolveAgentForUser(user.userId);
        agentIdRef.current = resolved.agentId;
        const agentOrders = await orderService.getAgentOrders(resolved.agentId);
        const active = agentOrders.find((order) => ACTIVE_ORDER_STATUSES.includes(order.status));
        setAssignment(active || FALLBACK_ASSIGNMENT);
      } catch {
        setAssignment(FALLBACK_ASSIGNMENT);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [user?.userId]);

  // Fetch OSRM route when assignment loads
  useEffect(() => {
    if (!assignment) return;
    const isHeading = ['PICKED_UP', 'IN_TRANSIT'].includes(assignment.status);
    const dest = isHeading ? CUSTOMER_POS : RESTAURANT_POS;
    fetchRoadRoute(RESTAURANT_POS, dest).then((coords) => {
      setRoute(coords);
      setCurrentStep(0);
      const steps = coords.length;
      const estimatedMinutes = Math.max(2, Math.round(steps / 4));
      setEta(`~${estimatedMinutes} min`);
    });
  }, [assignment?.status]);

  // GPS broadcast simulation loop
  useEffect(() => {
    if (!assignment || route.length === 0) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      setCurrentStep((prev) => {
        if (prev >= route.length - 1) {
          clearInterval(intervalRef.current!);
          return prev;
        }
        const nextStep = prev + 1;
        const [lat, lng] = route[nextStep];

        // Push to backend via delivery-service
        const agentId = agentIdRef.current || user?.userId;
        if (agentId) {
          fetch(`${DELIVERY_SERVICE_URL}/api/v1/delivery/agents/${agentId}/location`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: String(assignment.id),
              latitude: lat,
              longitude: lng,
              accuracy: 5.0,
              address: 'Moving on route',
              status: assignment.status,
            }),
          }).catch(() => {});
        }

        const remaining = route.length - nextStep;
        setEta(`~${Math.max(1, Math.round(remaining / 4))} min`);
        return nextStep;
      });
    }, 2500);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [assignment, route]);

  const handleStatusUpdate = async (nextStatus: string) => {
    if (!assignment) return;
    setActionLoading(true);
    try {
      await orderService.updateOrderStatus(String(assignment.id), nextStatus);
    } catch {
      // Proceed even if API fails in demo mode
    }
    setAssignment({ ...assignment, status: nextStatus as never });
    setCurrentStep(0);
    if (nextStatus === 'DELIVERED') {
      setTimeout(() => navigate('/agent/dashboard'), 2000);
    }
    setActionLoading(false);
  };

  // ── Derived state ─────────────────────────────────────────────────────────
  const isHeadingToCustomer = ['PICKED_UP', 'IN_TRANSIT'].includes(assignment?.status || '');
  const agentPos: [number, number] = route.length > 0 ? route[currentStep] : RESTAURANT_POS;
  const completedRoute = route.slice(0, currentStep + 1);
  const remainingRoute = route.slice(currentStep);

  if (loading) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 animate-ping rounded-full bg-indigo-500/40" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/50">
              <Navigation2 size={28} className="text-white" />
            </div>
          </div>
          <p className="text-sm font-bold text-indigo-300 animate-pulse tracking-widest uppercase">Calculating Route...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center p-8">
        <MapPin size={64} className="mb-4 text-indigo-300" />
        <h3 className="font-display text-2xl font-bold text-[var(--color-on-surface)]">No Active Route</h3>
        <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">You don't have any active deliveries right now.</p>
        <button
          onClick={() => navigate('/agent/dashboard')}
          className="mt-6 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-105 active:scale-95"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const progressPercent = route.length > 0 ? Math.round((currentStep / (route.length - 1)) * 100) : 0;

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#f8f9fa]">

      {/* ── Full-screen Leaflet Map ────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={agentPos}
          zoom={15}
          scrollWheelZoom={false}
          className="h-full w-full"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          <MapPanner pos={agentPos} />

          {/* Completed path — solid vivid */}
          {completedRoute.length > 1 && (
            <Polyline positions={completedRoute} color="#6366f1" weight={7} opacity={1} />
          )}
          {/* Remaining path — dashed grey */}
          {remainingRoute.length > 1 && (
            <Polyline positions={remainingRoute} color="#94a3b8" weight={5} opacity={0.7} dashArray="12, 8" />
          )}

          {/* Markers */}
          <Marker position={RESTAURANT_POS} icon={restaurantIcon} />
          <Marker position={CUSTOMER_POS} icon={destIcon} />
          <Marker position={agentPos} icon={agentIcon} />
        </MapContainer>
      </div>

      {/* ── Top Glassmorphic Bar ──────────────────────────────────────────── */}
      <div className="relative z-10 m-3 mt-4 rounded-2xl bg-white/90 backdrop-blur-xl shadow-xl border border-white/60 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-container)] transition hover:bg-[var(--color-surface-variant)] active:scale-90"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
            {isHeadingToCustomer ? '📦 Heading to Customer' : '🍽️ Picking up from Restaurant'}
          </p>
          <h2 className="font-display text-sm font-black text-[var(--color-on-surface)] line-clamp-1">
            {isHeadingToCustomer ? assignment.deliveryAddress : 'Spice Route Kitchen'}
          </h2>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-black text-indigo-600">{eta}</p>
          <p className="text-[9px] font-bold uppercase text-[var(--color-on-surface-variant)]">ETA</p>
        </div>
      </div>

      {/* ── Turn-by-Turn Direction Banner ────────────────────────────────── */}
      <div className="relative z-10 mx-3 mt-1 rounded-2xl overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-700 p-4 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <Navigation2 size={22} className="text-white rotate-45" />
          </div>
          <div>
            <p className="font-display text-base font-bold text-white">
              {isHeadingToCustomer ? 'Continue straight for 2.1 km' : 'Turn right on MG Road'}
            </p>
            <p className="text-xs font-medium text-indigo-200">
              {progressPercent}% of route completed
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-indigo-900/30">
          <div
            className="h-full bg-gradient-to-r from-indigo-300 to-violet-300 transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex-1" />

      {/* ── Bottom Action Sheet ───────────────────────────────────────────── */}
      <div className="relative z-10 rounded-t-[2.5rem] bg-white shadow-[0_-20px_60px_rgba(0,0,0,0.12)] border-t border-gray-100 px-6 pb-10 pt-5">
        {/* Handle */}
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-gray-200" />

        {/* Customer/Restaurant info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)]">
              {isHeadingToCustomer ? 'Delivering to' : 'Picking up from'}
            </p>
            <h3 className="font-display text-xl font-black text-[var(--color-on-surface)] mt-0.5">
              {isHeadingToCustomer ? 'Customer' : 'Spice Route Kitchen'}
            </h3>
            <p className="text-xs font-semibold text-[var(--color-on-surface-variant)] mt-1 line-clamp-1">
              {isHeadingToCustomer ? assignment.deliveryAddress : '12th Main Rd, Koramangala'}
            </p>
            <p className="text-xs font-bold text-indigo-600 mt-1">Order #{assignment.orderNumber.slice(-4)}</p>
          </div>
          <a
            href={`tel:${assignment.customerPhone}`}
            className="ml-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm transition hover:bg-indigo-100 hover:scale-110 active:scale-95"
          >
            <Phone size={20} />
          </a>
        </div>

        {/* Instructions */}
        {assignment.specialInstructions && (
          <div className="mb-4 rounded-2xl bg-amber-50 border border-amber-200/80 p-3.5 flex items-start gap-2.5">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Note</p>
              <p className="text-xs font-semibold text-amber-900 mt-0.5">{assignment.specialInstructions}</p>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        {assignment.status === 'READY' || assignment.status === 'CONFIRMED' ? (
          <button
            onClick={() => handleStatusUpdate('PICKED_UP')}
            disabled={actionLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 py-4 text-base font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50 active:scale-95 disabled:opacity-60"
          >
            {actionLoading
              ? <><span className="animate-spin inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> Updating...</>
              : <><CheckCircle2 size={20} /> Confirm Pickup</>}
          </button>
        ) : assignment.status === 'PICKED_UP' || assignment.status === 'IN_TRANSIT' ? (
          <button
            onClick={() => handleStatusUpdate('DELIVERED')}
            disabled={actionLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 active:scale-95 disabled:opacity-60"
          >
            {actionLoading
              ? <><span className="animate-spin inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> Completing...</>
              : <><CheckCircle2 size={20} /> Mark as Delivered</>}
          </button>
        ) : (
          <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 py-4 text-base font-bold text-emerald-700">
            <CheckCircle2 size={20} /> Delivery Completed 🎉
          </div>
        )}
      </div>
    </div>
  );
}
