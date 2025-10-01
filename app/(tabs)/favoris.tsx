import { Heart, MapPin } from "lucide-react-native";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FavorisScreen() {
  const favoriteProperties = [
    {
      id: 1,
      title: "Appartements Modernes",
      price: "758.000",
      location: "Ouagadougou",
      bedrooms: 3,
      bathrooms: 2,
      area: "120",
      parking: 1,
      category: "Louer",
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
      category: "Acheter",
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
      category: "Acheter",
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
              <View className="bg-white rounded-2xl overflow-hidden border border-gray-200 pb-2">
                {/* Image Section */}
                <View className="relative">
                  <Image
                    source={property.image}
                    className="w-full h-[200px]"
                    resizeMode="cover"
                  />
                  {/* Property Category Tag */}
                  <View
                    className={`absolute top-3 left-3 ${property.category === "Louer" ? "bg-blue-500" : "bg-green-500"} px-3 py-1 rounded-full`}
                  >
                    <Text className="text-white text-xs font-semibold">
                      {property.category === "Louer" ? "À Louer" : "À Vendre"}
                    </Text>
                  </View>
                  {/* Heart Icon */}
                  <TouchableOpacity className="absolute top-3 right-3 bg-gray-900/50 p-2.5 rounded-full">
                    <Heart
                      size={24}
                      color="#FF4B4B"
                      strokeWidth={2.5}
                      fill="#FF4B4B"
                    />
                  </TouchableOpacity>
                </View>

                {/* Content Section */}
                <View className="p-4 bg-white">
                  {/* Location and Price Row */}
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <MapPin size={16} color="#6B7280" />
                      <Text className="ml-1 text-gray-600 text-sm">
                        {property.location}
                      </Text>
                    </View>
                    <Text className="text-green-600 text-lg font-bold">
                      {property.price} CFA
                      {property.period ? `/${property.period}` : ""}
                    </Text>
                  </View>

                  {/* Property Details Row */}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center space-x-3">
                      <Text className="text-gray-700 text-sm font-medium">
                        {property.bedrooms} chambres
                      </Text>
                      <Text className="text-gray-400 text-sm"> | </Text>
                      <Text className="text-gray-700 text-sm font-medium">
                        {property.bathrooms} salles de bain(s)
                      </Text>
                      <Text className="text-gray-400 text-sm"> | </Text>
                      <Text className="text-gray-700 text-sm font-medium">
                        {property.area} m²
                      </Text>
                      {property.parking && (
                        <>
                          <Text className="text-gray-400 text-sm"> | </Text>
                          <Text className="text-gray-700 text-sm font-medium">
                            {property.parking}{" "}
                            {property.parking === 1 ? "Véhicule" : "Véhicules"}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>

                  {/* Action Buttons */}
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
