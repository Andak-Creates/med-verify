import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export default function PharmacistLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0B1C5A" />
      </View>
    );
  }

  // Redirect to splash if not authenticated
  if (!isAuthenticated) {
    return <Redirect href={'/(onboarding)/splash' as any} />;
  }

  // Ensure only pharmacists can access this layout
  if (user?.role !== 'PHARMACIST') {
    return <Redirect href={'/(user)/home' as any} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneContainerStyle: { backgroundColor: 'transparent' }
        }}
      >
        <Tabs.Screen name="dashboard/index" options={{ title: "DASHBOARD" }} />
        <Tabs.Screen name="consults/index"  options={{ title: "CONSULTS" }} />
        <Tabs.Screen name="wallet/index"    options={{ title: "WALLET" }} />
        <Tabs.Screen name="profile/index"   options={{ title: "PROFILE" }} />
        {/* Hidden screens - registered in layout so they keep the nav bar */}
        <Tabs.Screen name="notifications"           options={{ href: null }} />
        <Tabs.Screen name="call"                    options={{ href: null }} />
        <Tabs.Screen name="profile/settings"        options={{ href: null }} />
        <Tabs.Screen name="profile/edit-profile"    options={{ href: null }} />
        <Tabs.Screen name="profile/fee-settings"    options={{ href: null }} />
        <Tabs.Screen name="wallet/earnings-history" options={{ href: null }} />
        <Tabs.Screen name="wallet/withdraw"         options={{ href: null }} />
      </Tabs>
    </View>
  );
}

function getIcon(routeName: string, focused: boolean): string {
  if (routeName.includes("dashboard")) return focused ? "grid" : "grid-outline";
  if (routeName.includes("consults"))  return focused ? "chatbubble" : "chatbubble-outline";
  if (routeName.includes("wallet"))    return focused ? "wallet" : "wallet-outline";
  if (routeName.includes("profile"))   return focused ? "person" : "person-outline";
  return "ellipse-outline";
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const NAVY = "#0B1C5A";
  const GRAY = "#A0AABB";
  const bottomPad = Platform.OS === "ios" ? insets.bottom + 4 : 12;

  const mainTabs = [
    "dashboard/index", 
    "consults/index", 
    "wallet/index", 
    "profile/index"
  ];
  const visibleRoutes = state.routes.filter((r: any) => mainTabs.includes(r.name));

  return (
    <View style={styles.container}>
      <View style={[styles.barBackground, { paddingBottom: bottomPad }]}>
        {visibleRoutes.map((route: any) => {
          const { options } = descriptors[route.key];
          const label: string = options.title ?? route.name;
          const focused = state.index === state.routes.findIndex((r: any) => r.key === route.key);

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={styles.tab}
            >
              <Ionicons
                name={getIcon(route.name, focused) as any}
                size={22}
                color={focused ? NAVY : GRAY}
                style={{ marginBottom: 4 }}
              />
              <Text style={[styles.label, { color: focused ? NAVY : GRAY }]}>
                {label}
              </Text>
              {focused && <View style={styles.activeLine} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  barBackground: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    height: 65,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
    paddingTop: 12,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    position: "relative",
  },
  label: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  activeLine: {
    position: "absolute",
    bottom: -8, 
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#0B1C5A",
  },
});
