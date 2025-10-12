import { router } from "expo-router";
import { Filter, Plus, Search } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import {
  Alert,
  Animated,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyCard from "../components/PropertyCard";
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
  const [properties, setProperties] = useState(mockProperties);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"price" | "date" | "views">("date");
  const scrollY = useRef(new Animated.Value(0)).current;

  // Filter and sort properties
  const filteredProperties = properties
    .filter((property) => {
      const matchesSearch =
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        !selectedStatus || property.status === selectedStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return (
            parseInt(a.price.replace(/[^0-9]/g, "")) -
            parseInt(b.price.replace(/[^0-9]/g, ""))
          );
        case "views":
          return (b.views || 0) - (a.views || 0);
        case "date":
        default:
          return b.id - a.id; // Using id as proxy for date
      }
    });

  const handleEdit = (propertyId: number) => {
    // Navigate to edit property screen
    router.push({
      pathname: "/(tabs)/add-property",
      params: { id: propertyId },
    });
  };

  const handleDelete = (propertyId: number) => {
    Alert.alert(
      "Supprimer la propriété",
      "Êtes-vous sûr de vouloir supprimer cette propriété ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            // Remove property from state
            setProperties((prev) => prev.filter((p) => p.id !== propertyId));
          },
        },
      ]
    );
  };

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
        {/* Header Title */}
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              Mes Propriétés
            </Text>
            <Text className="text-gray-600 mt-1">
              Gérez vos annonces immobilières
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/add-property")}
            className="bg-blue-500 p-3 rounded-full"
          >
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <View className="flex-row justify-between mt-6 mb-2">
          <View className="bg-green-50 px-4 py-3 rounded-xl flex-1 mr-2">
            <Text className="text-green-700 text-xs font-medium">Actives</Text>
            <Text className="text-green-800 text-xl font-bold">
              {properties.filter((p) => p.status === "active").length}
            </Text>
          </View>
          <View className="bg-yellow-50 px-4 py-3 rounded-xl flex-1 mx-2">
            <Text className="text-yellow-700 text-xs font-medium">
              En attente
            </Text>
            <Text className="text-yellow-800 text-xl font-bold">
              {properties.filter((p) => p.status === "pending").length}
            </Text>
          </View>
          <View className="bg-blue-50 px-4 py-3 rounded-xl flex-1 ml-2">
            <Text className="text-blue-700 text-xs font-medium">Vendues</Text>
            <Text className="text-blue-800 text-xl font-bold">
              {properties.filter((p) => p.status === "sold").length}
            </Text>
          </View>
        </View>

        {/* Search and Filter Bar */}
        <View className="flex-row mt-4">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 py-2 mr-2">
            <Search size={20} color="#6B7280" />
            <TextInput
              placeholder="Rechercher une propriété..."
              placeholderTextColor="#6B7280"
              className="flex-1 ml-2 text-gray-700"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            className={`p-2 rounded-xl ${showFilters ? "bg-blue-500" : "bg-gray-100"}`}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={24} color={showFilters ? "white" : "#6B7280"} />
          </TouchableOpacity>
        </View>

        {/* Filter Options */}
        {showFilters && (
          <View className="mt-4 p-4 bg-gray-50 rounded-xl">
            <Text className="text-gray-700 font-medium mb-3">
              Filtrer par statut
            </Text>
            <View className="flex-row flex-wrap -m-1">
              {["active", "pending", "sold"].map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() =>
                    setSelectedStatus(selectedStatus === status ? null : status)
                  }
                  className={`m-1 px-4 py-2 rounded-full ${
                    selectedStatus === status ? "bg-blue-500" : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={
                      selectedStatus === status ? "text-white" : "text-gray-700"
                    }
                  >
                    {getStatusText(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-gray-700 font-medium mt-4 mb-3">
              Trier par
            </Text>
            <View className="flex-row flex-wrap -m-1">
              {[
                { id: "date", label: "Date" },
                { id: "price", label: "Prix" },
                { id: "views", label: "Vues" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() =>
                    setSortBy(option.id as "date" | "price" | "views")
                  }
                  className={`m-1 px-4 py-2 rounded-full ${
                    sortBy === option.id ? "bg-blue-500" : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={
                      sortBy === option.id ? "text-white" : "text-gray-700"
                    }
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
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
        <View className="px-4 py-2">
          {/* Properties Grid */}
          <View className="flex-row flex-wrap -mx-2">
            {filteredProperties.map((property) => (
              <View key={property.id} className="w-full px-2 mb-4">
                <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <PropertyCard
                    property={{
                      ...property,
                      category:
                        property.type === "Location" ? "Louer" : "Acheter",
                      parking: 1, // Default value since it's required
                    }}
                    showStats={true}
                    showActions={true}
                    onEdit={() => handleEdit(property.id)}
                    onDelete={() => handleDelete(property.id)}
                  />
                  {/* Status Badge */}
                  <View
                    className={`absolute top-2 right-20 px-3 py-1 rounded-full shadow-sm ${getStatusColor(
                      property.status
                    )}`}
                  >
                    <Text className="text-xs font-medium">
                      {getStatusText(property.status)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
