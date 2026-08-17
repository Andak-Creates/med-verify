import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '@/api/client';
import * as pharmacistService from '@/services/pharmacist.service';
import type { PharmacistMe, PharmacistProfileUpdates } from '@/types/api';

// Shared global profile store so Dashboard, Profile, and Settings stay 100% in sync in real time!
let globalProfile: PharmacistMe | null = null;
let globalLoading = true;
let globalError: string | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

async function fetchGlobalProfile() {
  globalError = null;
  try {
    globalProfile = await pharmacistService.getMe();
  } catch (err) {
    globalError = getApiErrorMessage(err, 'Could not load your profile.');
  } finally {
    globalLoading = false;
    notify();
  }
}

/** Pharmacist's own merged user + profile record (GET /pharmacist/me). */
export function usePharmacistProfile() {
  const [profile, setProfile] = useState<PharmacistMe | null>(globalProfile);
  const [isLoading, setIsLoading] = useState(globalLoading && !globalProfile);
  const [error, setError] = useState<string | null>(globalError);

  useEffect(() => {
    const listener = () => {
      setProfile(globalProfile);
      setIsLoading(globalLoading);
      setError(globalError);
    };
    listeners.add(listener);

    // Initial fetch if not loaded yet
    if (!globalProfile && globalLoading) {
      fetchGlobalProfile();
    } else {
      setProfile(globalProfile);
      setIsLoading(globalLoading);
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const reload = useCallback(async () => {
    globalLoading = true;
    notify();
    await fetchGlobalProfile();
  }, []);

  const update = useCallback(async (updates: PharmacistProfileUpdates) => {
    const updated = await pharmacistService.updateProfile(updates);
    globalProfile = updated;
    notify();
    return updated;
  }, []);

  const updateFees = useCallback(
    async (fees: { feeDrugInquiry?: number; feeFullConsultation?: number }) => {
      const updatedProfile = await pharmacistService.updateFees(fees);
      if (globalProfile) {
        globalProfile = { ...globalProfile, ...updatedProfile };
        notify();
      }
      return updatedProfile;
    },
    [],
  );

  return { profile, isLoading, error, reload, update, updateFees };
}
