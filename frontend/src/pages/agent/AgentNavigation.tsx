import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, MapPin, Navigation2, Phone, Store } from 'lucide-react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { orderService, type OrderDTO } from '../../api/order';
import { deliveryService } from '../../api/delivery';
import { geocodeAddress, getDirectionsUrl, getDrivingRoute, type LatLng } from '../../api/maps';
import { restaurantService, type Restaurant } from '../../api/restaurant';
import { useAuth } from '../../context/AuthContext';

const ACTIVE_ORDER_STATUSES = ['READY', 'PICKED_UP', 'IN_TRANSIT', 'CONFIRMED'];
const DEFAULT_POSITION: LatLng = [12.9716, 77.5946];
const REFRESH_MS = 10000;

const agentIcon = L.divIcon({
  className: '',
  html: `<div style="width:40px;height:40px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(99,102,241,0.5);border:3px solid white;"><span style="transform:rotate(45deg);font-size:16px;">A</span></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const destinationIcon = L.divIcon({
  className: '',
  html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#f97316,#ef4444);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(239,68,68,0.5);border:3px solid white;font-size:14px;">D</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

function MapPanner({ pos }: { pos: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.panTo(pos, { animate: true, duration: 0.8 });
  }, [pos, map]);
  return null;
}

function getStepMeta(status: string) {
  if (status === 'READY' || status === 'CONFIRMED') return { step: 1, label: 'Reach restaurant and pickup parcel' };
  if (status === 'PICKED_UP') return { step: 2, label: 'Pickup confirmed, start trip to customer' };
  if (status === 'IN_TRANSIT') return { step: 3, label: 'On route to customer drop-off' };
  if (status === 'DELIVERED') return { step: 4, label: 'Order delivered successfully' };
  return { step: 1, label: 'Assignment active' };
}

export default function AgentNavigation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<LatLng>(DEFAULT_POSITION);
  const [destinationPosition, setDestinationPosition] = useState<LatLng | null>(null);
  const [route, setRoute] = useState<LatLng[]>([]);
  const [eta, setEta] = useState('Calculating');
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [cashCollected, setCashCollected] = useState(false);
  const agentIdRef = useRef<number | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const isHeadingToCustomer = useMemo(
    () => ['PICKED_UP', 'IN_TRANSIT'].includes(assignment?.status || ''),
    [assignment?.status],
  );

  const loadAssignment = useCallback(async (showSpinner = false) => {
    if (!user?.userId) {
      setError('Please sign in as a delivery agent.');
      setLoading(false);
      return;
    }

    if (showSpinner) setLoading(true);

    try {
      setError(null);
      const resolved = await deliveryService.resolveAgentForUser(user.userId);
      agentIdRef.current = resolved.agentId;

      if (
        typeof resolved.agent.currentLatitude === 'number' &&
        typeof resolved.agent.currentLongitude === 'number' &&
        resolved.agent.currentLatitude !== 0 &&
        resolved.agent.currentLongitude !== 0
      ) {
        setCurrentPosition([resolved.agent.currentLatitude, resolved.agent.currentLongitude]);
      }

      const agentOrders = await orderService.getAgentOrders(resolved.agentId);
      const active = agentOrders.find((order) => ACTIVE_ORDER_STATUSES.includes(order.status));
      setAssignment(active || null);
    } catch (err: any) {
      setError(err?.message || 'Unable to load current assignment.');
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    void loadAssignment(true);
    const interval = setInterval(() => {
      void loadAssignment();
    }, REFRESH_MS);
    return () => clearInterval(interval);
  }, [loadAssignment]);

  useEffect(() => {
    if (!assignment?.restaurantId) {
      setRestaurant(null);
      return;
    }

    const loadRestaurant = async () => {
      try {
        const data = await restaurantService.getRestaurantById(assignment.restaurantId);
        setRestaurant(data);
      } catch {
        setRestaurant(null);
      }
    };

    void loadRestaurant();
  }, [assignment?.restaurantId]);

  useEffect(() => {
    if (!assignment?.orderNumber) {
      setCashCollected(false);
      return;
    }
    const key = `cash-collected:${assignment.orderNumber}`;
    setCashCollected(localStorage.getItem(key) === 'true');
  }, [assignment?.orderNumber]);

  useEffect(() => {
    if (!assignment) {
      setDestinationPosition(null);
      return;
    }

    const resolveDestination = async () => {
      try {
        if (isHeadingToCustomer) {
          const customerCoords = await geocodeAddress(assignment.deliveryAddress || '');
          setDestinationPosition(customerCoords || null);
          return;
        }

        const restaurantAddress = [restaurant?.address, restaurant?.city, restaurant?.state].filter(Boolean).join(', ');
        const restaurantCoords = await geocodeAddress(restaurantAddress || assignment.deliveryAddress || '');
        setDestinationPosition(restaurantCoords || null);
      } catch {
        setDestinationPosition(null);
      }
    };

    void resolveDestination();
  }, [assignment, isHeadingToCustomer, restaurant]);

  useEffect(() => {
    if (!destinationPosition) {
      setRoute([]);
      setEta('Calculating');
      return;
    }

    const updateRoute = async () => {
      const routeData = await getDrivingRoute(currentPosition, destinationPosition);
      setRoute(routeData.coordinates);
      if (routeData.durationSeconds > 0) {
        setEta(`~${Math.max(1, Math.round(routeData.durationSeconds / 60))} min`);
      } else {
        setEta(`~${Math.max(2, Math.round(routeData.coordinates.length / 15))} min`);
      }
    };

    void updateRoute();
  }, [currentPosition, destinationPosition]);

  useEffect(() => {
    if (!assignment || !agentIdRef.current || !navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const nextPos: LatLng = [position.coords.latitude, position.coords.longitude];
        setCurrentPosition(nextPos);

        void deliveryService.updateLocation(agentIdRef.current!, {
          orderId: assignment.id,
          latitude: nextPos[0],
          longitude: nextPos[1],
          accuracy: position.coords.accuracy.toFixed(1),
          address: 'Live GPS update',
          status: assignment.status,
        });
      },
      () => {
        // Keep last known position when geolocation fails.
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000,
      },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [assignment?.id, assignment?.status]);

  const handleStatusUpdate = async (nextStatus: string) => {
    if (!assignment) return;
    setActionLoading(true);
    setError(null);

    try {
      const updated = await orderService.updateOrderStatus(assignment.orderNumber, nextStatus);
      setAssignment(updated);

      if (nextStatus === 'DELIVERED') {
        setTimeout(() => navigate('/agent/dashboard'), 1200);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to update order status.');
    } finally {
      setActionLoading(false);
    }
  };

  const openExternalNavigation = () => {
    if (!destinationPosition) return;
    const url = getDirectionsUrl(currentPosition, destinationPosition);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCollectCash = () => {
    if (!assignment?.orderNumber) return;
    localStorage.setItem(`cash-collected:${assignment.orderNumber}`, 'true');
    setCashCollected(true);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-sm font-bold text-slate-500">Loading navigation...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center p-6 text-center">
        <MapPin size={48} className="mb-4 text-slate-300" />
        <h3 className="font-display text-2xl font-black text-slate-900">No active order</h3>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Accept an order from your dashboard to start live navigation.
        </p>
        <button
          onClick={() => navigate('/agent/dashboard')}
          className="mt-5 rounded-full bg-indigo-600 px-6 py-3 text-sm font-bold text-white"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const destinationLabel = isHeadingToCustomer
    ? assignment.deliveryAddress
    : (restaurant?.name || `Restaurant #${assignment.restaurantId}`);

  const stepMeta = getStepMeta(assignment.status);

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-slate-50">
      {error ? (
        <div className="relative z-20 m-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
          {error}
        </div>
      ) : null}

      <div className="absolute inset-0 z-0">
        <MapContainer center={currentPosition} zoom={15} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          <MapPanner pos={currentPosition} />

          {route.length > 1 ? <Polyline positions={route} color="#6366f1" weight={6} opacity={0.95} /> : null}

          <Marker position={currentPosition} icon={agentIcon} />
          {destinationPosition ? <Marker position={destinationPosition} icon={destinationIcon} /> : null}
        </MapContainer>
      </div>

      <div className="relative z-10 m-3 mt-4 rounded-2xl border border-white/60 bg-white/90 px-4 py-3 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
            <ChevronLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
              {isHeadingToCustomer ? 'Heading to customer' : 'Heading to restaurant'}
            </p>
            <p className="truncate text-sm font-black text-slate-900">{destinationLabel}</p>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{stepMeta.label}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-indigo-600">{eta}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">ETA</p>
          </div>
        </div>
      </div>

      <div className="flex-1" />

      <div className="relative z-10 rounded-t-[2.2rem] border-t border-slate-200 bg-white px-6 pb-9 pt-5 shadow-[0_-20px_50px_rgba(0,0,0,0.12)]">
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-200" />

        <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Delivery Flow</p>
          <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] font-bold">
            <span className={stepMeta.step >= 1 ? 'text-indigo-600' : 'text-slate-400'}>1. Reach Pickup</span>
            <span className={stepMeta.step >= 2 ? 'text-indigo-600' : 'text-slate-400'}>2. Start Delivery</span>
            <span className={stepMeta.step >= 3 ? 'text-indigo-600' : 'text-slate-400'}>3. Drop Order</span>
          </div>
        </div>

        <div className="mb-4 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order</p>
            <h3 className="font-display text-2xl font-black text-slate-900">#{assignment.orderNumber.slice(-6)}</h3>
            <p className="mt-1 text-xs font-semibold text-slate-500 line-clamp-1">{destinationLabel}</p>
          </div>
          <div className="ml-4 flex gap-2">
            {restaurant?.phoneNumber ? (
              <a
                href={`tel:${restaurant.phoneNumber}`}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-700"
                title="Call Restaurant"
              >
                <Store size={18} />
              </a>
            ) : null}
            <a
              href={`tel:${assignment.customerPhone}`}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 text-indigo-600"
              title="Call Customer"
            >
              <Phone size={18} />
            </a>
          </div>
        </div>

        {!isHeadingToCustomer && restaurant ? (
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Pickup Point</p>
            <p className="text-sm font-bold text-amber-900 mt-0.5">{restaurant.name}</p>
            <p className="text-xs font-semibold text-amber-800 line-clamp-1">{restaurant.address}</p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={openExternalNavigation}
          disabled={!destinationPosition}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm font-bold text-slate-700 disabled:opacity-60"
        >
          <Navigation2 size={16} /> Open External Navigation
        </button>

        {assignment.status === 'READY' && !assignment.agentPickupConfirmed ? (
          <button
            onClick={async () => {
              if (!agentIdRef.current) return;
              setActionLoading(true);
              setError(null);
              try {
                const updated = await orderService.confirmPickupByAgent(assignment.orderNumber, agentIdRef.current);
                setAssignment(updated);
              } catch (err: any) {
                setError(err?.message || 'Unable to confirm pickup.');
              } finally {
                setActionLoading(false);
              }
            }}
            disabled={actionLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-base font-bold text-white disabled:opacity-60"
          >
            {actionLoading ? 'Updating...' : <><CheckCircle2 size={18} /> Confirm Pickup at Restaurant</>}
          </button>
        ) : assignment.status === 'READY' && assignment.agentPickupConfirmed && !assignment.restaurantPickupConfirmed ? (
          <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 py-4 text-base font-bold text-indigo-700">
            <CheckCircle2 size={18} /> Waiting Restaurant Pickup Confirmation
          </div>
        ) : assignment.status === 'PICKED_UP' ? (
          <button
            onClick={() => void handleStatusUpdate('IN_TRANSIT')}
            disabled={actionLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-base font-bold text-white disabled:opacity-60"
          >
            {actionLoading ? 'Updating...' : <><CheckCircle2 size={18} /> Start Trip to Customer</>}
          </button>
        ) : assignment.status === 'IN_TRANSIT' ? (
          assignment.paymentMethod === 'CASH_ON_DELIVERY' && !cashCollected ? (
            <button
              onClick={handleCollectCash}
              disabled={actionLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-600 py-4 text-base font-bold text-white disabled:opacity-60"
            >
              <CheckCircle2 size={18} /> Collect Cash
            </button>
          ) : (
          <button
            onClick={() => void handleStatusUpdate('DELIVERED')}
            disabled={actionLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-base font-bold text-white disabled:opacity-60"
          >
            {actionLoading ? 'Completing...' : <><CheckCircle2 size={18} /> Delivery Done</>}
          </button>
          )
        ) : (
          <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 py-4 text-base font-bold text-emerald-700">
            <CheckCircle2 size={18} /> Delivery Completed
          </div>
        )}
      </div>
    </div>
  );
}
