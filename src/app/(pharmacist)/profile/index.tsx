import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={{ uri: user?.profileImage || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80' }} 
            style={styles.headerAvatar} 
          />
          <Text style={styles.headerTitle}>MedVerify</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(pharmacist)/notifications' as any)}>
          <Ionicons name="notifications-outline" size={24} color="#0B1C5A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Hero */}
        <View style={styles.heroSection}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: user?.profileImage || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80' }} 
              style={styles.largeAvatar} 
            />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#0B1C5A" style={{ backgroundColor: '#fff', borderRadius: 12 }} />
            </View>
          </View>
          
          <Text style={styles.doctorName}>Dr. Aris Thorne</Text>
          <Text style={styles.doctorTitle}>PharmD, RPh</Text>
          
          <View style={styles.verifiedTag}>
            <Ionicons name="checkmark-circle" size={14} color="#0B1C5A" />
            <Text style={styles.verifiedTagText}>Verified Professional</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>1.2k</Text>
            <Text style={styles.statLabel}>Consults</Text>
          </View>
          <View style={styles.statBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Text style={styles.statValue}>4.9</Text>
              <Ionicons name="star" size={14} color="#F59E0B" />
            </View>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>8yrs</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Specialty</Text>
          <Text style={styles.cardText}>Clinical Pharmacy</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.cardText}>
            Dedicated Clinical Pharmacist with 8 years of experience in medication management and patient counseling. Specializing in chronic disease therapy and pharmaceutical verification for high-risk prescriptions.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Education</Text>
          <View style={styles.rowItem}>
            <Ionicons name="school-outline" size={22} color="#1E293B" style={styles.rowIcon} />
            <View>
              <Text style={styles.rowTitle}>Doctor of Pharmacy (PharmD)</Text>
              <Text style={styles.rowSub}>University of Lagos, Faculty of Pharmacy</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Professional Details</Text>
          <View style={styles.divider} />
          
          <View style={[styles.rowItem, { marginBottom: 16 }]}>
            <Ionicons name="id-card-outline" size={22} color="#475569" style={styles.rowIcon} />
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.rowTitle}>NAFDAC License</Text>
              <Text style={styles.rowValue}>NF-****-9281</Text>
            </View>
          </View>

          <View style={styles.rowItem}>
            <Ionicons name="time-outline" size={22} color="#475569" style={styles.rowIcon} />
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.rowTitle}>Business Hours</Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.rowValue}>Mon - Fri: 09:00 - 18:00</Text>
                <Text style={styles.rowValue}>Sat: 10:00 - 14:00</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.editBtn]} 
            onPress={() => router.push('/(pharmacist)/profile/edit-profile' as any)}
          >
            <Ionicons name="pencil" size={18} color="#fff" />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionBtn, styles.shareBtn]}
            onPress={() => router.push('/(pharmacist)/profile/settings' as any)}
          >
            {/* Re-using share button as settings temporarily or keep it as share */}
            <Ionicons name="settings-outline" size={18} color="#0B1C5A" />
            <Text style={styles.shareBtnText}>Settings</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1C5A',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  largeAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0B1C5A',
    marginBottom: 4,
  },
  doctorTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  verifiedTagText: {
    color: '#0B1C5A',
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1C5A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B1C5A',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rowIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  rowSub: {
    fontSize: 13,
    color: '#64748B',
  },
  rowValue: {
    fontSize: 13,
    color: '#475569',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  editBtn: {
    backgroundColor: '#0B1C5A',
  },
  editBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  shareBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0B1C5A',
  },
  shareBtnText: {
    color: '#0B1C5A',
    fontSize: 14,
    fontWeight: '700',
  },
});
