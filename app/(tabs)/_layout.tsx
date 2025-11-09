import type {
  BottomTabBarProps,
  BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { router, Tabs, usePathname } from "expo-router";
import { Camera, Heart, Plus, User } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Animated, Platform, Text, TouchableOpacity, View } from "react-native";
import { Path, Svg } from "react-native-svg";
import { useUserType } from "../hooks/useUserType";

type IconRendererProps = {
  focused: boolean;
  size: number;
};

const ACTIVE_COLOR = "#0EA5E9"; // A modern blue color
const INACTIVE_COLOR = "#94A3B8";

const IconWrapper = ({
  children,
  focused,
}: {
  children: React.ReactNode;
  focused: boolean;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: focused ? 1.2 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scaleAnim]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        backgroundColor: focused ? `${ACTIVE_COLOR}15` : "transparent",
        padding: 6,
        borderRadius: 10,
        marginTop: 0,
      }}
    >
      {children}
    </Animated.View>
  );
};

const HomeIcon = ({ focused, size }: IconRendererProps) => (
  <IconWrapper focused={focused}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        stroke={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </Svg>
  </IconWrapper>
);

const CameraIcon = ({ focused, size }: IconRendererProps) => (
  <IconWrapper focused={focused}>
    <Camera size={size} color={focused ? ACTIVE_COLOR : INACTIVE_COLOR} />
  </IconWrapper>
);

const ModernHomeIcon = ({ focused, size }: IconRendererProps) => (
  <IconWrapper focused={focused}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        stroke={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
        d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819"
      />
    </Svg>
  </IconWrapper>
);

const UserIcon = ({ focused, size }: IconRendererProps) => (
  <IconWrapper focused={focused}>
    <User size={size} color={focused ? ACTIVE_COLOR : INACTIVE_COLOR} />
  </IconWrapper>
);

const HeartIcon = ({ focused, size }: IconRendererProps) => (
  <IconWrapper focused={focused}>
    <Heart size={size} color={focused ? ACTIVE_COLOR : INACTIVE_COLOR} />
  </IconWrapper>
);

const LoginIcon = ({ focused, size }: IconRendererProps) => (
  <IconWrapper focused={focused}>
    <View style={{ position: "relative" }}>
      <User size={size} color={focused ? ACTIVE_COLOR : "#FFFFFF"} />
      <View
        style={{
          position: "absolute",
          top: -2,
          right: -2,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: focused ? ACTIVE_COLOR : "#FFFFFF",
          borderWidth: 2,
          borderColor: "#FFFFFF",
        }}
      />
    </View>
  </IconWrapper>
);

const AddPropertyButton = ({ onPress }: { onPress?: () => void }) => (
  <TouchableOpacity
    onPress={() => onPress?.()}
    style={{
      backgroundColor: ACTIVE_COLOR,
      width: 48,
      height: 48,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: ACTIVE_COLOR,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
      marginTop: -4,
    }}
  >
    <Plus size={22} color="#FFFFFF" />
  </TouchableOpacity>
);

export default function TabLayout() {
  const pathname = usePathname();
  const isDetailsPage = pathname.includes("/details");
  const { isOwner, isRenter, isGuest, isLoaded } = useUserType();

  const commonTabBarStyle = {
    backgroundColor: "#FFFFFF",
    height: 80,
    paddingHorizontal: isGuest ? 0 : 16,
    paddingBottom: Platform.OS === "ios" ? 24 : 20,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 8,
    borderTopColor: "rgba(229, 231, 235, 0.5)",
    borderTopWidth: 1,
  };

  // Custom tab bar for guests to center tabs
  const CustomTabBar = (props: BottomTabBarProps) => {
    if (isGuest) {
      return (
        <View
          style={{
            backgroundColor: "#FFFFFF",
            height: 80,
            paddingTop: 16,
            paddingBottom: Platform.OS === "ios" ? 20 : 16,
            paddingHorizontal: 16,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.08,
            shadowRadius: 3,
            elevation: 8,
            borderTopColor: "rgba(229, 231, 235, 0.5)",
            borderTopWidth: 1,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
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

            if (route.name === "profile" && isGuest) {
              return (
                <View
                  key={route.key}
                  style={{
                    flex: 0,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 12,
                    marginTop: 0,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      router.push("/(auth)/sign-in");
                    }}
                    style={{
                      backgroundColor: ACTIVE_COLOR,
                      paddingHorizontal: 24,
                      paddingVertical: 10,
                      borderRadius: 24,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      shadowColor: ACTIVE_COLOR,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                    activeOpacity={0.8}
                  >
                    <User size={20} color="#FFFFFF" />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        marginLeft: 6,
                        color: "#FFFFFF",
                      }}
                    >
                      Rejoindre
                    </Text>
                  </TouchableOpacity>
                </View>
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
                    flex: 0,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 12,
                    marginTop: 18,
                  }}
                >
                  {options.tabBarIcon &&
                    options.tabBarIcon({
                      focused: isFocused,
                      color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR,
                      size: 20,
                    })}
                  {(options.title ||
                    (options.tabBarLabel &&
                      typeof options.tabBarLabel === "string")) && (
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        marginTop: 4,
                        color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR,
                      }}
                    >
                      {options.title ||
                        (typeof options.tabBarLabel === "string"
                          ? options.tabBarLabel
                          : "")}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            }

            return null;
          })}
        </View>
      );
    }

    return <BottomTabBar {...props} />;
  };

  const commonScreenOptions: BottomTabNavigationOptions = {
    tabBarActiveTintColor: ACTIVE_COLOR,
    tabBarInactiveTintColor: INACTIVE_COLOR,
    tabBarStyle: isDetailsPage
      ? { display: "none" as const }
      : commonTabBarStyle,
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: "600" as const,
      marginTop: 4,
      flexShrink: 0, // Prevent text from shrinking
      flexWrap: "nowrap", // Prevent wrapping
    },
    tabBarIconStyle: {
      marginBottom: 0,
    },
    tabBarItemStyle: {
      paddingVertical: 0,
      paddingHorizontal: isGuest ? 12 : 0, // Add spacing between guest tabs
      flex: isGuest ? 0 : 1, // Don't flex for guests, let content determine width
      minWidth: isGuest ? undefined : 0, // Allow natural width for guests
    },
    // Add smooth transitions
    tabBarHideOnKeyboard: true,
    headerShown: false,
  };

  // Don't render tabs until auth state is loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          ...commonScreenOptions,
          // Add smooth transitions
          tabBarHideOnKeyboard: true,
          headerShown: false,
          animation: "shift",
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        {/* Home - Always visible */}
        <Tabs.Screen
          name="(home)"
          options={{
            title: "Accueil",
            tabBarIcon: ({ focused, size }) => HomeIcon({ focused, size: 24 }),
            headerShown: false,
            ...(isGuest && {
              tabBarItemStyle: {
                paddingVertical: 0,
                paddingHorizontal: 0,
                flex: 0,
              },
            }),
          }}
        />

        {/* Favoris - Show for renters, hide for others */}
        <Tabs.Screen
          name="favoris"
          options={{
            title: "Favoris",
            tabBarIcon: ({ focused, size }) => HeartIcon({ focused, size: 24 }),
            headerShown: false,
            href: isRenter ? undefined : null,
          }}
        />

        {/* Photography - Show for owners, hide for others */}
        <Tabs.Screen
          name="photography"
          options={{
            title: "Photos",
            tabBarIcon: ({ focused, size }) =>
              CameraIcon({ focused, size: 24 }),
            headerShown: false,
            href: isOwner ? undefined : null,
          }}
        />

        {/* Add Property - Show for owners, hide for others */}
        <Tabs.Screen
          name="add-property"
          options={{
            title: "",
            tabBarIcon: ({ focused, size }) => null,
            tabBarButton: isOwner
              ? (props) => (
                  <View style={{ alignItems: "center" }}>
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
            headerShown: false,
          }}
        />

        {/* My Properties - Show for owners, hide for others */}
        <Tabs.Screen
          name="my-properties"
          options={{
            title: "Biens",
            tabBarIcon: ({ focused, size }) =>
              ModernHomeIcon({ focused, size: 24 }),
            headerShown: false,
            href: isOwner ? undefined : null,
          }}
        />

        {/* Profile - Show different based on user type */}
        <Tabs.Screen
          name="profile"
          options={{
            title: isGuest ? "Rejoindre" : "Profil",
            tabBarIcon: ({ focused, size }) =>
              isGuest
                ? LoginIcon({ focused, size: 24 })
                : UserIcon({ focused, size: 24 }),
            headerShown: false,
            ...(isGuest
              ? {
                  tabBarButton: (props) => (
                    <View
                      style={{
                        flex: 0,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          router.push("/(auth)/sign-in");
                        }}
                        style={{
                          backgroundColor: ACTIVE_COLOR,
                          paddingHorizontal: 24,
                          paddingVertical: 10,
                          borderRadius: 24,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          shadowColor: ACTIVE_COLOR,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          elevation: 4,
                        }}
                        activeOpacity={0.8}
                      >
                        <User size={20} color="#FFFFFF" />
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "700",
                            marginLeft: 6,
                            color: "#FFFFFF",
                          }}
                        >
                          Rejoindre
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ),
                }
              : {}),
          }}
        />
      </Tabs>
    </View>
  );
}
