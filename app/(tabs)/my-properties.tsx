import {
  Building2,
  Edit,
  Eye,
  Heart,
  MapPin,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react-native";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
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

  // Redirect non-agents to home
  if (!isAgent) {
    return (
      <SafeAreaView className="flex-1 bg-white">
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-6">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-2xl font-bold text-gray-900">
                Mes Propriétés
              </Text>
              <Text className="text-gray-600 mt-1">
                Gérez vos annonces immobilières
              </Text>
            </View>
            <TouchableOpacity className="bg-blue-600 rounded-full p-3">
              <Plus size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Stats Overview */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-6">
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-2xl font-bold text-gray-900">
                  {mockProperties.length}
                </Text>
                <Text className="text-sm text-gray-600">Total</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-green-600">
                  {mockProperties.filter((p) => p.status === "active").length}
                </Text>
                <Text className="text-sm text-gray-600">Actives</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-blue-600">
                  {mockProperties.reduce((sum, p) => sum + p.views, 0)}
                </Text>
                <Text className="text-sm text-gray-600">Vues</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-red-600">
                  {mockProperties.reduce((sum, p) => sum + p.favorites, 0)}
                </Text>
                <Text className="text-sm text-gray-600">Favoris</Text>
              </View>
            </View>
          </View>

          {/* Properties List */}
          <View className="space-y-4">
            {mockProperties.map((property) => (
              <View
                key={property.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                <View className="flex-row">
                  {/* Property Image */}
                  <Image
                    source={property.image}
                    className="w-32 h-32"
                    resizeMode="cover"
                  />

                  {/* Property Details */}
                  <View className="flex-1 p-4">
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-gray-900 mb-1">
                          {property.title}
                        </Text>
                        <View className="flex-row items-center mb-1">
                          <MapPin size={14} color="#6B7280" />
                          <Text className="ml-1 text-sm text-gray-600">
                            {property.location}
                          </Text>
                        </View>
                        <Text className="text-xl font-bold text-blue-600">
                          {property.price}
                        </Text>
                      </View>
                      <TouchableOpacity className="p-2">
                        <MoreVertical size={20} color="#6B7280" />
                      </TouchableOpacity>
                    </View>

                    {/* Property Info */}
                    <View className="flex-row items-center space-x-4 mb-3">
                      <View className="flex-row items-center">
                        <Building2 size={14} color="#6B7280" />
                        <Text className="ml-1 text-sm text-gray-600">
                          {property.bedrooms} ch.
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-sm text-gray-600">
                          {property.bathrooms} sdb.
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-sm text-gray-600">
                          {property.area}
                        </Text>
                      </View>
                    </View>

                    {/* Status and Actions */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center space-x-3">
                        <View
                          className={`px-3 py-1 rounded-full ${getStatusColor(
                            property.status
                          )}`}
                        >
                          <Text className="text-xs font-medium">
                            {getStatusText(property.status)}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Eye size={14} color="#6B7280" />
                          <Text className="ml-1 text-sm text-gray-600">
                            {property.views}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Heart size={14} color="#EF4444" />
                          <Text className="ml-1 text-sm text-gray-600">
                            {property.favorites}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center space-x-2">
                        <TouchableOpacity className="p-2 bg-blue-50 rounded-lg">
                          <Edit size={16} color="#3B82F6" />
                        </TouchableOpacity>
                        <TouchableOpacity className="p-2 bg-red-50 rounded-lg">
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Add Property Button */}
          <TouchableOpacity className="flex-row items-center justify-center py-4 mt-6 bg-blue-600 rounded-xl">
            <Plus size={20} color="#FFFFFF" />
            <Text className="ml-2 text-lg font-medium text-white">
              Ajouter une propriété
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
