import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
  ViewToken,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Illustration: Slide 1 ─────────────────────────────────────────────────
function Slide1Illustration() {
  return (
    <View style={{ width: '100%', height: 280, borderRadius: 24, overflow: 'hidden' }}>
      <Image
        source={require('../../../../assets/images/slide1-verify-drugs.png')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
      {/* Badge top right */}
      <View style={{
        position: 'absolute', top: 14, right: 14,
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: '#0b1c5a',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOpacity: 0.3,
        shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
      }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>✓</Text>
      </View>
    </View>
  );
}

// ─── Illustration: Slide 2 ─────────────────────────────────────────────────
function Slide2Illustration() {
  return (
    <View style={{ width: '100%', height: 280, borderRadius: 24, overflow: 'hidden' }}>
      <Image
        source={require('../../../../assets/images/slide2-consult-experts.png')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
      {/* Verified Experts badge */}
      <View style={{
        position: 'absolute', top: 14, left: 14,
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 50, paddingHorizontal: 12, paddingVertical: 6,
        shadowColor: '#000', shadowOpacity: 0.1,
        shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
        gap: 6,
      }}>
        <Text style={{ fontSize: 13 }}>🛡️</Text>
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#0b1c5a' }}>Verified Experts</Text>
      </View>
    </View>
  );
}

// ─── Illustration: Slide 3 ─────────────────────────────────────────────────
// AI health companion chat UI
function Slide3Illustration() {
  return (
    <View style={{
      width: '100%',
      backgroundColor: 'rgba(255,255,255,0.92)',
      borderRadius: 24,
      overflow: 'hidden',
      shadowColor: '#000', shadowOpacity: 0.1,
      shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    }}>
      {/* Chat Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
      }}>
        {/* AI Avatar */}
        <View style={{
          width: 40, height: 40, borderRadius: 20,
          backgroundColor: '#0b1c5a',
          alignItems: 'center', justifyContent: 'center',
          marginRight: 10,
        }}>
          <Text style={{ color: '#fff', fontSize: 18 }}>✦</Text>
        </View>
        <View>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827' }}>MedVerify AI</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#16a34a' }} />
            <Text style={{ fontSize: 11, color: '#6b7280' }}>Online 24/7</Text>
          </View>
        </View>
      </View>

      {/* Chat messages */}
      <View style={{ padding: 14, gap: 10 }}>
        {/* User message */}
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{
            backgroundColor: '#0b1c5a',
            borderRadius: 18, borderBottomRightRadius: 4,
            paddingHorizontal: 14, paddingVertical: 10,
            maxWidth: '82%',
          }}>
            <Text style={{ color: '#fff', fontSize: 13, lineHeight: 19 }}>
              Can I take Ibuprofen with my{'\n'}prescription Lisinopril?
            </Text>
          </View>
          <Text style={{ fontSize: 10, color: '#9ca3af', marginTop: 4, marginRight: 2 }}>10:24 AM</Text>
        </View>

        {/* AI response */}
        <View style={{ alignItems: 'flex-start' }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 18, borderBottomLeftRadius: 4,
            paddingHorizontal: 14, paddingVertical: 10,
            maxWidth: '88%',
            borderWidth: 1, borderColor: '#e5e7eb',
          }}>
            <Text style={{ color: '#111827', fontSize: 13, lineHeight: 19 }}>
              I've checked your records. Ibuprofen can potentially reduce the effectiveness of Lisinopril. Consult your doctor.
            </Text>
          </View>
          <Text style={{ fontSize: 10, color: '#9ca3af', marginTop: 4, marginLeft: 2 }}>10:24 AM</Text>
        </View>
      </View>

      {/* Input bar */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 14, marginBottom: 14,
        backgroundColor: '#f3f4f6',
        borderRadius: 50, paddingHorizontal: 14, paddingVertical: 10,
      }}>
        <Text style={{ fontSize: 16, marginRight: 8, color: '#9ca3af' }}>⌨️</Text>
        <Text style={{ flex: 1, fontSize: 13, color: '#9ca3af' }}>Ask anything...</Text>
        <View style={{
          width: 30, height: 30, borderRadius: 15,
          backgroundColor: '#0b1c5a',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: '#fff', fontSize: 14 }}>▶</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Slides Data ───────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: '1',
    Illustration: Slide1Illustration,
    title: 'Verify your drugs\ninstantly',
    description:
      'Scan QR codes, barcodes, or packaging to verify the authenticity of your medication in seconds.',
  },
  {
    id: '2',
    Illustration: Slide2Illustration,
    title: 'Find & Consult\nExperts',
    description:
      'Locate verified pharmacies nearby and book professional consultations with licensed pharmacists at your convenience.',
  },
  {
    id: '3',
    Illustration: Slide3Illustration,
    title: 'Your Health\nCompanion',
    description:
      'Get 24/7 AI-powered health advice, check drug interactions, and find nearby verified pharmacies.',
  },
];

