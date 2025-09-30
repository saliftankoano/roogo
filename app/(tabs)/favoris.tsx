import { Heart, MapPin, Star } from "lucide-react-native";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function FavorisScreen() {
  const favoriteProperties = [
    {
      id: 1,
      title: "Appartements Modernes",
      description: "Un endroit pour ralentir",
      price: "$758.99",
      rating: 4.5,
      location: "Ouagadougou",
      image: require("../../assets/images/white_villa.jpg"),
    },
    {
      id: 2,
      title: "Villas Familiales",
      description: "Zone Suburbaine",
      price: "$950.99",
      rating: 4.8,
      location: "Bobo-Dioulasso",
      image: require("../../assets/images/white_villa_bg.jpg"),
    },
    {
      id: 3,
      title: "Maison de Luxe",
      description: "Centre-ville",
      price: "$1200.00",
      rating: 4.9,
      location: "Ouagadougou",
      image: require("../../assets/images/logo_160.png"),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6">
          Mes Favoris
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {favoriteProperties.map((property) => (
            <View key={property.id} className="mb-4">
              <View className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <Image
                  source={property.image}
                  className="w-full h-48"
                  resizeMode="cover"
                />
                <View className="p-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-lg font-bold text-gray-900 flex-1">
                      {property.title}
                    </Text>
                    <TouchableOpacity className="p-2">
                      <Heart size={20} color="#EF4444" fill="#EF4444" />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row items-center mb-2">
                    <MapPin size={16} color="#6B7280" />
                    <Text className="ml-1 text-gray-600">
                      {property.location}
                    </Text>
                  </View>

                  <Text className="text-gray-600 mb-3">
                    {property.description}
                  </Text>

                  <View className="flex-row items-center justify-between">
                    <Text className="text-xl font-bold text-blue-600">
                      {property.price}
                    </Text>
                    <View className="flex-row items-center">
                      <Star size={16} color="#F59E0B" fill="#F59E0B" />
                      <Text className="ml-1 text-gray-600">
                        {property.rating}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row mt-4">
                    <TouchableOpacity className="flex-1 bg-blue-600 py-3 px-4 rounded-lg mr-2">
                      <Text className="text-white font-semibold text-center">
                        Voir les détails
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-gray-200 py-3 px-4 rounded-lg">
                      <Text className="text-gray-700 font-semibold text-center">
                        Supprimer
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
