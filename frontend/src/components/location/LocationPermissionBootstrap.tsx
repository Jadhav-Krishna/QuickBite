import { useEffect } from 'react';
import { addressService } from '../../api/address';
import { deliveryService } from '../../api/delivery';
import { useAuth } from '../../context/AuthContext';

const locationCacheKey = (userId: number) => `quickbite:last-location:${userId}`;
const permissionPromptKey = (userId: number) => `quickbite:location-prompted:${userId}`;

const isDeliveryAgentRole = (role?: string) =>
  ['AGENT', 'ROLE_AGENT', 'DELIVERY_AGENT'].includes((role || '').toUpperCase());

export default function LocationPermissionBootstrap() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) return;

    const promptedKey = permissionPromptKey(user.userId);
    if (sessionStorage.getItem(promptedKey) === 'true') return;
    sessionStorage.setItem(promptedKey, 'true');

    let cancelled = false;

    const requestLocation = async () => {
      try {
        const coords = await addressService.getCurrentLocation();
        if (cancelled) return;

        let resolvedAddress = '';
        try {
          const address = await addressService.reverseGeocode(coords.latitude, coords.longitude);
          resolvedAddress = [address.addressLine1, address.city, address.state, address.pincode]
            .filter(Boolean)
            .join(', ');
        } catch {
          // Coordinates are still useful for delivery tracking even if reverse geocoding fails.
        }

        localStorage.setItem(
          locationCacheKey(user.userId),
          JSON.stringify({
            latitude: coords.latitude,
            longitude: coords.longitude,
            address: resolvedAddress,
            updatedAt: new Date().toISOString(),
          }),
        );

        if (isDeliveryAgentRole(user.role)) {
          try {
            const { agentId } = await deliveryService.resolveAgentForUser(user.userId);
            await deliveryService.updateAgentLocation(agentId, {
              orderId: 0,
              latitude: coords.latitude,
              longitude: coords.longitude,
              address: resolvedAddress || 'Current agent location',
              status: 'ONLINE',
            });
          } catch {
            // Some agents may not be approved/registered yet; normal page flows handle that state.
          }
        }
      } catch {
        // Browser permission failures are surfaced where the user actively requests location.
      }
    };

    void requestLocation();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.userId, user?.role]);

  return null;
}
