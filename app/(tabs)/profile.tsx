import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { ChevronRight, LogOut, MapPin } from "lucide-react-native";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserType } from "../hooks/useUserType";

export default function ProfileScreen() {
  const router = useRouter();
  const { isAgent } = useUserType();
  const { user, isLoaded } = useUser();

  // Show loading state while user data is being fetched
  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="flex-1 justify-center items-center">
          <Text className="text-base text-gray-500 font-urbanist">
            Chargement...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if no user data
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="flex-1 justify-center items-center">
          <Text className="text-base text-gray-500 font-urbanist">
            Erreur de chargement du profil
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const menuItems = [
    isAgent
      ? {
          label: "Mes propriétés",
          onPress: () => router.push("/(tabs)/my-properties"),
        }
      : {
          label: "Mes favoris",
          onPress: () => router.push("/(tabs)/favoris"),
        },
    { label: "Paramètres", onPress: () => {} },
    { label: "Aide & Support", onPress: () => {} },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Profile Header */}
        <View className="bg-white pb-8">
          <View className="items-center pt-8 pb-6">
            <View
              className="w-28 h-28 rounded-full mb-5 items-center justify-center"
              style={{
                borderWidth: 3,
                borderColor: "#E48C26",
                backgroundColor: "#FFF5EB",
              }}
            >
              <Image
                source={
                  user?.imageUrl
                    ? { uri: user.imageUrl }
                    : require("../../assets/images/icon.png")
                }
                className="w-24 h-24 rounded-full"
              />
            </View>
            <Text className="text-2xl font-bold text-figma-grey-900 mb-1.5 font-urbanist">
              {user?.fullName || user?.firstName || "Utilisateur"}
            </Text>
            <Text className="text-sm text-figma-grey-600 mb-4 font-urbanist">
              {user?.primaryEmailAddress?.emailAddress ||
                "Email non disponible"}
            </Text>
            <View
              className="flex-row items-center px-4 py-2 rounded-full border"
              style={{
                backgroundColor: "#FFF5EB",
                borderColor: "rgba(228, 140, 38, 0.2)",
              }}
            >
              <MapPin size={14} color="#E48C26" />
              <Text className="ml-1.5 text-sm text-figma-grey-700 font-urbanist">
                {String(
                  user?.unsafeMetadata?.location || "Ouagadougou, Burkina Faso"
                )}
              </Text>
            </View>
          </View>

          {/* Stats Section */}
          <View className="px-4">
            <View
              className="rounded-2xl p-5 border"
              style={{
                backgroundColor: "#FFF5EB",
                borderColor: "rgba(228, 140, 38, 0.1)",
              }}
            >
              {isAgent ? (
                <View className="flex-row justify-between">
                  <View className="flex-1">
                    <Text className="text-3xl font-bold text-figma-primary mb-1 font-urbanist">
                      7
                    </Text>
                    <Text className="text-xs text-figma-grey-600 font-urbanist">
                      Propriétés actives
                    </Text>
                  </View>
                  <View
                    className="w-px mx-4"
                    style={{ backgroundColor: "rgba(228, 140, 38, 0.2)" }}
                  />
                  <View className="flex-1">
                    <Text className="text-3xl font-bold text-figma-primary mb-1 font-urbanist">
                      128
                    </Text>
                    <Text className="text-xs text-figma-grey-600 font-urbanist">
                      Vues ce mois
                    </Text>
                  </View>
                  <View
                    className="w-px mx-4"
                    style={{ backgroundColor: "rgba(228, 140, 38, 0.2)" }}
                  />
                  <View className="flex-1">
                    <Text className="text-3xl font-bold text-figma-primary mb-1 font-urbanist">
                      2
                    </Text>
                    <Text className="text-xs text-figma-grey-600 font-urbanist">
                      En attente
                    </Text>
                  </View>
                </View>
              ) : (
                <View className="flex-row justify-between">
                  <View className="flex-1">
                    <Text className="text-3xl font-bold text-figma-primary mb-1 font-urbanist">
                      6
                    </Text>
                    <Text className="text-xs text-figma-grey-600 font-urbanist">
                      Favoris sauvegardés
                    </Text>
                  </View>
                  <View
                    className="w-px mx-4"
                    style={{ backgroundColor: "rgba(228, 140, 38, 0.2)" }}
                  />
                  <View className="flex-1">
                    <Text className="text-3xl font-bold text-figma-primary mb-1 font-urbanist">
                      4.8
                    </Text>
                    <Text className="text-xs text-figma-grey-600 font-urbanist">
                      Note moyenne
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-4 pt-6">
          <View className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                className={`flex-row items-center justify-between py-4 px-5 ${
                  index !== menuItems.length - 1
                    ? "border-b border-figma-border"
                    : ""
                }`}
                style={
                  index === 0
                    ? { backgroundColor: "rgba(255, 245, 235, 0.3)" }
                    : undefined
                }
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-base font-urbanist ${
                    index === 0
                      ? "text-figma-primary font-semibold"
                      : "text-figma-grey-900"
                  }`}
                >
                  {item.label}
                </Text>
                <ChevronRight
                  size={18}
                  color={index === 0 ? "#E48C26" : "#9E9E9E"}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            className="flex-row items-center justify-center py-4 mt-4 bg-white rounded-2xl border border-red-100"
            activeOpacity={0.7}
          >
            <LogOut size={18} color="#DC2626" />
            <Text className="ml-2 text-base font-medium text-red-600 font-urbanist">
              Se déconnecter
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
