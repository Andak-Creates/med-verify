import { useLocalSearchParams, useRouter } from 'expo-router';
import { LiveSessionScreen } from '@/components/LiveSessionScreen';
import { useConsultation } from '@/hooks/useConsultations';

export default function UserConsultationLiveScreen() {
  const router = useRouter();
  const { id, isPast } = useLocalSearchParams<{ id: string; isPast?: string }>();
  const { consultation } = useConsultation(id);

  return (
    <LiveSessionScreen
      consultationId={id}
      isPast={isPast === 'true'}
      counterpartName={consultation?.pharmacist.fullName ?? 'Pharmacist'}
      counterpartImage={consultation?.pharmacist.profileImage ?? null}
      onSessionEnded={() =>
        router.replace({ pathname: '/(user)/pharmacy/post-review', params: { id } } as any)
      }
      onOpenCall={() =>
        router.push({ pathname: '/(user)/pharmacy/consultation-call', params: { id } } as any)
      }
    />
  );
}
