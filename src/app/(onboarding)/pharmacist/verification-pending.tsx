import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApiErrorMessage } from '@/api/client';
import { useAuth } from '../../../context/AuthContext';
import type { PharmacistStatusInfo } from '@/types/api';

const STATUS_COPY: Record<PharmacistStatusInfo['status'], { icon: string; color: string; title: string; subtitle: string }> = {
  PENDING: {
    icon: 'document-text-outline',
    color: '#D97706',
    title: 'Application Incomplete',
    subtitle: 'We have not received your credentials yet. Please submit your NIN, PCN licence and certificate to start the review.',
  },
  UNDER_REVIEW: {
    icon: 'shield-checkmark',
    color: '#0369A1',
    title: 'Verification in Progress',
    subtitle: 'Your credentials are being reviewed by our medical board. This typically takes 24-48 hours. You will also be notified by email.',
  },
  APPROVED: {
    icon: 'checkmark-circle',
    color: '#059669',
    title: 'Application Approved',
    subtitle: 'Congratulations! Your professional credentials have been verified. You can now start consulting.',
  },
  REJECTED: {
    icon: 'close-circle',
    color: '#DC2626',
    title: 'Application Not Approved',
    subtitle: 'Unfortunately your application was not approved.',
  },
};

export default function VerificationPendingScreen() {
  const router = useRouter();
  const { getPharmacistStatus, logout } = useAuth();
  const [statusInfo, setStatusInfo] = useState<PharmacistStatusInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(
    async (mode: 'initial' | 'manual' = 'manual') => {
      if (mode === 'initial') setLoading(true);
      else setChecking(true);
      setError(null);
      try {
        const info = await getPharmacistStatus();
        setStatusInfo(info);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Could not check your application status.'));
      } finally {
        setLoading(false);
        setChecking(false);
      }
    },
    [getPharmacistStatus],
  );

  useEffect(() => {
    checkStatus('initial');
  }, [checkStatus]);

  const handleBackToLogin = async () => {
    await logout();
    router.replace('/(auth)/login' as any);
  };

  const status = statusInfo?.status ?? 'UNDER_REVIEW';
  const copy = STATUS_COPY[status];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        {loading ? (
          <ActivityIndicator size="large" color="#0B1C5A" style={{ marginVertical: 60 }} />
        ) : (
          <>
            <View style={styles.iconContainer}>
              <View style={styles.iconOutline}>
                <Ionicons name={copy.icon as any} size={48} color={copy.color} />
              </View>
            </View>

            <Text style={styles.title}>{copy.title}</Text>
            <Text style={styles.subtitle}>
              {copy.subtitle}
              {status === 'REJECTED' && statusInfo?.rejectionReason
                ? `\n\nReason: ${statusInfo.rejectionReason}`
                : ''}
            </Text>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {status === 'APPROVED' ? (
              <Pressable
                style={({ pressed }) => [styles.primaryBtn, { backgroundColor: '#059669' }, pressed && styles.btnPressed]}
                onPress={() => router.replace('/(pharmacist)/dashboard' as any)}
              >
                <Ionicons name="arrow-forward-circle-outline" size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>Go to Dashboard</Text>
              </Pressable>
            ) : status === 'PENDING' ? (
              <Pressable
                style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
                onPress={() => router.replace('/(onboarding)/pharmacist/license-upload' as any)}
              >
                <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>Submit Credentials</Text>
              </Pressable>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
                onPress={() => checkStatus('manual')}
                disabled={checking}
              >
                {checking ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="refresh-outline" size={20} color="#fff" />
                    <Text style={styles.primaryBtnText}>Check Status</Text>
                  </>
                )}
              </Pressable>
            )}

            <Pressable style={styles.linkBtn} onPress={handleBackToLogin}>
              <Text style={styles.linkText}>Back to Login</Text>
              <Ionicons name="log-out-outline" size={16} color="#0369A1" />
            </Pressable>

            <View style={styles.divider} />

            <View style={styles.referenceRow}>
              <Ionicons name="time-outline" size={14} color="#8E9CB2" />
              <Text style={styles.referenceText}>
                {statusInfo?.createdAt
                  ? `APPLIED ${new Date(statusInfo.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}`
                  : 'APPLICATION STATUS'}
              </Text>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconOutline: {
    width: 96,
    height: 96,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#E0F2FE',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0B1C5A',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  primaryBtn: {
    width: '100%',
    height: 56,
    backgroundColor: '#111827',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  btnPressed: {
    opacity: 0.85,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 32,
  },
  linkText: {
    color: '#0369A1',
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 24,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  referenceText: {
    color: '#8E9CB2',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
