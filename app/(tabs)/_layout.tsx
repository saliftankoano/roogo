import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { Tabs, usePathname } from "expo-router";
import { Building2, Heart, Home, Plus, User } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Animated, Platform, TouchableOpacity, View } from "react-native";
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
    <Home size={size} color={focused ? ACTIVE_COLOR : INACTIVE_COLOR} />
  </IconWrapper>
);

const HeartIcon = ({ focused, size }: IconRendererProps) => (
  <IconWrapper focused={focused}>
    <Heart size={size} color={focused ? ACTIVE_COLOR : INACTIVE_COLOR} />
  </IconWrapper>
);

const UserIcon = ({ focused, size }: IconRendererProps) => (
  <IconWrapper focused={focused}>
    <User size={size} color={focused ? ACTIVE_COLOR : INACTIVE_COLOR} />
  </IconWrapper>
);

const BuildingIcon = ({ focused, size }: IconRendererProps) => (
  <IconWrapper focused={focused}>
    <Building2 size={size} color={focused ? ACTIVE_COLOR : INACTIVE_COLOR} />
  </IconWrapper>
);

const AddPropertyButton = ({ onPress }: { onPress?: () => void }) => (
  <TouchableOpacity
    onPress={() => onPress?.()}
    style={{
      backgroundColor: ACTIVE_COLOR,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      bottom: 35,
      shadowColor: ACTIVE_COLOR,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    }}
  >
    <Plus size={24} color="#FFFFFF" />
  </TouchableOpacity>
);

export default function TabLayout() {
  const pathname = usePathname();
  const isDetailsPage = pathname.includes("/details");
  const { isAgent } = useUserType();

  const commonTabBarStyle = {
    backgroundColor: "#FFFFFF",
    height: 85,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 28 : 24,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 10,
    // Add a subtle border for visual separation
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
                BuildingIcon({ focused, size: 24 }),
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
