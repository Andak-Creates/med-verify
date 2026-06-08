import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0B1C5A" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href={'/(onboarding)/splash' as any} />;
  }

  if (user?.role !== 'PHARMACIST') {
    return <Redirect href={'/(user)/home' as any} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }} />
  );
}
