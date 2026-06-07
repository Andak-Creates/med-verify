import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function ScanQrScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [showMock, setShowMock] = useState(false);

  // Scanning laser animation
  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    // Simulate navigation to drug details
    setTimeout(() => {
      router.push({
        pathname: '/(user)/home/result',
        params: { code: data },
      } as any);
    }, 1000);
  };

  // Check if permission is denied or loading and we should fallback to simulated scan
  const isCameraAvailable = permission && permission.granted && !showMock;

  const translateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 250],
  });

  return (
    <SafeAreaView className="flex-1 bg-transparent" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4 flex-row justify-between items-center border-b border-gray-100 bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="chevron-back" size={24} color="#0B1C5A" />
        </TouchableOpacity>
        <Text className="text-[20px] font-extrabold text-[#0B1C5A] flex-1 text-center mr-10">
          MedVerify
        </Text>
        
        {/* User profile icon */}
        <View className="w-9 h-9 rounded-full border border-gray-200 overflow-hidden absolute right-6">
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100' }} 
            className="w-full h-full"
          />
        </View>
      </View>

      <View className="flex-1 px-6 pt-6 items-center">
        {/* Title */}
        <Text className="text-[24px] font-extrabold text-[#0B1C5A] text-center mb-2">
          Scan Medication
        </Text>
        <Text className="text-[14px] text-[#8E9CB2] text-center mb-6 px-4 leading-5">
          Align the QR code or barcode within the frame to verify authenticity.
        </Text>

        {/* Camera Preview Box */}
        <View
          className="w-[280px] h-[280px] rounded-[32px] overflow-hidden bg-black relative shadow-lg"
          style={{
            shadowColor: "#0b1c5a",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {isCameraAvailable ? (
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              enableTorch={torchEnabled}
              barcodeScannerSettings={{
                barcodeTypes: ['qr', 'ean13', 'ean8', 'code128'],
              }}
              onBarcodeScanned={handleBarCodeScanned}
            />
          ) : (
            // Simulated Camera Fallback (blister pack medication image)
            <View className="w-full h-full relative bg-gray-900">
              <Image
                source={require('../../../../assets/images/scanner-medication.png')}
                className="w-full h-full opacity-90"
                resizeMode="cover"
              />
              
              {/* Permission prompt overlay if not granted */}
              {(!permission || !permission.granted) && (
                <View className="absolute inset-0 bg-black/60 items-center justify-center p-4">
                  <Text className="text-white text-center text-[12px] font-bold mb-3 px-2">
                    Camera permission is required for live scanning.
                  </Text>
                  <TouchableOpacity
                    onPress={requestPermission}
                    className="bg-[#0B1C5A] px-4 py-2 rounded-xl"
                  >
                    <Text className="text-white text-[11px] font-extrabold uppercase tracking-wider">
                      Grant Camera Access
                    </Text>
                  </TouchableOpacity>
                  
                  {/* Simulate Scan Button */}
                  <TouchableOpacity
                    onPress={() => {
                      setScanned(true);
                      setTimeout(() => {
                        router.push({
                          pathname: '/(user)/home/result',
                          params: { code: 'MOCK_NAFDAC_12345' },
                        } as any);
                      }, 1000);
                    }}
                    className="mt-3"
                  >
                    <Text className="text-white/60 text-[11px] font-bold underline">
                      Simulate verification scan
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Scanner Overlay Frame (Brackets) */}
          <View className="absolute inset-0 pointer-events-none p-8 justify-between">
            <View className="flex-row justify-between">
              {/* Top Left Bracket */}
              <View className="w-8 h-8 border-t-4 border-l-4 border-[#0B1C5A] rounded-tl-lg" />
              {/* Top Right Bracket */}
              <View className="w-8 h-8 border-t-4 border-r-4 border-[#0B1C5A] rounded-tr-lg" />
            </View>
            <View className="flex-row justify-between">
              {/* Bottom Left Bracket */}
              <View className="w-8 h-8 border-b-4 border-l-4 border-[#0B1C5A] rounded-bl-lg" />
              {/* Bottom Right Bracket */}
              <View className="w-8 h-8 border-b-4 border-r-4 border-[#0B1C5A] rounded-br-lg" />
            </View>
          </View>

          {/* Animated Laser Line */}
          <Animated.View
            style={[
              styles.laserLine,
              { transform: [{ translateY }] }
            ]}
          />

          {/* Torch/Flashlight Toggle Button */}
          <TouchableOpacity
            onPress={() => setTorchEnabled(!torchEnabled)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 border border-white/50 items-center justify-center shadow-sm"
          >
            <Ionicons
              name={torchEnabled ? "flash" : "flash-off"}
              size={18}
              color="#0B1C5A"
            />
          </TouchableOpacity>
        </View>

        {/* Action Buttons Grid */}
        <View className="flex-row gap-4 w-full mt-8">
          {/* Take Photo */}
          <TouchableOpacity
            onPress={() => router.push('/(user)/home/scan-image' as any)}
            className="flex-1 bg-white border border-white/80 rounded-2xl py-4 flex-row items-center justify-center gap-2 shadow-sm"
          >
            <Ionicons name="camera-outline" size={18} color="#0B1C5A" />
            <Text className="text-[#0B1C5A] text-[13px] font-bold">
              Take Photo
            </Text>
          </TouchableOpacity>

          {/* Enter NAFDAC */}
          <TouchableOpacity
            onPress={() => router.push('/(user)/home/scan-manual' as any)}
            className="flex-1 bg-white border border-white/80 rounded-2xl py-4 flex-row items-center justify-center gap-2 shadow-sm"
          >
            <Ionicons name="keypad-outline" size={18} color="#0B1C5A" />
            <Text className="text-[#0B1C5A] text-[13px] font-bold">
              Enter NAFDAC
            </Text>
          </TouchableOpacity>
        </View>

        {/* Verification Status Pill */}
        <View className="w-full mt-8 bg-white border border-[#E8F5E9] rounded-2xl p-4 flex-row items-center gap-3 shadow-sm">
          <Ionicons name="checkmark-circle" size={22} color="#2E7D32" />
          <Text className="text-[#0B1C5A] text-[13px] font-semibold flex-1">
            Last verified: <Text className="font-extrabold text-[#2E7D32]">Paracetamol BP 500mg</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  laserLine: {
    position: 'absolute',
    left: '12%',
    right: '12%',
    height: 3,
    backgroundColor: '#00D2FF',
    borderRadius: 1,
    shadowColor: '#00D2FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
