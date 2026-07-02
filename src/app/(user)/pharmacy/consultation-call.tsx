import { useLocalSearchParams } from 'expo-router';
import { AudioCallScreen } from '@/components/AudioCallScreen';
import { useConsultation } from '@/hooks/useConsultations';

export default function UserConsultationCallScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { consultation } = useConsultation(id);

  return (
    <AudioCallScreen
      consultationId={id}
      counterpartName={consultation?.pharmacist.fullName ?? 'Pharmacist'}
      counterpartRole={consultation?.pharmacist.specialty ?? 'Pharmacist'}
      counterpartImage={consultation?.pharmacist.profileImage}
    />
  );
}
