import {
  Building2,
  Edit,
  Eye,
  Heart,
  MapPin,
  Trash2,
} from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import {
  Animated,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserType } from "../hooks/useUserType";

// Mock data for agent properties
const mockProperties = [
  {
    id: 1,
    title: "Villa moderne à Ouagadougou",
    price: "45,000,000 FCFA",
    location: "Ouagadougou, Secteur 15",
    image: require("../../assets/images/white_villa.jpg"),
    status: "active",
    views: 156,
    favorites: 23,
    rating: 4.8,
    type: "Vente",
    bedrooms: 4,
    bathrooms: 3,
    area: "250 m²",
  },
  {
    id: 2,
    title: "Appartement 3 pièces",
    price: "150,000 FCFA/mois",
    location: "Ouagadougou, Secteur 12",
    image: require("../../assets/images/white_villa_bg.jpg"),
    status: "active",
    views: 89,
    favorites: 12,
    rating: 4.5,
    type: "Location",
    bedrooms: 3,
    bathrooms: 2,
    area: "120 m²",
  },
  {
    id: 3,
    title: "Maison familiale spacieuse",
    price: "35,000,000 FCFA",
    location: "Ouagadougou, Secteur 8",
    image: require("../../assets/images/white_villa.jpg"),
    status: "pending",
    views: 203,
    favorites: 45,
    rating: 4.9,
    type: "Vente",
    bedrooms: 5,
    bathrooms: 4,
    area: "300 m²",
  },
];

export default function MyPropertiesScreen() {
  const { isAgent } = useUserType();
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Redirect non-agents to home
  if (!isAgent) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">
            Accès réservé aux agents
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "sold":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Actif";
      case "pending":
        return "En attente";
      case "sold":
        return "Vendu";
      default:
        return "Inconnu";
    }
  };

  // Header opacity animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Animated Header */}
      <Animated.View
        style={{
          opacity: headerOpacity,
          backgroundColor: "#FFFFFF",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(229, 231, 235, 0.5)",
        }}
      >
        <Text className="text-2xl font-bold text-gray-900">Mes Propriétés</Text>
        <Text className="text-gray-600 mt-1">
          Gérez vos annonces immobilières
        </Text>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View className="p-4">
          {/* Properties List */}
          <View className="space-y-4">
            {mockProperties.map((property) => (
              <TouchableOpacity
                key={property.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
                activeOpacity={0.7}
              >
                {/* Property Image with Status Badge */}
                <View className="relative">
                  <Image
                    source={property.image}
                    className="w-full h-48"
                    resizeMode="cover"
                  />
                  <View
                    className={`absolute top-2 left-2 px-3 py-1 rounded-full ${getStatusColor(
                      property.status
                    )}`}
                  >
                    <Text className="text-xs font-medium">
                      {getStatusText(property.status)}
                    </Text>
                  </View>
                  <View className="absolute top-2 right-2 flex-row space-x-2">
                    <TouchableOpacity className="p-2 bg-white rounded-full">
                      <Edit size={16} color="#3B82F6" />
                    </TouchableOpacity>
                    <TouchableOpacity className="p-2 bg-white rounded-full">
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Property Details */}
                <View className="p-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-xl font-bold text-gray-900">
                      {property.title}
                    </Text>
                    <Text className="text-lg font-bold text-blue-600">
                      {property.price}
                    </Text>
                  </View>

                  <View className="flex-row items-center mb-3">
                    <MapPin size={16} color="#6B7280" />
                    <Text className="ml-1 text-gray-600">
                      {property.location}
                    </Text>
                  </View>

                  {/* Property Features */}
                  <View className="flex-row items-center justify-between py-3 border-t border-gray-100">
                    <View className="flex-row items-center">
                      <Building2 size={16} color="#6B7280" />
                      <Text className="ml-1 text-gray-600">
                        {property.bedrooms} ch. • {property.bathrooms} sdb. •{" "}
                        {property.area}
                      </Text>
                    </View>
                    <View className="flex-row items-center space-x-4">
                      <View className="flex-row items-center">
                        <Eye size={16} color="#6B7280" />
                        <Text className="ml-1 text-gray-600">
                          {property.views}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Heart size={16} color="#EF4444" />
                        <Text className="ml-1 text-gray-600">
                          {property.favorites}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
