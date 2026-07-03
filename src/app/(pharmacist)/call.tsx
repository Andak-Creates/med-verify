import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { AudioCallScreen } from '@/components/AudioCallScreen';
import * as pharmacistService from '@/services/pharmacist.service';
import type { PharmacistConsultation } from '@/types/api';

export default function PharmacistCallScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [booking, setBooking] = useState<PharmacistConsultation | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const { items } = await pharmacistService.listConsultations({ limit: 50 });
        if (!cancelled) setBooking(items.find((c) => c.id === id) ?? null);
      } catch {
        // Header falls back to a generic label; the call itself still works.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <AudioCallScreen
      consultationId={id}
      counterpartName={booking?.patient.fullName ?? 'Patient'}
      counterpartRole="Patient"
      counterpartImage={booking?.patient.profileImage}
    />
  );
}
