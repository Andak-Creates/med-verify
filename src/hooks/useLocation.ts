import { useCallback, useState } from 'react';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import { Alert, Platform } from 'react-native';

/**
 * On-demand device coordinates for distance-aware pharmacist and pharmacy search.
 * Includes permissions handling, last-known location fallback, and settings deep-linking.
 */
export function useLocation() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const openSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }, []);

  const requestLocation = useCallback(async (manual = false): Promise<{ lat: number; lng: number } | null> => {
    setIsLocating(true);
    setLocationError(null);
    try {
      // 1. Check existing permission status first
      let permission = await Location.getForegroundPermissionsAsync();
      
      if (permission.status !== 'granted') {
        permission = await Location.requestForegroundPermissionsAsync();
      }

      if (permission.status !== 'granted') {
        setPermissionDenied(true);
        if (manual) {
          Alert.alert(
            'Location Permission Required',
            'MedVerify needs access to your location to find nearby pharmacies and pharmacists. Please enable location permissions in Settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: openSettings },
            ]
          );
        }
        return null;
      }

      setPermissionDenied(false);

      // 2. Check if device location services (GPS) are enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        if (manual) {
          Alert.alert(
            'Location Services Disabled',
            'Please turn on GPS/Location Services on your device to discover pharmacies near you.',
            [{ text: 'OK' }]
          );
        }
      }

      // 3. Fast fallback: try last known position first
      const lastKnown = await Location.getLastKnownPositionAsync().catch(() => null);
      if (lastKnown?.coords) {
        const quick = { lat: lastKnown.coords.latitude, lng: lastKnown.coords.longitude };
        setCoords(quick);
      }

      // 4. Get accurate current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }).catch(async () => {
        // Fallback to lowest accuracy if balanced fails (e.g. indoor or slow GPS)
        return await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Lowest,
        });
      });

      if (position?.coords) {
        const next = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCoords(next);
        return next;
      }

      if (lastKnown?.coords) {
        return { lat: lastKnown.coords.latitude, lng: lastKnown.coords.longitude };
      }

      return null;
    } catch (err: any) {
      const msg = err?.message || 'Unable to retrieve your current location.';
      setLocationError(msg);
      return null;
    } finally {
      setIsLocating(false);
    }
  }, [openSettings]);

  const clearLocation = useCallback(() => {
    setCoords(null);
    setPermissionDenied(false);
    setLocationError(null);
  }, []);

  return {
    coords,
    isLocating,
    permissionDenied,
    locationError,
    requestLocation,
    openSettings,
    clearLocation,
    setCoords,
  };
}

