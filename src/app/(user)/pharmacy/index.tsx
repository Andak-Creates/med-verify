import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PharmacyScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pharmacies' | 'pharmacists'>('pharmacies');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.logoText}>MedVerify</Text>
          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={21} color="#0B1C5A" />
              <View style={styles.notifDot} />
            </Pressable>
            <Pressable style={styles.avatarButton}>
              <Image 
                source={{ uri: 'https://i.pravatar.cc/150?img=47' }} 
                style={styles.avatarImg} 
              />
            </Pressable>
          </View>
        </View>

        {/* ── Title & Map View ───────────────────────────────────────── */}
        <View style={styles.titleSection}>
          <View style={styles.titleLeft}>
            <Text style={styles.pageTitle}>
              {activeTab === 'pharmacies' ? 'Nearby Pharmacies' : 'Available Pharmacists'}
            </Text>
            <Text style={styles.pageSubtitle}>
              {activeTab === 'pharmacies' ? '14 pharmacies found in your area' : '8 clinical experts online now'}
            </Text>
          </View>
          <TouchableOpacity style={styles.mapBtn}>
            <Ionicons name="map-outline" size={20} color="#312E81" />
            <Text style={styles.mapBtnText}>Map{'\n'}View</Text>
          </TouchableOpacity>
        </View>

        {/* ── Tabs ──────────────────────────────────────── */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.mainTab, activeTab === 'pharmacies' && styles.mainTabActive]}
            onPress={() => setActiveTab('pharmacies')}
          >
            <Text style={[styles.mainTabText, activeTab === 'pharmacies' && styles.mainTabTextActive]}>Pharmacies</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.mainTab, activeTab === 'pharmacists' && styles.mainTabActive]}
            onPress={() => setActiveTab('pharmacists')}
          >
            <Text style={[styles.mainTabText, activeTab === 'pharmacists' && styles.mainTabTextActive]}>Pharmacists</Text>
          </TouchableOpacity>
        </View>

        {/* ── Search Bar ──────────────────────────────────────── */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={activeTab === 'pharmacies' ? "Search by name or prescription..." : "Search by name or specialty..."}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* ── PHARMACIES TAB CONTENT ─────────────────────────────────── */}
        {activeTab === 'pharmacies' && (
          <View style={styles.tabContent}>
            
            {/* Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              <TouchableOpacity style={[styles.filterPill, styles.filterPillActive]}>
                <Text style={[styles.filterPillText, styles.filterPillTextActive]}>Open Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterPill}>
                <Text style={styles.filterPillText}>24 Hours</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterPill}>
                <Text style={styles.filterPillText}>Home Delivery</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.cardList}>
              
              {/* Pharmacy Item 1 */}
              <View style={styles.pharmacyCard}>
                <View style={styles.pharmHeaderRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <View style={styles.pharmNameRow}>
                      <Text style={styles.pharmName}>Central Care Pharmacy</Text>
                      <Ionicons name="checkmark-circle" size={16} color="#312E81" style={{ marginLeft: 4 }} />
                    </View>
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={14} color="#6B7280" />
                      <Text style={styles.locationText}>0.8 miles away • Downtown Medical Dist.</Text>
                    </View>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#312E81" />
                    <Text style={styles.ratingText}>4.9</Text>
                  </View>
                </View>

                <View style={styles.pharmImageWrap}>
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80' }} style={styles.pharmImage} />
                </View>

                <View style={styles.pharmFooterRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.statusTextBlue}>OPEN UNTIL 10:00 PM</Text>
                    <View style={styles.badgeRow}>
                      <View style={[styles.smallBadge, { backgroundColor: '#D1FAE5' }]}>
                        <Text style={[styles.smallBadgeText, { color: '#065F46' }]}>INSURANCE VERIFIED</Text>
                      </View>
                      <View style={[styles.smallBadge, { backgroundColor: '#DBEAFE' }]}>
                        <Text style={[styles.smallBadgeText, { color: '#1E40AF' }]}>E-RX READY</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.viewBtn} onPress={() => router.push('/(user)/pharmacy/pharmacy-profile' as any)}>
                    <Text style={styles.viewBtnText}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Pharmacy Item 2 */}
              <View style={styles.pharmacyCard}>
                <View style={styles.pharmHeaderRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <View style={styles.pharmNameRow}>
                      <Text style={styles.pharmName}>WellSpring Apothecary</Text>
                      <Ionicons name="checkmark-circle" size={16} color="#312E81" style={{ marginLeft: 4 }} />
                    </View>
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={14} color="#6B7280" />
                      <Text style={styles.locationText}>1.4 miles away • East Gate Mall</Text>
                    </View>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#312E81" />
                    <Text style={styles.ratingText}>4.7</Text>
                  </View>
                </View>

                <View style={styles.pharmImageWrap}>
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1628102491629-77858ab5721d?w=800&q=80' }} style={styles.pharmImage} />
                </View>

                <View style={styles.pharmFooterRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.statusTextBlue}>OPEN 24 HOURS</Text>
                    <View style={styles.badgeRow}>
                      <View style={[styles.smallBadge, { backgroundColor: '#D1FAE5' }]}>
                        <Text style={[styles.smallBadgeText, { color: '#065F46' }]}>DELIVERY AVAILABLE</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.viewBtn} onPress={() => router.push('/(user)/pharmacy/pharmacy-profile' as any)}>
                    <Text style={styles.viewBtnText}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>

            </View>
          </View>
        )}

        {/* ── PHARMACISTS TAB CONTENT ───────────────────────────── */}
        {activeTab === 'pharmacists' && (
          <View style={styles.tabContent}>
            
            {/* Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              <TouchableOpacity style={[styles.filterPill, styles.filterPillActive]}>
                <Text style={[styles.filterPillText, styles.filterPillTextActive]}>Available Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterPill}>
                <Text style={styles.filterPillText}>Top Rated</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterPill}>
                <Text style={styles.filterPillText}>Near Me</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.cardList}>
              
              {/* Pharmacist Item 1 */}
              <View style={styles.docCard}>
                <View style={styles.docHeaderRow}>
                  <View style={styles.docAvatarWrap}>
                    <Image source={{ uri: 'https://i.pravatar.cc/150?img=32' }} style={styles.docAvatarImg} />
                    <View style={[styles.onlineDot, { backgroundColor: '#10B981' }]} />
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text style={styles.docName}>Dr. Sarah{'\n'}Jenkins, PharmD</Text>
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color="#312E81" />
                        <Text style={styles.ratingText}>4.9</Text>
                      </View>
                    </View>
                    <Text style={styles.docSpec}>Clinical Pharmacy,{'\n'}Pediatrics</Text>
                    
                    <View style={styles.docMetaRow}>
                      <View style={[styles.smallBadge, { backgroundColor: '#D1FAE5', marginEnd: 8 }]}>
                        <Text style={[styles.smallBadgeText, { color: '#065F46' }]}>ONLINE</Text>
                      </View>
                      <Ionicons name="location-outline" size={12} color="#6B7280" />
                      <Text style={styles.docMetaText}>0.8 miles away</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.docFooterRow}>
                  <Text style={styles.reviewCount}>120+{'\n'}reviews</Text>
                  <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={() => router.push('/(user)/pharmacy/1')}
                  >
                    <Text style={styles.actionBtnText}>View Pharmacist</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Pharmacist Item 2 */}
              <View style={styles.docCard}>
                <View style={styles.docHeaderRow}>
                  <View style={styles.docAvatarWrap}>
                    <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} style={styles.docAvatarImg} />
                    <View style={[styles.onlineDot, { backgroundColor: '#F59E0B' }]} />
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text style={styles.docName}>Dr. Marcus Chen</Text>
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color="#312E81" />
                        <Text style={styles.ratingText}>4.8</Text>
                      </View>
                    </View>
                    <Text style={styles.docSpec}>Geriatric Specialist,{'\n'}Cardiology</Text>
                    
                    <View style={styles.docMetaRow}>
                      <View style={[styles.smallBadge, { backgroundColor: '#E5E7EB', marginEnd: 8 }]}>
                        <Text style={[styles.smallBadgeText, { color: '#374151' }]}>CONSULTING</Text>
                      </View>
                      <Ionicons name="location-outline" size={12} color="#6B7280" />
                      <Text style={styles.docMetaText}>1.2 miles away</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.docFooterRow}>
                  <Text style={styles.reviewCount}>85{'\n'}reviews</Text>
                  <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={() => router.push('/(user)/pharmacy/2')}
                  >
                    <Text style={styles.actionBtnText}>Book Consultation</Text>
                  </TouchableOpacity>
                </View>
              </View>

            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingBottom: 115 },

  /* Header */
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingTop: 12, paddingBottom: 10 },
  logoText: { fontSize: 22, fontWeight: '800', color: '#0B1C5A', letterSpacing: -0.3 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.85)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  notifDot: { position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#fff' },
  avatarButton: { width: 38, height: 38, borderRadius: 19, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  avatarImg: { width: '100%', height: '100%' },

  /* Title & Map Section */
  titleSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingTop: 10, paddingBottom: 20 },
  titleLeft: { flex: 1, paddingRight: 16 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: '#4B5563', lineHeight: 18 },
  mapBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: '#312E81' },
  mapBtnText: { fontSize: 13, fontWeight: '700', color: '#312E81', textAlign: 'center' },

  /* Segmented Control Tabs */
  tabContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', marginHorizontal: 22, borderRadius: 12, padding: 4, marginBottom: 20 },
  mainTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  mainTabActive: { backgroundColor: '#312E81' },
  mainTabText: { fontSize: 14, fontWeight: '700', color: '#4B5563' },
  mainTabTextActive: { color: '#fff' },

  /* Search Bar */
  searchContainer: { paddingHorizontal: 22, marginBottom: 20 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, height: 50, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#111827' },

  /* Tab Content Shared */
  tabContent: { flex: 1 },
  filterRow: { paddingHorizontal: 22, gap: 10, marginBottom: 20 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E5E7EB' },
  filterPillActive: { backgroundColor: '#312E81' },
  filterPillText: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  filterPillTextActive: { color: '#fff' },
  cardList: { gap: 16, paddingHorizontal: 22 },

  /* Pharmacy Cards */
  pharmacyCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  pharmHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  pharmNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  pharmName: { fontSize: 18, fontWeight: '800', color: '#111827' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 12, color: '#6B7280' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EEF1FB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#312E81' },
  pharmImageWrap: { height: 120, borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  pharmImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  pharmFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  statusTextBlue: { fontSize: 11, fontWeight: '800', color: '#312E81', letterSpacing: 0.5, marginBottom: 6 },
  badgeRow: { flexDirection: 'row', gap: 6 },
  smallBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  smallBadgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  viewBtn: { backgroundColor: '#312E81', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 24 },
  viewBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  /* Pharmacist Cards */
  docCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  docHeaderRow: { flexDirection: 'row', marginBottom: 16 },
  docAvatarWrap: { position: 'relative', marginRight: 16 },
  docAvatarImg: { width: 72, height: 72, borderRadius: 16, backgroundColor: '#F3F4F6' },
  onlineDot: { position: 'absolute', top: -4, right: -4, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#fff' },
  docName: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 4, flexShrink: 1, paddingRight: 10 },
  docSpec: { fontSize: 13, color: '#4B5563', marginBottom: 8, lineHeight: 18 },
  docMetaRow: { flexDirection: 'row', alignItems: 'center' },
  docMetaText: { fontSize: 11, color: '#6B7280', marginLeft: 2 },
  docFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewCount: { fontSize: 12, color: '#6B7280', lineHeight: 16 },
  actionBtn: { flex: 1, marginLeft: 16, backgroundColor: '#312E81', height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
