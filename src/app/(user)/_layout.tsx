import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { SplashLoading } from "../../components/SplashLoading";
import { useLanguage } from "../../i18n";

export default function UserLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        <SplashLoading />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href={"/(onboarding)/splash" as any} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        backBehavior="history"
        tabBar={(props) => <CustomTabBar {...props} />}
        screenLayout={({ children }) => (
          <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {children}
          </View>
        )}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="home/index" options={{ title: t.tabs.home }} />
        <Tabs.Screen name="history/index" options={{ title: t.tabs.history }} />
        <Tabs.Screen name="account/index" options={{ title: t.tabs.account }} />

        {/* Hidden sub-screens */}
        <Tabs.Screen name="home/scan-qr" options={{ href: null, tabBarStyle: { display: "none" } }} />
        <Tabs.Screen name="home/scan-ocr" options={{ href: null, tabBarStyle: { display: "none" } }} />
        <Tabs.Screen name="home/scan-manual" options={{ href: null, tabBarStyle: { display: "none" } }} />
        <Tabs.Screen name="home/result" options={{ href: null }} />
        <Tabs.Screen name="home/drug-details" options={{ href: null }} />
        <Tabs.Screen name="home/report" options={{ href: null }} />
        <Tabs.Screen name="home/report-confirm" options={{ href: null }} />
        <Tabs.Screen name="account/notifications" options={{ href: null }} />
        <Tabs.Screen name="account/delete-account" options={{ href: null }} />
      </Tabs>
    </View>
  );
}

function getIcon(routeName: string, focused: boolean): keyof typeof Ionicons.glyphMap {
  if (routeName.includes("home")) return focused ? "scan" : "scan-outline";
  if (routeName.includes("history")) return focused ? "time" : "time-outline";
  if (routeName.includes("account")) return focused ? "settings" : "settings-outline";
  return "ellipse-outline";
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const NAVY = "#0B1C5A";
  const GRAY = "#8E9CB2";
  const bottomPad = Platform.OS === "ios" ? insets.bottom + 6 : 14;

  const currentRoute = state.routes[state.index];
  const currentOptions = descriptors[currentRoute.key].options;
  if (currentOptions.tabBarStyle?.display === "none") {
    return null;
  }

  const mainTabs = [
    "home/index",
    "history/index",
    "account/index",
  ];
  const visibleRoutes = state.routes.filter((r: any) =>
    mainTabs.includes(r.name),
  );

  return (
    <View style={styles.container}>
      <View style={[styles.barBackground, { paddingBottom: bottomPad }]}>
        {visibleRoutes.map((route: any) => {
          const { options } = descriptors[route.key];
          const label: string = options.title ?? route.name;
          let focused =
            state.index ===
            state.routes.findIndex((r: any) => r.key === route.key);

          const isChildHomeRoute =
            currentRoute.name.startsWith("home/") &&
            currentRoute.name !== "home/index";
          const isFromHistory = currentRoute.params?.from === "history";

          if (isChildHomeRoute) {
            if (route.name === "history/index") {
              focused = isFromHistory;
            } else if (route.name === "home/index") {
              focused = !isFromHistory;
            }
          }

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
                name={getIcon(route.name, focused)}
                size={23}
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
    zIndex: 100,
  },
  barBackground: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 10,
    shadowColor: "#0B1C5A",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  activeLine: {
    position: "absolute",
    bottom: -6,
    width: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#0B1C5A",
  },
});
