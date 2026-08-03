import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '@/hooks/useSubscription';
import type { MedVerifyUser } from '@/types/api';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (user: MedVerifyUser) => void;
}

export function PaywallModal({ visible, onClose, onSuccess }: PaywallModalProps) {
  const { loading, error, appleSubscriptions, startSubscription, restoreOrSync, isIos } =
    useSubscription(onSuccess);

  const handleSubscribe = async (sku?: string) => {
    try {
      const res = await startSubscription(sku);
      if (!isIos && res?.authorizationUrl) {
        await Linking.openURL(res.authorizationUrl);
      }
    } catch (e) {
      // Error state managed by hook
    }
  };

  const handleRestore = async () => {
    const user = await restoreOrSync();
    if (user && onClose) {
      onClose();
    }
  };

  const openTerms = () => {
    Linking.openURL('https://medverify.app/terms');
  };

  const openPrivacy = () => {
    Linking.openURL('https://medverify.app/privacy');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.backdrop}>
        <View style={styles.container}>
          {/* Header Bar */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Upgrade to MedVerify Pro</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Crown Icon / Badge */}
            <View style={styles.badgeContainer}>
              <Ionicons name="ribbon-sharp" size={48} color="#208AEF" />
            </View>

            <Text style={styles.headline}>Unlock Full Consultation & Verification Power</Text>
            <Text style={styles.subheadline}>
              Access priority pharmacist matching, real-time AI drug verification, and unlimited video sessions.
            </Text>

            {/* Feature List */}
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>Unlimited Pharmacist Consultations</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>AI-Powered Instant Drug Verification</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>Priority Audio & Video HD Calls</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>Detailed Medical Verification Certificates</Text>
              </View>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Subscriptions / Purchase Options */}
            {isIos && appleSubscriptions.length > 0 ? (
              appleSubscriptions.map((sub) => (
                <TouchableOpacity
                  key={sub.id}
                  style={styles.planCard}
                  onPress={() => handleSubscribe(sub.id)}
                  disabled={loading}
                >
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.planTitle}>{sub.title || 'Monthly Subscription'}</Text>
                    <Text style={styles.planDesc}>{sub.description || 'Auto-renewing access'}</Text>
                  </View>
                  <Text style={styles.planPrice}>{(sub as any).displayPrice || '$4.99/mo'}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => handleSubscribe('com.medverify.subscription.monthly')}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.ctaText}>
                    {isIos ? 'Subscribe with Apple Pay' : 'Subscribe via Paystack'}
                  </Text>
                )}
              </TouchableOpacity>
            )}

            {/* Restore & Legal Links (Mandatory for App Store Review) */}
            <View style={styles.footer}>
              {isIos && (
                <TouchableOpacity onPress={handleRestore} disabled={loading} style={styles.restoreBtn}>
                  <Text style={styles.restoreText}>Restore Purchases</Text>
                </TouchableOpacity>
              )}

              <View style={styles.legalRow}>
                <TouchableOpacity onPress={openTerms}>
                  <Text style={styles.legalText}>Terms of Use</Text>
                </TouchableOpacity>
                <Text style={styles.bullet}>•</Text>
                <TouchableOpacity onPress={openPrivacy}>
                  <Text style={styles.legalText}>Privacy Policy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  badgeContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headline: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subheadline: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  featuresList: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  errorBox: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    textAlign: 'center',
  },
  planCard: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#208AEF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planDesc: {
    fontSize: 12,
    color: '#E0F2FE',
    marginTop: 2,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ctaButton: {
    width: '100%',
    backgroundColor: '#208AEF',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  restoreBtn: {
    paddingVertical: 8,
    marginBottom: 12,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#208AEF',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legalText: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'underline',
  },
  bullet: {
    color: '#CBD5E1',
    fontSize: 12,
  },
});
