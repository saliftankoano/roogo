import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthPromptModal from "../components/AuthPromptModal";
import PropertyCard from "../components/PropertyCard";

export default function FavorisScreen() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [favoriteProperties, setFavoriteProperties] = useState([
    {
      id: 1,
      title: "Appartements Modernes",
      price: "758.000",
      location: "Ouagadougou",
      bedrooms: 3,
      bathrooms: 2,
      area: "120",
      parking: 1,
      category: "Louer" as const,
      period: "mois",
      image: require("../../assets/images/white_villa.jpg"),
    },
    {
      id: 2,
      title: "Villas Familiales",
      price: "950.000",
      location: "Bobo-Dioulasso",
      bedrooms: 4,
      bathrooms: 3,
      area: "180",
      parking: 2,
      category: "Acheter" as const,
      image: require("../../assets/images/white_villa_bg.jpg"),
    },
    {
      id: 3,
      title: "Maison de Luxe",
      price: "1.200.000",
      location: "Ouagadougou",
      bedrooms: 5,
      bathrooms: 4,
      area: "250",
      parking: 3,
      category: "Acheter" as const,
      image: require("../../assets/images/logo_160.png"),
    },
  ]);

  const handleRemoveFavorite = (propertyId: number) => {
    setFavoriteProperties((prev) => prev.filter((p) => p.id !== propertyId));
  };

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-base text-gray-500 font-urbanist">
            Chargement...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-xl font-bold text-gray-900 mb-4 text-center font-urbanist">
            Connectez-vous pour voir vos favoris
          </Text>
          <Text className="text-base text-gray-600 mb-6 text-center font-urbanist">
            Enregistrez vos propriétés favorites et accédez-y facilement
          </Text>
          <AuthPromptModal
            visible={true}
            onClose={() => router.back()}
            title="Voir vos favoris"
            description="Connectez-vous pour accéder à vos propriétés favorites"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6">
          Mes Favoris
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {favoriteProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={{
                ...property,
                views: undefined,
                favorites: undefined,
              }}
              isFavorite={true}
              onToggleFavorite={() => handleRemoveFavorite(property.id)}
              onPress={() =>
                router.push(`/(tabs)/(home)/details?id=${property.id}`)
              }
            />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
