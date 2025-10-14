import { useUser } from "@clerk/clerk-expo";
import {
  Building,
  ChevronRight,
  Clock,
  Eye,
  Heart,
  HelpCircle,
  KeyRound,
  LogOut,
  MapPin,
  Settings,
  Star,
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
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if no user data
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">
            Erreur de chargement du profil
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const menuItems = [
    isAgent
      ? { label: "Gérer mes propriétés", icon: MapPin, color: "#3B82F6" }
      : { label: "Mes favoris", icon: Heart, color: "#EF4444" },
    { label: "Paramètres", icon: Settings, color: "#6B7280" },
    { label: "Aide & Support", icon: HelpCircle, color: "#10B981" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* Profile Header */}
        <View className="px-4 pt-6">
          <View className="items-center mb-4">
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

          {/* Stats Grid */}
          <View className="mb-4">
            <Text className="text-xl font-semibold text-gray-900 mb-4">
              {isAgent ? "Aperçu de mes propriétés" : "Mon activité"}
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {isAgent ? (
                <>
                  {/* Agent Stats */}
                  <View className="flex-1 min-w-[48%] bg-blue-50 rounded-2xl p-4">
                    <View className="flex-row items-center mb-2">
                      <KeyRound size={20} color="#3B82F6" />
                      <Text className="ml-2 text-base font-semibold text-gray-900">
                        À Vendre
                      </Text>
                    </View>
                    <Text className="text-2xl font-bold text-gray-900">4</Text>
                    <Text className="text-sm text-gray-600">Propriétés</Text>
                  </View>

                  <View className="flex-1 min-w-[48%] bg-green-50 rounded-2xl p-4">
                    <View className="flex-row items-center mb-2">
                      <Building size={20} color="#10B981" />
                      <Text className="ml-2 text-base font-semibold text-gray-900">
                        À Louer
                      </Text>
                    </View>
                    <Text className="text-2xl font-bold text-gray-900">3</Text>
                    <Text className="text-sm text-gray-600">Propriétés</Text>
                  </View>

                  <View className="flex-1 min-w-[48%] bg-purple-50 rounded-2xl p-4">
                    <View className="flex-row items-center mb-2">
                      <Clock size={20} color="#8B5CF6" />
                      <Text className="ml-2 text-base font-semibold text-gray-900">
                        En attente
                      </Text>
                    </View>
                    <Text className="text-2xl font-bold text-gray-900">2</Text>
                    <Text className="text-sm text-gray-600">À valider</Text>
                  </View>

                  <View className="flex-1 min-w-[48%] bg-orange-50 rounded-2xl p-4">
                    <View className="flex-row items-center mb-2">
                      <Eye size={20} color="#F59E0B" />
                      <Text className="ml-2 text-base font-semibold text-gray-900">
                        Vues
                      </Text>
                    </View>
                    <Text className="text-2xl font-bold text-gray-900">
                      128
                    </Text>
                    <Text className="text-sm text-gray-600">Ce mois</Text>
                  </View>
                </>
              ) : (
                <>
                  {/* Regular User Stats */}
                  <View className="flex-1 min-w-[48%] bg-red-50 rounded-2xl p-4">
                    <View className="flex-row items-center mb-2">
                      <Heart size={20} color="#EF4444" />
                      <Text className="ml-2 text-base font-semibold text-gray-900">
                        Favoris
                      </Text>
                    </View>
                    <Text className="text-2xl font-bold text-gray-900">6</Text>
                    <Text className="text-sm text-gray-600">
                      Propriétés sauvegardées
                    </Text>
                  </View>

                  <View className="flex-1 min-w-[48%] bg-yellow-50 rounded-2xl p-4">
                    <View className="flex-row items-center mb-2">
                      <Star size={20} color="#F59E0B" fill="#F59E0B" />
                      <Text className="ml-2 text-base font-semibold text-gray-900">
                        Avis
                      </Text>
                    </View>
                    <Text className="text-2xl font-bold text-gray-900">
                      4.8
                    </Text>
                    <Text className="text-sm text-gray-600">Note moyenne</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Menu Items */}
          <View className="space-y-3">
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
          <TouchableOpacity className="flex-row items-center justify-center py-4 mt-4 bg-red-50 rounded-xl border border-red-100">
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
