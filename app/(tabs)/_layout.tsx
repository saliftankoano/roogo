import type {
  BottomTabBarProps,
  BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { router, Tabs, usePathname } from "expo-router";
import {
  HouseIcon,
  HeartIcon,
  RocketLaunchIcon as RocketIcon,
  PlusIcon,
  UserIcon,
  BuildingsIcon,
  SignInIcon,
} from "phosphor-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useUserType } from "../../hooks/useUserType";
import { tokens } from "../../theme/tokens";

const ACTIVE_COLOR = tokens.colors.roogo.primary[500];
const INACTIVE_COLOR = tokens.colors.roogo.neutral[500];

const IconWrapper = ({
  children,
  focused,
}: {
  children: React.ReactNode;
  focused: boolean;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused, scaleAnim]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
      {focused && (
        <View
          style={{
            position: "absolute",
            bottom: -8,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: ACTIVE_COLOR,
          }}
        />
      )}
    </Animated.View>
  );
};

const TabIcon = ({
  Icon,
  focused,
  size,
  weight = "bold",
}: {
  Icon: any;
  focused: boolean;
  size: number;
  weight?: "regular" | "bold" | "fill";
}) => (
  <IconWrapper focused={focused}>
    <Icon
      size={size}
      color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
      weight={focused ? "fill" : "bold"}
    />
  </IconWrapper>
);

const AddPropertyButton = ({ onPress }: { onPress?: () => void }) => (
  <TouchableOpacity
    onPress={() => onPress?.()}
    activeOpacity={0.9}
    style={{
      backgroundColor: tokens.colors.roogo.primary[500],
      width: 64, // Slightly larger
      height: 64,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: tokens.colors.roogo.primary[500],
      shadowOffset: { width: 0, height: 8 }, // Deeper shadow
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 10,
      marginBottom: 48, // Lift it up more to break the bar
      borderWidth: 4,
      borderColor: "#FFFFFF",
    }}
  >
    <PlusIcon size={32} color="#FFFFFF" weight="bold" />
  </TouchableOpacity>
);