// ─── Pagination Dot ────────────────────────────────────────────────────────
function PaginationDot({ index, currentIndex }: { index: number; currentIndex: number }) {
  const isActive = index === currentIndex;
  const width = useSharedValue(isActive ? 28 : 8);

  React.useEffect(() => {
    width.value = withSpring(isActive ? 28 : 8, { damping: 14, stiffness: 160 });
  }, [isActive]);

  const style = useAnimatedStyle(() => ({ width: width.value }));

  return (
    <Animated.View
      style={[style, {
        height: 8, borderRadius: 4,
        backgroundColor: isActive ? '#0b1c5a' : '#0b1c5a33',
        marginHorizontal: 3,
      }]}
    />
  );
}

// ─── Slide Item ────────────────────────────────────────────────────────────
function SlideItem({
  item,
  index,
  currentIndex,
}: {
  item: (typeof SLIDES)[0];
  index: number;
  currentIndex: number;
}) {
  const opacity = useSharedValue(index === 0 ? 1 : 0.5);
  const scale = useSharedValue(index === 0 ? 1 : 0.96);

  React.useEffect(() => {
    const isActive = index === currentIndex;
    opacity.value = withTiming(isActive ? 1 : 0.5, { duration: 280 });
    scale.value = withSpring(isActive ? 1 : 0.96, { damping: 16, stiffness: 150 });
  }, [currentIndex]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const { Illustration } = item;

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: SCREEN_WIDTH,
          paddingHorizontal: 24,
          paddingTop: 52,
        },
      ]}
    >
      {/* Illustration */}
      <Illustration />

      {/* Text */}
      <Text style={{
        fontSize: 34, fontWeight: '800', color: '#0b1c5a',
        textAlign: 'center', lineHeight: 42,
        marginTop: 36, marginBottom: 14,
      }}>
        {item.title}
      </Text>
      <Text style={{
        fontSize: 16, color: '#374151', textAlign: 'center',
        lineHeight: 25, paddingHorizontal: 8,
      }}>
        {item.description}
      </Text>
    </Animated.View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────
export default function SlidesScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const goToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      router.push('/(onboarding)/user/sign-up' as any);
    }
  };

  const skip = () => {
    router.push('/(onboarding)/user/sign-up' as any);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item, index }) => (
          <SlideItem item={item} index={index} currentIndex={currentIndex} />
        )}
      />

      {/* Bottom Controls */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 44, paddingTop: 16 }}>
        {/* Pagination */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 24 }}>
          {SLIDES.map((_, i) => (
            <PaginationDot key={i} index={i} currentIndex={currentIndex} />
          ))}
        </View>

        {/* Next / Get Started */}
        <Pressable
          onPress={goToNext}
          style={({ pressed }) => ({
            backgroundColor: '#0b1c5a',
            borderRadius: 50,
            paddingVertical: 18,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{
            color: '#fff', fontWeight: '700', fontSize: 16,
            letterSpacing: isLastSlide ? 1.5 : 0,
            textTransform: isLastSlide ? 'uppercase' : 'none',
          }}>
            {isLastSlide ? 'Get Started' : 'Next'}
          </Text>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>→</Text>
        </Pressable>

        {/* Skip / AES badge */}
        {!isLastSlide ? (
          <Pressable
            onPress={skip}
            style={({ pressed }) => ({
              alignItems: 'center', marginTop: 16,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={{
              color: '#0b1c5a', fontWeight: '700',
              fontSize: 12, letterSpacing: 2, textTransform: 'uppercase',
            }}>
              SKIP
            </Text>
          </Pressable>
        ) : (
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            marginTop: 16,
            backgroundColor: 'rgba(255,255,255,0.75)',
            borderRadius: 50, paddingHorizontal: 18, paddingVertical: 9,
            alignSelf: 'center',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)',
          }}>
            <Text style={{ fontSize: 12, marginRight: 6 }}>🔒</Text>
            <Text style={{
              fontSize: 10, fontWeight: '700', color: '#0b1c5a', letterSpacing: 2,
            }}>
              AES-256 ENCRYPTED
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
