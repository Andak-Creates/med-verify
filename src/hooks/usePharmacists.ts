import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '@/api/client';
import * as pharmacistsService from '@/services/pharmacists.service';
import type { PublicPharmacist } from '@/types/api';
import { usePaginatedList } from './usePaginatedList';

/** Marketplace list: search + availability filter + pagination. */
export function usePharmacists(options: {
  search?: string;
  available?: boolean;
  lat?: number;
  lng?: number;
}) {
  const { search, available, lat, lng } = options;

  const fetchPage = useCallback(
    async (offset: number, limit: number) => {
      const { items } = await pharmacistsService.listPharmacists({
        search,
        available,
        lat,
        lng,
        limit,
        offset,
      });
      return { items };
    },
    [search, available, lat, lng],
  );

  return usePaginatedList<PublicPharmacist>(fetchPage);
}

/** Single pharmacist profile (public marketplace detail page). */
export function usePharmacist(id: string | undefined) {
  const [pharmacist, setPharmacist] = useState<PublicPharmacist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      setPharmacist(await pharmacistsService.getPharmacist(id));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load this pharmacist.'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { pharmacist, isLoading, error, reload: load };
}
