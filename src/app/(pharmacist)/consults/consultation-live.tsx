import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { LiveSessionScreen } from '@/components/LiveSessionScreen';
import * as pharmacistService from '@/services/pharmacist.service';
import type { PharmacistConsultation } from '@/types/api';

export default function PharmacistConsultationLiveScreen() {
  const router = useRouter();
  const { id, isPast } = useLocalSearchParams<{ id: string; isPast?: string }>();
  const [booking, setBooking] = useState<PharmacistConsultation | null>(null);

  // There is no single-consultation endpoint for pharmacists — resolve the
  // patient's details from the pharmacist's own booking list.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const { items } = await pharmacistService.listConsultations({ limit: 50 });
        if (!cancelled) {
          setBooking(items.find((c) => c.id === id) ?? null);
        }
      } catch {
        // Header falls back to a generic label; the session itself still works.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <LiveSessionScreen
      consultationId={id}
      isPast={isPast === 'true'}
      counterpartName={booking?.patient.fullName ?? 'Patient'}
      counterpartImage={booking?.patient.profileImage ?? null}
      onSessionEnded={() =>
        router.replace({ pathname: '/(pharmacist)/consults/post-summary', params: { id } } as any)
      }
      onOpenCall={() =>
        router.push({ pathname: '/(pharmacist)/call', params: { id } } as any)
      }
    />
  );
}
