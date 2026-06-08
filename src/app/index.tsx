import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0B1C5A" />
      </View>
    );
  }

  if (isAuthenticated) {
    if (user?.role === 'PHARMACIST') {
      return <Redirect href={'/(pharmacist)/dashboard' as any} />;
    }
    return <Redirect href={'/(user)/home' as any} />;
  }

  return <Redirect href={'/(onboarding)/splash' as any} />;
}
