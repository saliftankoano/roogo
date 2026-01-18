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

export default function TabLayout() {
  const pathname = usePathname();
  const isDetailsPage = pathname.includes("/details");
  const { isOwner, isAgent, isRenter, isGuest, isLoaded } = useUserType();

  // Track if we've ever loaded successfully to prevent blank flash on tab switches
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Use values from useUserType directly, but we can keep a ref for the very first load
  // to avoid jumping if needed. However, the current implementation was stuck.

  // Update hasLoadedOnce when isLoaded becomes true
  useEffect(() => {
    if (isLoaded && !hasLoadedOnce) {
      setHasLoadedOnce(true);
    }
  }, [isLoaded, hasLoadedOnce]);

  // Simplify: just use the values from useUserType.
  // The "jumping" should be handled by the loading state if necessary.
  const stableIsOwner = isOwner;
  const stableIsAgent = isAgent;
  const stableIsRenter = isRenter;
  const stableIsGuest = isGuest;

  const isOwnerOrAgent = stableIsOwner || stableIsAgent;

  const commonTabBarStyle = {
    backgroundColor: "#FFFFFF", // Pure white for everyone to avoid "stain" look
    position: "absolute" as const,
    bottom: Platform.OS === "ios" ? 32 : 24,
    left: stableIsRenter ? 80 : 20,
    right: stableIsRenter ? 80 : 20,
    height: stableIsRenter ? 64 : 72,
    borderRadius: stableIsRenter ? 32 : 36,
    paddingBottom: 0,
    paddingTop: 0,
    borderTopWidth: 0,
    // Reduced shadow aggressiveness, especially for floating bar
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4, 
    },
    shadowOpacity: stableIsRenter ? 0.1 : 0.2,
    shadowRadius: stableIsRenter ? 12 : 16,
    elevation: stableIsRenter ? 8 : 16,
    // Border for definition
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
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

    const containerStyle = {
      ...commonTabBarStyle,
      flexDirection: "row" as const,
      justifyContent: "space-between" as const, // Use space-between for better control
      alignItems: "center" as const,
      paddingHorizontal: stableIsRenter ? 24 : 12, // More horizontal breathing room for renters
    };

    return (
      <>
        {/* Floating Bar Container */}
        <View style={containerStyle as any}>
          {props.state.routes.map((route, index) => {
            const { options } = props.descriptors[route.key];
            const isFocused = props.state.index === index;
            
            // Explicitly filter visibility based on user type
            if (route.name === "favoris" && !stableIsRenter) return null;
            if (route.name === "photography" && !isOwnerOrAgent) return null;
            if (route.name === "add-property" && !isOwnerOrAgent) return null;
            if (route.name === "my-properties" && !isOwnerOrAgent) return null;
            if (route.name === "profile" && stableIsGuest) {
              // Guest Profile button is handled separately below
            } else if (stableIsGuest && route.name !== "(home)") {
              return null;
            }

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

            // Special handle for Guest Login Button
            if (route.name === "profile" && stableIsGuest) {
              return (
                <View 
                  key={route.key}
                  style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      router.push("/(auth)/sign-in");
                    }}
                    style={{
                      backgroundColor: tokens.colors.roogo.neutral[900],
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    activeOpacity={0.8}
                  >
                    <SignInIcon size={18} color="#FFFFFF" weight="bold" />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        marginLeft: 6,
                        color: "#FFFFFF",
                        fontFamily: "Urbanist-Bold",
                      }}
                    >
                      Se connecter
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }

            // Standard Tab Icon
            if (route.name === "add-property") {
              return (
                <TouchableOpacity
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  onPress={onPress}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: isFocused 
                        ? tokens.colors.roogo.primary[500] 
                        : tokens.colors.roogo.neutral[900],
                      justifyContent: "center",
                      alignItems: "center",
                      // Subtle shadow to give it presence without breaking the level
                      shadowColor: isFocused 
                        ? tokens.colors.roogo.primary[500] 
                        : "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    <PlusIcon size={28} color="#FFFFFF" weight="bold" />
                  </View>
                </TouchableOpacity>
              );
            }

            let IconComponent = HouseIcon;
            if (route.name === "favoris") IconComponent = HeartIcon;
            if (route.name === "photography") IconComponent = RocketIcon;
            if (route.name === "add-property") IconComponent = PlusIcon;
            if (route.name === "my-properties") IconComponent = BuildingsIcon;
            if (route.name === "profile") IconComponent = UserIcon;

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  paddingVertical: 8, // Increased hit area
                }}
              >
                <TabIcon Icon={IconComponent} focused={isFocused} size={26} />
              </TouchableOpacity>
            );
          })}
        </View>
      </>
    );
  };

  const commonScreenOptions: BottomTabNavigationOptions = {
    tabBarActiveTintColor: ACTIVE_COLOR,
    tabBarInactiveTintColor: INACTIVE_COLOR,
    tabBarStyle: {
      display: isDetailsPage ? "none" : "flex",
      position: "absolute",
      backgroundColor: "transparent",
      borderTopWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
    },
    tabBarShowLabel: false, // Hide labels for cleaner look
    tabBarItemStyle: {
      height: stableIsRenter ? 64 : 72,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 0,
      paddingTop: stableIsRenter ? 0 : 12, // Reduced padding for smaller bar
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
            href: isOwnerOrAgent ? undefined : null,
          }}
        />

        {/* Add Property - Show for owners, hide for others */}
        <Tabs.Screen
          name="add-property"
          options={{
            title: "Ajouter",
            tabBarIcon: ({ focused }) => (
              <TabIcon Icon={PlusIcon} focused={focused} size={24} />
            ),
            href: isOwnerOrAgent ? undefined : null,
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
            href: isOwnerOrAgent ? undefined : null,
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
