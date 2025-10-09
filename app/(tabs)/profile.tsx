import { useUser } from "@clerk/clerk-expo";
import {
  Bell,
  ChevronRight,
  Heart,
  HelpCircle,
  Home,
  LogOut,
  MapPin,
  MessageCircle,
  Settings,
  Star,
  TrendingUp,
  Users,
} from "lucide-react-native";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserType } from "../hooks/useUserType";

export default function ProfileScreen() {
  const { isAgent } = useUserType();
  const { user, isLoaded } = useUser();

  // Show loading state while user data is being fetched
  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if no user data
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">
            Erreur de chargement du profil
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const regularUserStats = [
    { label: "Propriétés vues", value: "24", icon: Home },
    { label: "Favoris", value: "8", icon: Heart },
    { label: "Messages", value: "12", icon: MessageCircle },
  ];

  const agentStats = [
    { label: "Propriétés vendues", value: "15", icon: TrendingUp },
    { label: "Leads actifs", value: "8", icon: Users },
    { label: "Messages", value: "12", icon: MessageCircle },
  ];

  const profileStats = isAgent ? agentStats : regularUserStats;

  const regularUserMenuItems = [
    { label: "Mes favoris", icon: Heart, color: "#EF4444" },
    { label: "Notifications", icon: Bell, color: "#F59E0B" },
    { label: "Paramètres", icon: Settings, color: "#6B7280" },
    { label: "Aide & Support", icon: HelpCircle, color: "#10B981" },
  ];

  const agentMenuItems = [
    { label: "Mes leads", icon: Users, color: "#10B981" },
    { label: "Notifications", icon: Bell, color: "#F59E0B" },
    { label: "Paramètres", icon: Settings, color: "#6B7280" },
    { label: "Aide & Support", icon: HelpCircle, color: "#10B981" },
  ];

  const menuItems = isAgent ? agentMenuItems : regularUserMenuItems;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="px-4 py-6">
          <View className="items-center mb-6">
            <Image
              source={
                user?.imageUrl
                  ? { uri: user.imageUrl }
                  : require("../../assets/images/icon.png")
              }
              className="w-20 h-20 rounded-full mb-4"
            />
            <Text className="text-2xl font-bold text-gray-900 mb-1">
              {user?.fullName || user?.firstName || "Utilisateur"}
            </Text>
            <Text className="text-gray-600 mb-2">
              {user?.primaryEmailAddress?.emailAddress ||
                "Email non disponible"}
            </Text>
            <View className="flex-row items-center">
              <MapPin size={16} color="#6B7280" />
              <Text className="ml-1 text-gray-600">
                {String(
                  user?.unsafeMetadata?.location || "Ouagadougou, Burkina Faso"
                )}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-6">
            <View className="flex-row justify-around">
              {profileStats.map((stat, index) => (
                <View key={index} className="items-center">
                  <stat.icon size={24} color="#3B82F6" />
                  <Text className="text-2xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Rating for regular users, Leads for agents */}
          {!isAgent ? (
            <View className="bg-yellow-50 rounded-2xl p-4 mb-6">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Star size={20} color="#F59E0B" fill="#F59E0B" />
                  <Text className="ml-2 text-lg font-semibold text-gray-900">
                    Évaluation
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-2xl font-bold text-gray-900 mr-2">
                    4.8
                  </Text>
                  <ChevronRight size={20} color="#6B7280" />
                </View>
              </View>
              <Text className="text-gray-600 mt-2">
                Basé sur 15 avis clients
              </Text>
            </View>
          ) : (
            <View className="bg-blue-50 rounded-2xl p-4 mb-6">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Users size={20} color="#3B82F6" />
                  <Text className="ml-2 text-lg font-semibold text-gray-900">
                    Mes Leads
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-2xl font-bold text-gray-900 mr-2">
                    8
                  </Text>
                  <ChevronRight size={20} color="#6B7280" />
                </View>
              </View>
              <Text className="text-gray-600 mt-2">Leads actifs en cours</Text>
            </View>
          )}

          {/* Menu Items */}
          <View className="space-y-2">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                className="flex-row items-center justify-between py-4 px-4 bg-white rounded-xl border border-gray-100"
              >
                <View className="flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <item.icon size={20} color={item.color} />
                  </View>
                  <Text className="text-lg font-medium text-gray-900">
                    {item.label}
                  </Text>
                </View>
                <ChevronRight size={20} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity className="flex-row items-center justify-center py-4 mt-6 bg-red-50 rounded-xl border border-red-100">
            <LogOut size={20} color="#EF4444" />
            <Text className="ml-2 text-lg font-medium text-red-600">
              Se déconnecter
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
