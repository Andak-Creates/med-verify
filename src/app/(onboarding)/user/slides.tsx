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
import { useLanguage } from '@/i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Illustration: Slide 1 (Verify Drugs) ────────────────────────────────────
function Slide1Illustration() {
  return (
    <View style={{ width: '100%', height: 280, borderRadius: 24, overflow: 'hidden' }}>
      <Image
        source={require('../../../../assets/images/slide1-verify-drugs.png')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
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

// ─── Illustration: Slide 2 (Report Counterfeits) ─────────────────────────────
function Slide2Illustration() {
  return (
    <View style={{
      width: '100%', height: 280, borderRadius: 24, overflow: 'hidden',
      backgroundColor: '#0B1C5A', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <View style={{
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderWidth: 2, borderColor: '#ef4444',
        alignItems: 'center', justifyContent: 'center', marginBottom: 18,
      }}>
        <Ionicons name="shield-outline" size={42} color="#fca5a5" />
      </View>
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16,
        paddingHorizontal: 16, paddingVertical: 10, width: '100%',
        flexDirection: 'row', alignItems: 'center', gap: 12,
      }}>
        <Ionicons name="flag" size={20} color="#f87171" />
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Direct Safety Reporting</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Flag suspicious & expired batches</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Illustration: Slide 3 (Multi-Language) ──────────────────────────────────
function Slide3Illustration() {
  return (
    <View style={{
      width: '100%', height: 280, borderRadius: 24, overflow: 'hidden',
      backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {[
          { flag: '🇬🇧', label: 'English' },
          { flag: '🇫🇷', label: 'Français' },
          { flag: '🇳🇬', label: 'Hausa' },
          { flag: '🇳🇬', label: 'Yorùbá' },
          { flag: '🇳🇬', label: 'Igbo' },
          { flag: '🇪🇸', label: 'Español' },
          { flag: '🇸🇦', label: 'العربية' },
        ].map((item, idx) => (
          <View
            key={idx}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8,
              borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.05,
              shadowRadius: 4, elevation: 2,
            }}
          >
            <Text style={{ fontSize: 16 }}>{item.flag}</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#0B1C5A' }}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Native 120 FPS UI-Thread Pagination Dot ──────────────────────────────────
function PaginationDot({ index, scrollX }: { index: number; scrollX: SharedValue<number> }) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];
    const width = interpolate(scrollX.value, inputRange, [8, 28, 8], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.35, 1, 0.35], Extrapolation.CLAMP);
    return { width, opacity };
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

// ─── Main Screen ───────────────────────────────────────────────────────────
export default function SlidesScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<Animated.FlatList<any>>(null);
  const scrollX = useSharedValue(0);

  const slides = [
    {
      id: '1',
      Illustration: Slide1Illustration,
      title: t.onboarding.slide1Title,
      description: t.onboarding.slide1Desc,
    },
    {
      id: '2',
      Illustration: Slide2Illustration,
      title: t.onboarding.slide2Title,
      description: t.onboarding.slide2Desc,
    },
    {
      id: '3',
      Illustration: Slide3Illustration,
      title: t.onboarding.slide3Title,
      description: t.onboarding.slide3Desc,
    },
  ];

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
  const isLastSlide = currentIndex === slides.length - 1;

  const goToNext = () => {
    if (currentIndex < slides.length - 1) {
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
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
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
        renderItem={({ item }) => {
          const { Illustration } = item;
          return (
            <View style={{ width: SCREEN_WIDTH, paddingHorizontal: 24, paddingTop: 52 }}>
              <Illustration />
              <Text style={{
                fontSize: 30, fontWeight: '800', color: '#0b1c5a',
                textAlign: 'center', lineHeight: 38,
                marginTop: 36, marginBottom: 14,
              }}>
                {item.title}
              </Text>
              <Text style={{
                fontSize: 15, color: '#374151', textAlign: 'center',
                lineHeight: 23, paddingHorizontal: 8,
              }}>
                {item.description}
              </Text>
            </View>
          );
        }}
      />

      {/* Bottom Controls */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 44, paddingTop: 16 }}>
        {/* Pagination */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 24 }}>
          {slides.map((_, i) => (
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
            {isLastSlide ? t.onboarding.getStarted : t.onboarding.next}
          </Text>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>→</Text>
        </Pressable>

        {/* Skip */}
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
              {t.onboarding.skip}
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
              OFFICIAL DRUG REGISTRY
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
