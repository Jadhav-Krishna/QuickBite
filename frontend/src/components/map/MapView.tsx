import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useWebSocketTracking } from '../../hooks/useWebSocketTracking';
import { locationService, type RouteResponse } from '../../services/location/locationService';
import { Loader2, Navigation } from 'lucide-react';

interface MapViewProps {
  orderId: number;
  customerLat: number;
  customerLng: number;
  restaurantLat?: number;
  restaurantLng?: number;
}

export default function MapView({
  orderId,
  customerLat,
  customerLng,
  restaurantLat,
  restaurantLng,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const agentMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const { location, connected } = useWebSocketTracking(orderId);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('map').setView([customerLat, customerLng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // Customer marker (home icon)
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
        .bindPopup('Your Location');

      // Restaurant marker if provided
      if (restaurantLat && restaurantLng) {
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
      }

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [customerLat, customerLng, restaurantLat, restaurantLng]);

  // Update agent location
  useEffect(() => {
    if (!location || !mapRef.current) return;

    const { latitude, longitude, heading } = location;

    // Create or update agent marker
    if (!agentMarkerRef.current) {
      const agentIcon = L.divIcon({
        html: `<div style="background: #10B981; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); transform: rotate(${heading || 0}deg);">
          <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
          </svg>
        </div>`,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      agentMarkerRef.current = L.marker([latitude, longitude], { icon: agentIcon })
        .addTo(mapRef.current)
        .bindPopup('Delivery Agent');
    } else {
      // Smooth animation
      agentMarkerRef.current.setLatLng([latitude, longitude]);
    }

    // Fetch and draw route
    fetchRoute(latitude, longitude);
  }, [location]);

  const fetchRoute = async (agentLat: number, agentLng: number) => {
    try {
      const route: RouteResponse = await locationService.getRoute({
        originLat: agentLat,
        originLng: agentLng,
        destLat: customerLat,
        destLng: customerLng,
      });

      setDistance(route.distanceKm);
      setEta(route.durationMinutes);

      // Draw route on map
      if (routeLayerRef.current && mapRef.current) {
        mapRef.current.removeLayer(routeLayerRef.current);
      }

      if (mapRef.current) {
        const latlngs: L.LatLngExpression[] = route.geometry.map(([lng, lat]) => [lat, lng]);
        routeLayerRef.current = L.polyline(latlngs, {
          color: '#3B82F6',
          weight: 5,
          opacity: 0.7,
        }).addTo(mapRef.current);

        // Fit bounds to show entire route
        const bounds = L.latLngBounds([
          [agentLat, agentLng],
          [customerLat, customerLng],
        ]);
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    } catch (error) {
      console.error('Failed to fetch route:', error);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div id="map" className="w-full h-full rounded-3xl overflow-hidden shadow-2xl" />

      {/* Status Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[1000]">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}
              />
              <span className="text-sm font-bold text-gray-900">
                {connected ? 'Live Tracking' : 'Connecting...'}
              </span>
            </div>

            {location && (
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Navigation size={16} className="text-blue-600" />
                {location.speed ? `${location.speed.toFixed(1)} km/h` : 'Moving'}
              </div>
            )}
          </div>

          {/* ETA and Distance */}
          {eta && distance && (
            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-semibold">Distance</p>
                <p className="text-lg font-black text-gray-900">{distance.toFixed(1)} km</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-semibold">ETA</p>
                <p className="text-lg font-black text-red-600">{eta} mins</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {!location && connected && (
        <div className="absolute inset-0 z-[999] bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            <p className="text-sm font-bold text-gray-900">Waiting for agent location...</p>
          </div>
        </div>
      )}
    </div>
  );
}
