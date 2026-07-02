import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '@/api/client';
import * as pharmacistService from '@/services/pharmacist.service';
import type { PharmacistMe, PharmacistProfileUpdates } from '@/types/api';

/** Pharmacist's own merged user + profile record (GET /pharmacist/me). */
export function usePharmacistProfile() {
  const [profile, setProfile] = useState<PharmacistMe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setProfile(await pharmacistService.getMe());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load your profile.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = useCallback(async (updates: PharmacistProfileUpdates) => {
    const updated = await pharmacistService.updateProfile(updates);
    setProfile(updated);
    return updated;
  }, []);

  const updateFees = useCallback(
    async (fees: { feeDrugInquiry?: number; feeFullConsultation?: number }) => {
      const updatedProfile = await pharmacistService.updateFees(fees);
      setProfile((prev) => (prev ? { ...prev, ...updatedProfile } : prev));
      return updatedProfile;
    },
    [],
  );

  return { profile, isLoading, error, reload: load, update, updateFees };
}
