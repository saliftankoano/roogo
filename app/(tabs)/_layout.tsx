import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { Tabs, usePathname } from "expo-router";
import { Heart, Plus, User } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Animated, Platform, TouchableOpacity, View } from "react-native";
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
        padding: 8,
        borderRadius: 12,
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

const HeartIcon = ({ focused, size }: IconRendererProps) => (
  <IconWrapper focused={focused}>
    <Heart size={size} color={focused ? ACTIVE_COLOR : INACTIVE_COLOR} />
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
  const { isAgent } = useUserType();

  const commonTabBarStyle = {
    backgroundColor: "#FFFFFF",
    height: 80,
    paddingHorizontal: 16,
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
    },
    tabBarIconStyle: {
      marginBottom: 0,
    },
    tabBarItemStyle: {
      paddingVertical: 0,
      paddingHorizontal: 0,
    },
    // Add smooth transitions
    tabBarHideOnKeyboard: true,
    headerShown: false,
  };

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
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: "Accueil",
            tabBarIcon: ({ focused, size }) => HomeIcon({ focused, size: 24 }),
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="favoris"
          options={{
            title: "Favoris",
            tabBarIcon: ({ focused, size }) => HeartIcon({ focused, size: 24 }),
            headerShown: false,
          }}
        />
        {isAgent && (
          <Tabs.Screen
            name="add-property"
            options={{
              title: "",
              tabBarButton: (props) => (
                <View style={{ alignItems: "center" }}>
                  <AddPropertyButton
                    onPress={() => {
                      if (props.onPress) {
                        // Pass a synthetic event to match the expected signature
                        props.onPress({
                          type: "press",
                          nativeEvent: {},
                        } as any);
                      }
                    }}
                  />
                </View>
              ),
              headerShown: false,
            }}
          />
        )}
        {isAgent && (
          <Tabs.Screen
            name="my-properties"
            options={{
              title: "Biens",
              tabBarIcon: ({ focused, size }) =>
                ModernHomeIcon({ focused, size: 24 }),
              headerShown: false,
            }}
          />
        )}
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profil",
            tabBarIcon: ({ focused, size }) => UserIcon({ focused, size: 24 }),
            headerShown: false,
          }}
        />
      </Tabs>
    </View>
  );
}
