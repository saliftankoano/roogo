import { useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Funnel } from "phosphor-react-native";
import { useCallback, useRef, useState } from "react";
import {
  Alert,
  Animated,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyCard from "../../components/PropertyCard";
import { useUserType } from "../../hooks/useUserType";
import { tokens } from "../../theme/tokens";

// Mock data for agent properties
const mockProperties = [
  {
    id: 1,
    title: "Villa moderne à Ouagadougou",
    price: "45000000",
    location: "Ouagadougou, Secteur 15",
    image: require("../../assets/images/white_villa.jpg"),
    status: "active",
    views: 156,
    favorites: 23,
    rating: 4.8,
    type: "Vente",
    bedrooms: 4,
    bathrooms: 3,
    area: "250",
  },
  {
    id: 2,
    title: "Appartement 3 pièces",
    price: "150000",
    location: "Ouagadougou, Secteur 12",
    image: require("../../assets/images/white_villa_bg.jpg"),
    status: "active",
    views: 89,
    favorites: 12,
    rating: 4.5,
    type: "Location",
    bedrooms: 3,
    bathrooms: 2,
    area: "120",
  },
  {
    id: 3,
    title: "Maison familiale spacieuse",
    price: "35000000",
    location: "Ouagadougou, Secteur 8",
    image: require("../../assets/images/white_villa.jpg"),
    status: "pending",
    views: 203,
    favorites: 45,
    rating: 4.9,
    type: "Vente",
    bedrooms: 5,
    bathrooms: 4,
    area: "300",
  },
];

export default function MyPropertiesScreen() {
  const { isLoaded } = useUser();
  const { isOwner } = useUserType();
  const [refreshing, setRefreshing] = useState(false);
  const [properties, setProperties] = useState(mockProperties);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"price" | "date" | "views">("date");
  const scrollY = useRef(new Animated.Value(0)).current;

  // Filter and sort properties
  const filteredProperties = properties
    .filter((property) => {
      const matchesStatus =
        !selectedStatus || property.status === selectedStatus;
      return matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return parseInt(a.price, 10) - parseInt(b.price, 10);
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

  // Show loading state while user data is being fetched
  if (!isLoaded) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: tokens.colors.roogo.neutral[100] }}
        edges={["top"]}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={{
              fontSize: 16,
              color: tokens.colors.roogo.neutral[500],
              fontFamily: "Urbanist-Medium",
            }}
          >
            Chargement...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Redirect non-owners to home
  if (!isOwner) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: tokens.colors.roogo.neutral[100] }}
        edges={["top"]}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={{
              fontSize: 16,
              color: tokens.colors.roogo.neutral[500],
              fontFamily: "Urbanist-Medium",
            }}
          >
            Accès réservé aux propriétaires
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "en_ligne":
      case "active":
        return tokens.colors.roogo.success;
      case "en_attente":
      case "pending":
        return tokens.colors.roogo.warning;
      case "expired":
        return tokens.colors.roogo.error;
      case "sold":
        return "#3B82F6"; // Blue-500
      default:
        return tokens.colors.roogo.neutral[500];
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "en_ligne":
      case "active":
        return "#ECFDF5"; // light green
      case "en_attente":
      case "pending":
        return "#FFFBEB"; // light yellow
      case "expired":
        return "#FEF2F2"; // light red
      case "sold":
        return "#EFF6FF"; // light blue
      default:
        return tokens.colors.roogo.neutral[100];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "en_ligne":
        return "En ligne";
      case "en_attente":
        return "En attente";
      case "expired":
        return "Expiré";
      case "active":
        return "Actif";
      case "pending":
        return "En attente";
      case "sold":
        return "Louées";
      default:
        return "Inconnu";
    }
  };

  // Header opacity animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.98],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: tokens.colors.roogo.neutral[100] }}
      edges={["top"]}
    >
      {/* Animated Header */}
      <Animated.View
        style={{
          opacity: headerOpacity,
          backgroundColor: "#FFFFFF",
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 4,
          zIndex: 10,
        }}
      >
        {/* Header Title */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 28,
                fontFamily: "Urbanist-Bold",
                color: tokens.colors.roogo.neutral[900],
              }}
            >
              Mes Propriétés
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: tokens.colors.roogo.neutral[500],
                fontFamily: "Urbanist-Medium",
                marginTop: 4,
              }}
            >
              Gérez vos annonces immobilières
            </Text>
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            activeOpacity={0.7}
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: showFilters
                ? tokens.colors.roogo.primary[500]
                : tokens.colors.roogo.neutral[100],
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Funnel
              size={20}
              color={showFilters ? "white" : tokens.colors.roogo.neutral[900]}
              weight={showFilters ? "fill" : "bold"}
            />
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 4,
            gap: 12,
          }}
        >
          {[
            {
              label: "Actives",
              count: properties.filter((p) => p.status === "active").length,
              color: tokens.colors.roogo.success,
              bg: "#ECFDF5",
            },
            {
              label: "En attente",
              count: properties.filter((p) => p.status === "pending").length,
              color: tokens.colors.roogo.warning,
              bg: "#FFFBEB",
            },
            {
              label: "Louées",
              count: properties.filter((p) => p.status === "sold").length,
              color: "#3B82F6", // Blue-500
              bg: "#EFF6FF",
            },
          ].map((stat, idx) => (
            <View
              key={idx}
              style={{
                flex: 1,
                backgroundColor: stat.bg,
                borderRadius: 16,
                padding: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: stat.bg,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Urbanist-SemiBold",
                  color: stat.color,
                  marginBottom: 4,
                  opacity: 0.8,
                }}
              >
                {stat.label}
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Urbanist-Bold",
                  color: stat.color,
                }}
              >
                {stat.count}
              </Text>
            </View>
          ))}
        </View>

        {/* Filter Options */}
        {showFilters && (
          <View
            style={{
              marginTop: 16,
              backgroundColor: tokens.colors.roogo.neutral[100],
              padding: 16,
              borderRadius: 16,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Urbanist-Bold",
                color: tokens.colors.roogo.neutral[900],
                marginBottom: 12,
              }}
            >
              Filtrer par statut
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 20,
              }}
            >
              {["active", "pending", "sold"].map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() =>
                    setSelectedStatus(selectedStatus === status ? null : status)
                  }
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 100,
                    backgroundColor:
                      selectedStatus === status
                        ? tokens.colors.roogo.primary[500]
                        : "white",
                    borderWidth: 1,
                    borderColor:
                      selectedStatus === status
                        ? tokens.colors.roogo.primary[500]
                        : "#E5E7EB",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: "Urbanist-SemiBold",
                      color:
                        selectedStatus === status
                          ? "white"
                          : tokens.colors.roogo.neutral[700],
                    }}
                  >
                    {getStatusText(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text
              style={{
                fontSize: 14,
                fontFamily: "Urbanist-Bold",
                color: tokens.colors.roogo.neutral[900],
                marginBottom: 12,
              }}
            >
              Trier par
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
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
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 100,
                    backgroundColor:
                      sortBy === option.id
                        ? tokens.colors.roogo.primary[500]
                        : "white",
                    borderWidth: 1,
                    borderColor:
                      sortBy === option.id
                        ? tokens.colors.roogo.primary[500]
                        : "#E5E7EB",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: "Urbanist-SemiBold",
                      color:
                        sortBy === option.id
                          ? "white"
                          : tokens.colors.roogo.neutral[700],
                    }}
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
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={{ padding: 20 }}>
          {/* Properties Grid */}
          <View style={{ gap: 20 }}>
            {filteredProperties.map((property) => (
              <View
                key={property.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: 20,
                  padding: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.05,
                  shadowRadius: 12,
                  elevation: 3,
                }}
              >
                <PropertyCard
                  property={{
                    ...property,
                    category:
                      property.type === "Location" ? "Residential" : "Business",
                    parking: 1, // Default value since it's required
                  }}
                  showStats={true}
                  showActions={true}
                  onEdit={() => handleEdit(property.id)}
                  onDelete={() => handleDelete(property.id)}
                />
                {/* Status Badge */}
                <View
                  style={{
                    position: "absolute",
                    top: 24,
                    right: 24,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 100,
                    backgroundColor: getStatusBg(property.status),
                    zIndex: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Urbanist-Bold",
                      color: getStatusColor(property.status),
                    }}
                  >
                    {getStatusText(property.status)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