export default function TabLayout() {
  const pathname = usePathname();
  const isDetailsPage = pathname.includes("/details");
  const { isOwner, isRenter, isGuest, isLoaded } = useUserType();

  // Track if we've ever loaded successfully to prevent blank flash on tab switches
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Cache user type to prevent tab bar jumping when auth state briefly changes
  const cachedUserTypeRef = useRef<{
    isOwner: boolean;
    isRenter: boolean;
    isGuest: boolean;
  } | null>(null);

  // Only update cached values when auth is fully loaded
  if (isLoaded && !cachedUserTypeRef.current) {
    cachedUserTypeRef.current = { isOwner, isRenter, isGuest };
  }

  // Use cached values if available, otherwise use current values
  const stableIsOwner = cachedUserTypeRef.current?.isOwner ?? isOwner;
  const stableIsRenter = cachedUserTypeRef.current?.isRenter ?? isRenter;
  const stableIsGuest = cachedUserTypeRef.current?.isGuest ?? isGuest;

  useEffect(() => {
    if (isLoaded && !hasLoadedOnce) {
      setHasLoadedOnce(true);
    }
  }, [isLoaded, hasLoadedOnce]);

  const commonTabBarStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.98)", // High opacity, slight translucency
    position: "absolute" as const,
    bottom: Platform.OS === "ios" ? 32 : 24,
    left: 20,
    right: 20,
    height: 72,
    borderRadius: 36,
    paddingBottom: 0,
    paddingTop: 0,
    borderTopWidth: 0,
    // Reduced top shadow aggressiveness
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8, // Reduced offset
    },
    shadowOpacity: 0.2, // Slightly reduced opacity
    shadowRadius: 16, // Slightly reduced radius
    elevation: 16,
    // Border for definition
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  };

  // Custom tab bar to include gradient and guest logic
  const CustomTabBar = (props: BottomTabBarProps) => {
    // Check if the current tab should be hidden (e.g., Details page)
    const currentRoute = props.state.routes[props.state.index];
    const { options } = props.descriptors[currentRoute.key];
    const isHidden = (options.tabBarStyle as any)?.display === "none";

    if (isHidden) {
      return null;
    }

    return (
      <>
        {/* Soft Gradient Fade at Bottom - Adjusted to be less aggressive */}
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.7)", "#FFFFFF"]}
          locations={[0, 0.7, 1]}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 100, // Reduced height
            zIndex: 0,
          }}
          pointerEvents="none"
        />

        {stableIsGuest ? (
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.98)",
              position: "absolute",
              bottom: Platform.OS === "ios" ? 32 : 24,
              left: 20,
              right: 20,
              height: 72,
              borderRadius: 36,
              // Reduced top shadow aggressiveness
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 8, // Reduced offset
              },
              shadowOpacity: 0.2, // Slightly reduced opacity
              shadowRadius: 16, // Slightly reduced radius
              elevation: 16,
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.08)",
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center",
              paddingHorizontal: 8,
              zIndex: 1,
            }}
          >
            {props.state.routes.map((route, index) => {
              const { options } = props.descriptors[route.key];
              const isFocused = props.state.index === index;

              const onPress = () => {
                const event = props.navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  props.navigation.navigate(route.name);
                }
              };

              if (route.name === "profile" && stableIsGuest) {
                return (
                  <TouchableOpacity
                    key={route.key}
                    onPress={() => {
                      router.push("/(auth)/sign-in");
                    }}
                    style={{
                      backgroundColor: tokens.colors.roogo.neutral[900],
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderRadius: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    activeOpacity={0.8}
                  >
                    <SignInIcon size={20} color="#FFFFFF" weight="bold" />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        marginLeft: 8,
                        color: "#FFFFFF",
                        fontFamily: "Urbanist-Bold",
                      }}
                    >
                      Se connecter
                    </Text>
                  </TouchableOpacity>
                );
              }

              if (route.name === "(home)") {
                return (
                  <TouchableOpacity
                    key={route.key}
                    accessibilityRole="button"
                    accessibilityState={isFocused ? { selected: true } : {}}
                    accessibilityLabel={options.tabBarAccessibilityLabel}
                    onPress={onPress}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                    }}
                  >
                    <TabIcon Icon={HouseIcon} focused={isFocused} size={24} />
                  </TouchableOpacity>
                );
              }

              return null;
            })}
          </View>
        ) : (
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1,
            }}
          >
            <BottomTabBar {...props} />
          </View>
        )}
      </>
    );
  };

  const commonScreenOptions: BottomTabNavigationOptions = {
    tabBarActiveTintColor: ACTIVE_COLOR,
    tabBarInactiveTintColor: INACTIVE_COLOR,
    tabBarStyle: isDetailsPage
      ? { display: "none" as const }
      : commonTabBarStyle,
    tabBarShowLabel: false, // Hide labels for cleaner look
    tabBarItemStyle: {
      height: 72,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 0,
      paddingTop: 12, // Push icons down visually to center them
    },
    // Add smooth transitions
    tabBarHideOnKeyboard: true,
    headerShown: false,
  };

  // Show loading state ONLY on very first load, never on tab switches
  // Once loaded, never show loading again to prevent blank flash
  if (!isLoaded && !hasLoadedOnce) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator
            size="large"
            color={tokens.colors.roogo.primary[500]}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <Tabs
        screenOptions={{
          ...commonScreenOptions,
          tabBarHideOnKeyboard: true,
          headerShown: false,
          animation: "none", // Disable animation to prevent blank flash during transition
          lazy: false, // Pre-load all tabs to prevent blank states on first visit
          freezeOnBlur: false, // Don't freeze screens when switching tabs
          sceneStyle: { backgroundColor: "#FFFFFF" }, // Ensure screens have background
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        {/* Home - Always visible */}
        <Tabs.Screen
          name="(home)"
          options={{
            title: "Accueil",
            tabBarIcon: ({ focused }) => (
              <TabIcon Icon={HouseIcon} focused={focused} size={24} />
            ),
          }}
        />

        {/* Favoris - Show for renters, hide for others */}
        <Tabs.Screen
          name="favoris"
          options={{
            title: "Favoris",
            tabBarIcon: ({ focused }) => (
              <TabIcon Icon={HeartIcon} focused={focused} size={24} />
            ),
            href: stableIsRenter ? undefined : null,
          }}
        />

        {/* Upgrades/Boosts - Show for owners, hide for others */}
        <Tabs.Screen
          name="photography"
          options={{
            title: "Boosts",
            tabBarIcon: ({ focused }) => (
              <TabIcon Icon={RocketIcon} focused={focused} size={24} />
            ),
            href: stableIsOwner ? undefined : null,
          }}
        />

        {/* Add Property - Show for owners, hide for others */}
        <Tabs.Screen
          name="add-property"
          options={{
            title: "",
            tabBarIcon: () => null,
            tabBarButton: stableIsOwner
              ? (props) => (
                  <View
                    style={{ alignItems: "center", justifyContent: "center" }}
                  >
                    <AddPropertyButton
                      onPress={() => {
                        if (props.onPress) {
                          props.onPress({
                            type: "press",
                            nativeEvent: {},
                          } as any);
                        }
                      }}
                    />
                  </View>
                )
              : () => null,
          }}
        />

        {/* My Properties - Show for owners, hide for others */}
        <Tabs.Screen
          name="my-properties"
          options={{
            title: "Biens",
            tabBarIcon: ({ focused }) => (
              <TabIcon Icon={BuildingsIcon} focused={focused} size={24} />
            ),
            href: stableIsOwner ? undefined : null,
          }}
        />

        {/* Profile - Show different based on user type */}
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profil",
            tabBarIcon: ({ focused }) => (
              <TabIcon Icon={UserIcon} focused={focused} size={24} />
            ),
            href: stableIsGuest ? null : undefined, // Hide from tab bar for guests (handled in CustomTabBar)
          }}
        />
      </Tabs>
    </View>
  );
}
