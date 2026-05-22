import { API_BASE_URL } from './auth';

export type LatLng = [number, number];

const OSRM_URL = import.meta.env.VITE_OSRM_URL || 'https://router.project-osrm.org/route/v1/driving';

export interface DrivingRouteResult {
  coordinates: LatLng[];
  distanceMeters: number;
  durationSeconds: number;
}

export const geocodeAddress = async (address: string): Promise<LatLng | null> => {
  if (!address.trim()) return null;

  try {
    const response = await fetch(
      `${API_BASE_URL}/v1/auth/addresses/geocode?address=${encodeURIComponent(address)}`,
      { headers: { Accept: 'application/json' } }
    );

    if (!response.ok) return null;

    const data = (await response.json()) as { latitude?: number; longitude?: number };

    const lat = Number(data.latitude);
    const lng = Number(data.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return [lat, lng];
  } catch {
    return null;
  }
};

export const getDrivingRoute = async (from: LatLng, to: LatLng): Promise<DrivingRouteResult> => {
  try {
    const url = `${OSRM_URL}/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Routing API request failed.');
    }

    const data = (await response.json()) as {
      routes?: Array<{
        distance?: number;
        duration?: number;
        geometry?: { coordinates?: [number, number][] };
      }>;
    };
    const route = data.routes?.[0];
    const coordinates = route?.geometry?.coordinates?.map(([lng, lat]) => [lat, lng] as LatLng) || [];

    if (coordinates.length < 2) {
      throw new Error('Invalid route response.');
    }

    return {
      coordinates,
      distanceMeters: Number(route?.distance || 0),
      durationSeconds: Number(route?.duration || 0),
    };
  } catch {
    return {
      coordinates: [from, to],
      distanceMeters: 0,
      durationSeconds: 0,
    };
  }
};

export const getDirectionsUrl = (origin: LatLng, destination: LatLng) =>
  `https://www.google.com/maps/dir/?api=1&origin=${origin[0]},${origin[1]}&destination=${destination[0]},${destination[1]}&travelmode=driving`;
