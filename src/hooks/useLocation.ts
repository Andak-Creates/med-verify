import { useCallback, useState } from 'react';
import * as Location from 'expo-location';

/**
 * On-demand device coordinates for distance-aware pharmacist search.
 * Resolves to null (without throwing) when permission is denied or
 * unavailable, so callers can fall back to non-distance results.
 */
export function useLocation() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const requestLocation = useCallback(async (): Promise<{ lat: number; lng: number } | null> => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        return null;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const next = { lat: position.coords.latitude, lng: position.coords.longitude };
      setCoords(next);
      setPermissionDenied(false);
      return next;
    } catch {
      return null;
    } finally {
      setIsLocating(false);
    }
  }, []);

  const clearLocation = useCallback(() => setCoords(null), []);

  return { coords, isLocating, permissionDenied, requestLocation, clearLocation };
}
