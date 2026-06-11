import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Redirect, Tabs } from "expo-router";
import {
  ActivityIndicator,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

export default function Layout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#0B1C5A" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href={"/(onboarding)/splash" as any} />;
  }

  if (user?.role === "PHARMACIST") {
    return <Redirect href={"/(pharmacist)/dashboard" as any} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenLayout={({ children }) => (
          <View style={{ flex: 1 }}>
            <ImageBackground
              source={require("../../../assets/images/background.png")}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(255,255,255,0.25)" }]} />
            {children}
          </View>
        )}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="home/index" options={{ title: "HOME" }} />
        <Tabs.Screen name="history/index" options={{ title: "HISTORY" }} />
        <Tabs.Screen name="ai-chat/index" options={{ title: "AI CHAT" }} />
        <Tabs.Screen name="pharmacy/index" options={{ title: "PHARMACY" }} />
        <Tabs.Screen name="account/index" options={{ title: "ACCOUNT" }} />
        {/* Hidden screens */}
        <Tabs.Screen
          name="pharmacy/consultation-call"
          options={{ href: null, tabBarStyle: { display: "none" } }}
        />
        <Tabs.Screen name="pharmacy/[id]" options={{ href: null }} />
        <Tabs.Screen
          name="pharmacy/book-consultation"
          options={{ href: null }}
        />
        <Tabs.Screen name="pharmacy/booking-confirm" options={{ href: null }} />
        <Tabs.Screen
          name="pharmacy/consultation-live"
          options={{ href: null, tabBarStyle: { display: "none" } }}
        />
        <Tabs.Screen
          name="pharmacy/pharmacist-profile"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="pharmacy/pharmacy-profile"
          options={{ href: null }}
        />
        <Tabs.Screen name="account/notifications" options={{ href: null }} />
        <Tabs.Screen name="account/subscription" options={{ href: null }} />
        <Tabs.Screen name="account/paywall" options={{ href: null }} />
        <Tabs.Screen name="account/delete-account" options={{ href: null }} />
        <Tabs.Screen name="home/drug-details" options={{ href: null }} />
        <Tabs.Screen name="home/report" options={{ href: null }} />
        <Tabs.Screen name="home/report-confirm" options={{ href: null }} />
        <Tabs.Screen name="home/result" options={{ href: null }} />
        <Tabs.Screen name="home/scan-image" options={{ href: null, tabBarStyle: { display: "none" } }} />
        <Tabs.Screen name="home/scan-loading" options={{ href: null, tabBarStyle: { display: "none" } }} />
        <Tabs.Screen name="home/scan-manual" options={{ href: null, tabBarStyle: { display: "none" } }} />
        <Tabs.Screen name="home/scan-qr" options={{ href: null, tabBarStyle: { display: "none" } }} />
        <Tabs.Screen name="ai-chat/chat" options={{ href: null, tabBarStyle: { display: "none" } }} />
        <Tabs.Screen name="ai-chat/name-assistant" options={{ href: null }} />
      </Tabs>
    </View>
  );
}

function getIcon(routeName: string, focused: boolean): string {
  if (routeName.includes("home")) return focused ? "home" : "home-outline";
  if (routeName.includes("history")) return focused ? "time" : "time-outline";
  if (routeName.includes("ai-chat"))
    return focused ? "sparkles" : "sparkles-outline";
  if (routeName.includes("pharmacy"))
    return focused ? "location" : "location-outline";
  if (routeName.includes("account"))
    return focused ? "person-circle" : "person-circle-outline";
  return "ellipse-outline";
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { isPro } = useAuth();
  const insets = useSafeAreaInsets();
  const NAVY = "#0B1C5A";
  const GRAY = "#A0AABB";
  const bottomPad = Platform.OS === "ios" ? insets.bottom + 4 : 12;

  const currentRoute = state.routes[state.index];
  const currentOptions = descriptors[currentRoute.key].options;
  if (currentOptions.tabBarStyle?.display === "none") {
    return null;
  }

  const mainTabs = [
    "home/index",
    "history/index",
    "ai-chat/index",
    "pharmacy/index",
    "account/index",
  ];
  const visibleRoutes = state.routes.filter((r: any) =>
    mainTabs.includes(r.name),
  );

  return (
    // Outer container provides transparent space for the button to float into
    <View style={styles.container}>
      <View style={[styles.barBackground, { paddingBottom: bottomPad }]}>
        {visibleRoutes.map((route: any) => {
          const { options } = descriptors[route.key];
          const label: string = options.title ?? route.name;
          const focused =
            state.index ===
            state.routes.findIndex((r: any) => r.key === route.key);

          const onPress = () => {
            const isRestricted =
              !isPro &&
              (route.name.includes("ai-chat") ||
                route.name.includes("pharmacy") ||
                route.name.includes("history"));

            if (isRestricted) {
              navigation.navigate("account/paywall");
              return;
            }

            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          if (route.name.includes("ai-chat")) {
            return (
              <View key={route.key} style={styles.tab}>
                {/* Floating button wrapped in Touchable */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={onPress}
                  style={styles.floatingButtonWrap}
                >
                  <View
                    style={[styles.aiButton, focused && styles.aiButtonFocused]}
                  >
                    <Ionicons name="sparkles" size={26} color="#fff" />
                  </View>
                  <Text
                    style={[
                      styles.label,
                      { color: focused ? NAVY : GRAY, marginTop: 42 },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }

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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    // We add padding top so the floating button isn't clipped by parents
    paddingTop: 30,
    // Ensures touches outside bounds register (especially on iOS)
    zIndex: 100,
  },
  barBackground: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    height: 65, // Explicit height guarantees it never collapses
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  floatingButtonWrap: {
    position: "absolute",
    top: -24, // Lifts the button clearly out of the bar
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  aiButton: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "#0B1C5A",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    shadowColor: "#0B1C5A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  aiButtonFocused: {
    backgroundColor: "#162B7A",
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
