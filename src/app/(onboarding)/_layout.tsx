import { Stack } from 'expo-router';
import { StyleSheet, View, ImageBackground } from 'react-native';

export default function OnboardingLayout() {
  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require('../../../assets/images/background.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'fade',
        }}
      />
    </View>
  );
}
