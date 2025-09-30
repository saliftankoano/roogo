import { Tabs, usePathname } from "expo-router";
import { Heart, Home, MessageCircle, User } from "lucide-react-native";
import type { ComponentType } from "react";
import { View } from "react-native";

type IconRendererProps = {
  focused: boolean;
  size: number;
};

const createIcon = (
  IconComponent: ComponentType<{ size: number; color: string }>,
  displayName: string
) => {
  const IconRenderer = ({ focused, size }: IconRendererProps) => {
    const iconColor = focused ? "#FFFFFF" : "#1F2937";

    return (
      <View
        style={{
          alignItems: "center",
          backgroundColor: focused ? "#111827" : "#FFFFFF00",
          borderRadius: 18,
          borderWidth: focused ? 0 : 0,
          borderColor: "#E5E7EB",
          height: 44,
          justifyContent: "center",
          width: 48,
          transform: [{ scale: focused ? 1.05 : 1 }],
          opacity: focused ? 1 : 0.8,
        }}
      >
        <IconComponent size={size} color={iconColor} />
      </View>
    );
  };

  IconRenderer.displayName = displayName;

  return IconRenderer;
};

const HomeIcon = createIcon(Home, "HomeTabIcon");
const HeartIcon = createIcon(Heart, "HeartTabIcon");
const MessageIcon = createIcon(MessageCircle, "MessageTabIcon");
const UserIcon = createIcon(User, "UserTabIcon");

export default function TabLayout() {
  const pathname = usePathname();
  const isDetailsPage = pathname.includes("/details");

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#111827",
        tabBarInactiveTintColor: "#000000",
        animation: "shift",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          elevation: 0,
          height: 75,
          alignSelf: "center",
          width: "75%",
          bottom: 20,
          paddingTop: 10,
          paddingBottom: 5,
          position: "absolute",
          borderRadius: 999,
          shadowColor: "#0F172A",
          shadowOpacity: 0.12,
          shadowOffset: { width: 0, height: 12 },
          shadowRadius: 24,
          marginHorizontal: 50,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 6,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarItemStyle: {
          marginHorizontal: 2,
          paddingVertical: 0,
          paddingHorizontal: 2,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Accueil",
          tabBarIcon: ({ focused, size }) => HomeIcon({ focused, size }),
          headerShown: false,
          tabBarStyle: isDetailsPage
            ? { display: "none" }
            : {
                backgroundColor: "#FFFFFF",
                borderTopWidth: 0,
                elevation: 0,
                height: 75,
                alignSelf: "center",
                width: "75%",
                bottom: 20,
                paddingTop: 10,
                paddingBottom: 5,
                position: "absolute",
                borderRadius: 999,
                shadowColor: "#0F172A",
                shadowOpacity: 0.12,
                shadowOffset: { width: 0, height: 12 },
                shadowRadius: 24,
                marginHorizontal: 50,
              },
        }}
      />
      <Tabs.Screen
        name="favoris"
        options={{
          title: "Favoris",
          tabBarIcon: ({ focused, size }) => HeartIcon({ focused, size }),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ focused, size }) => MessageIcon({ focused, size }),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ focused, size }) => UserIcon({ focused, size }),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
