import { Tabs, usePathname } from "expo-router";
import { Building2, Heart, Home, Plus, User } from "lucide-react-native";
import { useUserType } from "../hooks/useUserType";

type IconRendererProps = {
  focused: boolean;
  size: number;
};

const HomeIcon = ({ focused, size }: IconRendererProps) => (
  <Home size={size} color={focused ? "#111827" : "#9CA3AF"} />
);

const HeartIcon = ({ focused, size }: IconRendererProps) => (
  <Heart size={size} color={focused ? "#111827" : "#9CA3AF"} />
);

const UserIcon = ({ focused, size }: IconRendererProps) => (
  <User size={size} color={focused ? "#111827" : "#9CA3AF"} />
);

const PlusIcon = ({ focused, size }: IconRendererProps) => (
  <Plus size={size} color={focused ? "#111827" : "#9CA3AF"} />
);

const BuildingIcon = ({ focused, size }: IconRendererProps) => (
  <Building2 size={size} color={focused ? "#111827" : "#9CA3AF"} />
);

export default function TabLayout() {
  const pathname = usePathname();
  const isDetailsPage = pathname.includes("/details");
  const { isAgent } = useUserType();

  const commonTabBarStyle = {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    elevation: 8,
    height: 70,
    paddingTop: 0,
    paddingBottom: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
  };

  const commonScreenOptions = {
    tabBarActiveTintColor: "#111827",
    tabBarInactiveTintColor: "#6B7280",
    animation: "shift" as const,
    tabBarStyle: isDetailsPage
      ? { display: "none" as const }
      : commonTabBarStyle,
    tabBarLabelStyle: {
      fontSize: 10,
      fontWeight: "500" as const,
      marginTop: 2,
    },
    tabBarIconStyle: {
      marginBottom: -4,
      marginTop: -4,
    },
    tabBarItemStyle: {
      paddingVertical: 8,
      paddingHorizontal: 4,
      justifyContent: "flex-start" as const,
      alignItems: "center" as const,
    },
  };

  return (
    <Tabs screenOptions={commonScreenOptions}>
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Accueil",
          tabBarIcon: ({ focused, size }) => HomeIcon({ focused, size }),
          headerShown: false,
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
        name="add-property"
        options={{
          title: "Ajouter",
          tabBarIcon: ({ focused, size }) => PlusIcon({ focused, size }),
          headerShown: false,
          tabBarButton: isAgent ? undefined : () => null,
        }}
      />
      <Tabs.Screen
        name="my-properties"
        options={{
          title: "Biens",
          tabBarIcon: ({ focused, size }) => BuildingIcon({ focused, size }),
          headerShown: false,
          tabBarButton: isAgent ? undefined : () => null,
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
