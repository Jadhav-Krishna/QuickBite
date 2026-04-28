import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { locationService, geolocationUtils, type MultiRouteResponse } from '../../services/location/locationService';
import { Loader2, Navigation, MapPin } from 'lucide-react';

interface AgentTrackerProps {
  agentId: number;
  orderId: number;
  restaurantLat: number;
  restaurantLng: number;
  customerLat: number;
  customerLng: number;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

export default function AgentTracker({
  agentId,
  orderId,
  restaurantLat,
  restaurantLng,
  customerLat,
  customerLng,
  onLocationUpdate,
}: AgentTrackerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const agentMarkerRef = useRef<L.Marker | null>(null);
  const redRouteRef = useRef<L.Polyline | null>(null);
  const blueRouteRef = useRef<L.Polyline | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [routes, setRoutes] = useState<MultiRouteResponse | null>(null);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('agent-map').setView([restaurantLat, restaurantLng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // Restaurant marker (orange)
      const restaurantIcon = L.divIcon({
        html: `<div style="background: #F59E0B; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
            <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
          </svg>
        </div>`,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      L.marker([restaurantLat, restaurantLng], { icon: restaurantIcon })
        .addTo(map)
        .bindPopup('Restaurant');

      // Customer marker (red)
      const customerIcon = L.divIcon({
        html: `<div style="background: #EF4444; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        </div>`,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      L.marker([customerLat, customerLng], { icon: customerIcon })
        .addTo(map)
        .bindPopup('Customer');

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [restaurantLat, restaurantLng, customerLat, customerLng]);

  // Start tracking
  const startTracking = async () => {
    setTracking(true);
    setError(null);

    try {
      // Get initial position
      const position = await geolocationUtils.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      updateAgentLocation(latitude, longitude);

      // Watch position
      const watchId = geolocationUtils.watchPosition(
        (pos) => {
          updateAgentLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.heading || undefined, pos.coords.speed || undefined);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Failed to track location');
        }
      );

      watchIdRef.current = watchId;
    } catch (err) {
      setError('Failed to start tracking');
      setTracking(false);
    }
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      geolocationUtils.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
  };

  const updateAgentLocation = async (
    lat: number,
    lng: number,
    heading?: number,
    speed?: number
  ) => {
    setCurrentLocation({ lat, lng });

    // Update marker
    if (!agentMarkerRef.current && mapRef.current) {
      const agentIcon = L.divIcon({
        html: `<div style="background: #10B981; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
          </svg>
        </div>`,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      agentMarkerRef.current = L.marker([lat, lng], { icon: agentIcon })
        .addTo(mapRef.current)
        .bindPopup('You');
    } else if (agentMarkerRef.current) {
      agentMarkerRef.current.setLatLng([lat, lng]);
    }

    // Send to backend
    try {
      await locationService.updateAgentLocation({
        agentId,
        latitude: lat,
        longitude: lng,
        heading,
        speed,
        orderId,
      });

      if (onLocationUpdate) {
        onLocationUpdate(lat, lng);
      }
    } catch (err) {
      console.error('Failed to update location:', err);
    }

    // Fetch routes
    fetchRoutes(lat, lng);
  };

  const fetchRoutes = async (agentLat: number, agentLng: number) => {
    try {
      const multiRoute = await locationService.getMultiRoute({
        agentLat,
        agentLng,
        restaurantLat,
        restaurantLng,
        customerLat,
        customerLng,
      });

      setRoutes(multiRoute);

      // Draw RED route (Agent → Restaurant)
      if (redRouteRef.current && mapRef.current) {
        mapRef.current.removeLayer(redRouteRef.current);
      }
      if (mapRef.current) {
        const redLatLngs: L.LatLngExpression[] = multiRoute.agentToRestaurant.geometry.map(
          ([lng, lat]) => [lat, lng]
        );
        redRouteRef.current = L.polyline(redLatLngs, {
          color: '#EF4444',
          weight: 5,
          opacity: 0.7,
          dashArray: '10, 10',
        }).addTo(mapRef.current);
      }

      // Draw BLUE route (Restaurant → Customer)
      if (blueRouteRef.current && mapRef.current) {
        mapRef.current.removeLayer(blueRouteRef.current);
      }
      if (mapRef.current) {
        const blueLatLngs: L.LatLngExpression[] = multiRoute.restaurantToCustomer.geometry.map(
          ([lng, lat]) => [lat, lng]
        );
        blueRouteRef.current = L.polyline(blueLatLngs, {
          color: '#3B82F6',
          weight: 5,
          opacity: 0.7,
        }).addTo(mapRef.current);

        // Fit bounds
        const bounds = L.latLngBounds([
          [agentLat, agentLng],
          [restaurantLat, restaurantLng],
          [customerLat, customerLng],
        ]);
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    } catch (error) {
      console.error('Failed to fetch routes:', error);
    }
  };

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Map */}
      <div id="agent-map" className="w-full h-full rounded-3xl overflow-hidden shadow-2xl" />

      {/* Control Panel */}
      <div className="absolute top-4 left-4 right-4 z-[1000]">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">Delivery Navigation</h3>
            <button
              onClick={tracking ? stopTracking : startTracking}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                tracking
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {tracking ? 'Stop Tracking' : 'Start Tracking'}
            </button>
          </div>

          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-700 font-semibold">{error}</p>
            </div>
          )}

          {routes && (
            <div className="space-y-2">
              {/* Route 1: Agent → Restaurant */}
              <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg border-l-4 border-red-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-xs font-bold text-gray-700">To Restaurant</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">{routes.agentToRestaurant.distanceKm} km</p>
                  <p className="text-xs font-bold text-red-600">
                    {routes.agentToRestaurant.durationMinutes} mins
                  </p>
                </div>
              </div>

              {/* Route 2: Restaurant → Customer */}
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-xs font-bold text-gray-700">To Customer</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">
                    {routes.restaurantToCustomer.distanceKm} km
                  </p>
                  <p className="text-xs font-bold text-blue-600">
                    {routes.restaurantToCustomer.durationMinutes} mins
                  </p>
                </div>
              </div>

              {/* Total */}
              <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">Total</span>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">
                    {routes.totalDistanceKm.toFixed(1)} km • {routes.totalDurationMinutes} mins
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tracking Indicator */}
      {tracking && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]">
          <div className="bg-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-bold">Live Tracking Active</span>
          </div>
        </div>
      )}
    </div>
  );
}
