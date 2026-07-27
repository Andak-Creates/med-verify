import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '@/api/client';
import * as placesService from '@/services/places.service';
import type { NearbyPharmacy, PharmacyDetail } from '@/types/api';

export function useNearbyPharmacies(
  coords: { lat: number; lng: number } | null,
  keyword = '',
) {
  const [items, setItems] = useState<NearbyPharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!coords) {
      setItems([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const results = await placesService.getNearbyPharmacies(coords.lat, coords.lng, 5000, keyword);
      setItems(results);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load nearby pharmacies.'));
    } finally {
      setIsLoading(false);
    }
  }, [coords, keyword]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, isLoading, error, refresh: load };
}

export function usePharmacyDetail(placeId: string | undefined) {
  const [pharmacy, setPharmacy] = useState<PharmacyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!placeId) return;
    setIsLoading(true);
    setError(null);
    try {
      setPharmacy(await placesService.getPharmacyDetail(placeId));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load pharmacy details.'));
    } finally {
      setIsLoading(false);
    }
  }, [placeId]);

  useEffect(() => {
    load();
  }, [load]);

  return { pharmacy, isLoading, error, reload: load };
}
