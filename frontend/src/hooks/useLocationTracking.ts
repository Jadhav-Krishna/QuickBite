import { useEffect, useRef, useState } from 'react';
import { deliveryService, type LocationUpdateDTO } from '../api/delivery';

interface UseLocationTrackingOptions {
  agentId: number;
  orderId: number | null;
  enabled: boolean;
  updateInterval?: number; // milliseconds
}

export const useLocationTracking = ({
  agentId,
  orderId,
  enabled,
  updateInterval = 5000, // 5 seconds default
}: UseLocationTrackingOptions) => {
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPositionRef = useRef<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!enabled || !orderId) {
      stopTracking();
      return;
    }

    startTracking();

    return () => {
      stopTracking();
    };
  }, [enabled, orderId, agentId]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);
    setError(null);

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        lastPositionRef.current = { latitude, longitude };

        // Send location update immediately on position change
        sendLocationUpdate(latitude, longitude, accuracy);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError(`Location error: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    // Also send periodic updates even if position hasn't changed
    intervalRef.current = setInterval(() => {
      if (lastPositionRef.current) {
        sendLocationUpdate(
          lastPositionRef.current.latitude,
          lastPositionRef.current.longitude
        );
      }
    }, updateInterval);
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsTracking(false);
    lastPositionRef.current = null;
  };

  const sendLocationUpdate = async (
    latitude: number,
    longitude: number,
    accuracy?: number
  ) => {
    if (!orderId) return;

    try {
      const locationUpdate: LocationUpdateDTO = {
        orderId,
        latitude,
        longitude,
        accuracy: accuracy ? `${accuracy.toFixed(2)}m` : undefined,
      };

      await deliveryService.updateAgentLocation(agentId, locationUpdate);
    } catch (err) {
      console.error('Failed to send location update:', err);
      // Don't set error state for individual update failures to avoid UI disruption
    }
  };

  return {
    isTracking,
    error,
    startTracking,
    stopTracking,
  };
};
