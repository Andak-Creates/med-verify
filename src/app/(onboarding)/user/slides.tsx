import React, { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Dimensions,
  Image,
  Pressable,
  Text,
  View,
  ViewToken,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
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
        backgroundColor: '#fff',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOpacity: 0.2,
        shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        padding: 4,
      }}>
        <Image
          source={require('../../../../assets/images/logo.png')}
          style={{ width: '100%', height: '100%', borderRadius: 8 }}
          resizeMode="contain"
        />
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
        <Ionicons name="shield-checkmark" size={14} color="#0b1c5a" />
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#0b1c5a' }}>Verified Experts</Text>
      </View>
    </View>
  );
}

// ─── Illustration: Slide 3 ─────────────────────────────────────────────────
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
          <Ionicons name="sparkles" size={18} color="#fff" />
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
        <Ionicons name="chatbox-outline" size={16} color="#9ca3af" style={{ marginRight: 8 }} />
        <Text style={{ flex: 1, fontSize: 13, color: '#9ca3af' }}>Ask anything...</Text>
        <View style={{
          width: 28, height: 28, borderRadius: 14,
          backgroundColor: '#0b1c5a',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons name="send" size={12} color="#fff" />
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

// ─── Native 120 FPS UI-Thread Pagination Dot ───────────────────────────────────────────
function PaginationDot({ index, scrollX }: { index: number; scrollX: SharedValue<number> }) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];
    const width = interpolate(scrollX.value, inputRange, [8, 28, 8], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.35, 1, 0.35], Extrapolation.CLAMP);
    return {
      width,
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          height: 8,
          borderRadius: 4,
          backgroundColor: '#0b1c5a',
          marginHorizontal: 3,
        },
      ]}
    />
  );
}

// ─── Slide Item ────────────────────────────────────────────────────────────
const SlideItem = React.memo(function SlideItem({ item }: { item: (typeof SLIDES)[0] }) {
  const { Illustration } = item;

  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        paddingHorizontal: 24,
        paddingTop: 52,
      }}
    >
      <Illustration />
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
    </View>
  );
});

// ─── Main Screen ───────────────────────────────────────────────────────────
export default function SlidesScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<Animated.FlatList<any>>(null);

  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

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
      {/* Native 120 FPS Animated FlatList */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={3}
        renderItem={({ item }) => <SlideItem item={item} />}
      />

      {/* Bottom Controls */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 44, paddingTop: 16 }}>
        {/* Pagination */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 24 }}>
          {SLIDES.map((_, i) => (
            <PaginationDot key={i} index={i} scrollX={scrollX} />
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
            <Ionicons name="lock-closed" size={12} color="#0b1c5a" style={{ marginRight: 6 }} />
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
