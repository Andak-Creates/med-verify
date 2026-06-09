import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Reach More Patients',
    description: 'Expand your professional reach by providing expert consultations to users in need of medical guidance and drug verification.',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80',
    badge: 'Certified Expert Provider',
    icon: 'checkmark-circle'
  },
  {
    id: '2',
    title: 'Manage Your Practice',
    description: 'Set your own consultation rates, manage health inquiries, and track your earnings with complete transparency.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    badge: 'Track Earnings Easily',
    icon: 'wallet'
  }
];

export default function SlidesScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    setActiveIndex(Math.round(x / width));
  };

  const handleNext = () => {
    if (activeIndex === SLIDES.length - 1) {
      router.push('/(onboarding)/pharmacist/sign-up' as any);
    } else {
      scrollRef.current?.scrollTo({ x: (activeIndex + 1) * width, animated: true });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
      >
        {SLIDES.map((slide, index) => (
          <View key={slide.id} style={styles.slide}>
            
            {slide.id === '1' ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: slide.image }} style={styles.image} />
                {/* Floating Badge */}
                <View style={styles.floatingBadge}>
                  <Ionicons name={slide.icon as any} size={20} color="#0B1C5A" style={{ marginRight: 8 }} />
                  <Text style={styles.badgeText}>{slide.badge}</Text>
                </View>
              </View>
            ) : (
              // Custom UI for slide 2
              <View style={styles.customCardContainer}>
                <View style={styles.customCard}>
                  {/* Top Row */}
                  <View style={styles.cardTopRow}>
                    <View style={styles.dotGroup}>
                      <View style={styles.smallDot} />
                      <View style={styles.smallDot} />
                    </View>
                    <View style={styles.walletBox}>
                      <Ionicons name="wallet" size={16} color="#fff" />
                    </View>
                  </View>

                  {/* Floating Link */}
                  <View style={styles.floatingLink}>
                    <Ionicons name="link" size={18} color="#0B1C5A" style={{ transform: [{ rotate: '45deg' }] }} />
                  </View>

                  {/* Skeletons */}
                  <View style={styles.skeletonRow}>
                    <View style={[styles.skeletonIcon, { backgroundColor: '#CCFBF1' }]}>
                      <Ionicons name="cash-outline" size={16} color="#0F766E" />
                    </View>
                    <View>
                      <View style={[styles.skeletonBar, { width: 100, marginBottom: 6 }]} />
                      <View style={[styles.skeletonBar, { width: 140 }]} />
                    </View>
                  </View>
                  <View style={styles.skeletonRow}>
                    <View style={[styles.skeletonIcon, { backgroundColor: '#E0F2FE' }]}>
                      <Ionicons name="stats-chart" size={16} color="#0369A1" />
                    </View>
                    <View>
                      <View style={[styles.skeletonBar, { width: 70, marginBottom: 6 }]} />
                      <View style={[styles.skeletonBar, { width: 120 }]} />
                    </View>
                  </View>
                  <View style={styles.skeletonRow}>
                    <View style={[styles.skeletonIcon, { backgroundColor: '#DCFCE7' }]}>
                      <Ionicons name="shield-checkmark" size={16} color="#15803D" />
                    </View>
                    <View>
                      <View style={[styles.skeletonBar, { width: 120, marginBottom: 6 }]} />
                      <View style={[styles.skeletonBar, { width: 90 }]} />
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  {/* Footer */}
                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.cardFooterLabel}>Total Earnings</Text>
                      <Text style={styles.cardFooterAmount}>$4,250.00</Text>
                    </View>
                    <View style={styles.addBtn}>
                      <Ionicons name="add" size={20} color="#fff" />
                    </View>
                  </View>
                </View>
              </View>
            )}
            
            <View style={styles.textContainer}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomContainer}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                activeIndex === i && styles.dotActive
              ]}
            />
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>
            {activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        {/* Skip Button - Hidden on last slide */}
        <View style={styles.skipBtnContainer}>
          {activeIndex !== SLIDES.length - 1 && (
            <TouchableOpacity 
              style={styles.skipBtn}
              onPress={() => router.push('/(onboarding)/pharmacist/sign-up' as any)}
            >
              <Text style={styles.skipBtnText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Encryption Badge */}
        <View style={styles.encryptionBadge}>
          <Ionicons name="lock-closed" size={12} color="#6B7280" style={{ marginRight: 6 }} />
          <Text style={styles.encryptionText}>AES-256 ENCRYPTED</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F9',
  },
  slide: {
    width,
    alignItems: 'center',
    paddingTop: 40,
  },
  imageContainer: {
    width: width - 48,
    height: width - 48,
    borderRadius: 32,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    marginBottom: 40,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  floatingBadge: {
    position: 'absolute',
    bottom: -20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  badgeText: {
    color: '#0B1C5A',
    fontSize: 14,
    fontWeight: '700',
  },
  textContainer: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0B1C5A',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#0B1C5A',
  },
  nextBtn: {
    backgroundColor: '#0B1C5A',
    width: '100%',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  skipBtnContainer: {
    height: 48,
    marginBottom: 16,
    justifyContent: 'center',
  },
  skipBtn: {
    paddingVertical: 12,
  },
  skipBtnText: {
    color: '#4B5563',
    fontSize: 15,
    fontWeight: '600',
  },
  encryptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 'auto',
  },
  encryptionText: {
    color: '#4B5563',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  customCardContainer: {
    width: width - 48,
    height: width - 48,
    backgroundColor: '#fff',
    borderRadius: 32,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    marginBottom: 40,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customCard: {
    width: '100%',
    height: '100%',
    padding: 24,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dotGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  smallDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  walletBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#0B1C5A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingLink: {
    position: 'absolute',
    top: 60,
    right: -15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    zIndex: 10,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  skeletonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  skeletonBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardFooterLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  cardFooterAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0B1C5A',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0B1C5A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
