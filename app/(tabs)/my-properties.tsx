import { useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import {
  SortDescendingIcon,
  CalendarIcon,
  TagIcon,
  UsersIcon,
} from "phosphor-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyCard from "../../components/PropertyCard";
import { useUserType } from "../../hooks/useUserType";
import { tokens } from "../../theme/tokens";
import { fetchUserProperties } from "../../services/propertyFetchService";
import { supabase } from "../../lib/supabase";
import type { Property } from "../../constants/properties";

const slowLayoutConfig = {
  duration: 450, // Adjusted for a snappy yet smooth transition
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
  },
  delete: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
};

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function MyPropertiesScreen() {
  const { user, isLoaded } = useUser();
  const { isOwner } = useUserType();
  const [refreshing, setRefreshing] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"price" | "date" | "views">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const scrollY = useRef(new Animated.Value(0)).current;
  const sortRotation = useRef(new Animated.Value(1)).current; // Start at 1 (180deg) for Descending/Down order

  const loadProperties = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      if (user && user.id) {
        // Fetch properties for this user using clerk_id
        console.log("Fetching properties for Clerk user:", user.id);
        const fetchedProperties = await fetchUserProperties(user.id);
        console.log(`Found ${fetchedProperties.length} properties for user`);
        setProperties(fetchedProperties);
      }
    } catch (err) {
      console.error("Error loading user properties:", err);
    } finally {
      LayoutAnimation.configureNext(slowLayoutConfig);
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && user && isOwner) {
      loadProperties();
    }
  }, [isLoaded, user, isOwner, loadProperties]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProperties();
  }, [loadProperties]);

  const toggleStatus = (statusId: string | null) => {
    LayoutAnimation.configureNext(slowLayoutConfig);
    setSelectedStatus(statusId);
  };

  const toggleSort = (sortOption: "date" | "price" | "views") => {
    LayoutAnimation.configureNext(slowLayoutConfig);
    setSortBy(sortOption);
  };

  const toggleSortOrder = () => {
    LayoutAnimation.configureNext(slowLayoutConfig);
    const newOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newOrder);

    // Animate rotation - slowed down for a smoother feel
    Animated.timing(sortRotation, {
      toValue: newOrder === "desc" ? 1 : 0, // desc -> 1 (Down), asc -> 0 (Up)
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  // Filter and sort properties
  const filteredProperties = properties
    .filter((property) => {
      // Map database statuses to local filter keys
      const statusMap: Record<string, string> = {
        en_ligne: "active",
        en_attente: "pending",
        expired: "expired",
        sold: "sold",
      };
      const localStatus = statusMap[property.status] || property.status;
      const matchesStatus = !selectedStatus || localStatus === selectedStatus;
      return matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "price":
          comparison = parseInt(a.price, 10) - parseInt(b.price, 10);
          break;
        case "views":
          comparison = (a.slots_filled || 0) - (b.slots_filled || 0);
          break;
        case "date":
        default:
          if (a.created_at && b.created_at) {
            comparison =
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime();
          } else {
            comparison = (a.id || 0) - (b.id || 0);
          }
          break;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

  const handleEdit = (propertyId: number | string) => {
    // Find the property to get its UUID
    const property = properties.find((p) => p.id === propertyId);
    if (!property) return;

    // Navigate to edit property screen
    router.push({
      pathname: "/(tabs)/add-property",
      params: { id: property.uuid || property.id.toString() },
    });
  };

  const handleDelete = (propertyId: number | string) => {
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
          onPress: async () => {
            try {
              const property = properties.find((p) => p.id === propertyId);
              if (!property?.uuid) return;

              const { error } = await supabase
                .from("properties")
                .delete()
                .eq("id", property.uuid);

              if (error) throw error;

              // Remove property from state
              setProperties((prev) => prev.filter((p) => p.id !== propertyId));
            } catch (err) {
              console.error("Error deleting property:", err);
              Alert.alert("Erreur", "Impossible de supprimer la propriété");
            }
          },
        },
      ]
    );
  };

  // Show loading state while user data is being fetched
  if (!isLoaded || (loading && !refreshing)) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: tokens.colors.roogo.neutral[100] }}
        edges={["top"]}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator
            size="large"
            color={tokens.colors.roogo.primary[500]}
          />
          <Text
            style={{
              fontSize: 16,
              color: tokens.colors.roogo.neutral[500],
              fontFamily: "Urbanist-Medium",
              marginTop: 12,
            }}
          >
            Chargement de vos propriétés...
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
        return status;
    }
  };

  // Header opacity animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: "clamp",
  });

  return (
    <View
      style={{ flex: 1, backgroundColor: tokens.colors.roogo.neutral[100] }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Immersive Header - No hard background or bottom radius */}
        <Animated.View
          style={{
            opacity: headerOpacity,
            paddingTop: 16,
            zIndex: 10,
          }}
        >
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 32,
                fontFamily: "Urbanist-Bold",
                color: tokens.colors.roogo.neutral[900],
                letterSpacing: -0.5,
              }}
            >
              Mes Propriétés
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: tokens.colors.roogo.neutral[500],
                fontFamily: "Urbanist-Medium",
                marginTop: 4,
              }}
            >
              Gérez vos annonces immobilières
            </Text>
          </View>

          {/* Status Filters - Horizontal Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              gap: 12,
              paddingBottom: 20,
            }}
          >
            {[
              {
                id: null,
                label: "Toutes",
                count: properties.length,
                icon: TagIcon,
              },
              {
                id: "active",
                label: "Actives",
                count: properties.filter((p) => p.status === "en_ligne").length,
                icon: TagIcon,
              },
              {
                id: "pending",
                label: "En attente",
                count: properties.filter((p) => p.status === "en_attente")
                  .length,
                icon: TagIcon,
              },
              {
                id: "sold",
                label: "Louées",
                count: properties.filter((p) => p.status === "sold").length,
                icon: TagIcon,
              },
            ].map((stat) => {
              const isActive = selectedStatus === stat.id;
              return (
                <TouchableOpacity
                  key={stat.id || "all"}
                  onPress={() => toggleStatus(stat.id)}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 16,
                    backgroundColor: isActive
                      ? tokens.colors.roogo.primary[500]
                      : "white",
                    borderWidth: 1,
                    borderColor: isActive
                      ? tokens.colors.roogo.primary[500]
                      : tokens.colors.roogo.neutral[200],
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: isActive
                        ? "Urbanist-Bold"
                        : "Urbanist-SemiBold",
                      color: isActive
                        ? "white"
                        : tokens.colors.roogo.neutral[500],
                    }}
                  >
                    {stat.label}
                  </Text>
                  <View
                    style={{
                      marginLeft: 8,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 6,
                      backgroundColor: isActive
                        ? "rgba(255,255,255,0.2)"
                        : tokens.colors.roogo.neutral[100],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Urbanist-Bold",
                        color: isActive
                          ? "white"
                          : tokens.colors.roogo.neutral[700],
                      }}
                    >
                      {stat.count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Sort Controls */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingBottom: 16,
              gap: 12,
            }}
          >
            <TouchableOpacity
              onPress={toggleSortOrder}
              activeOpacity={0.7}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: "white",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: tokens.colors.roogo.neutral[200],
              }}
            >
              <Animated.View
                style={{
                  transform: [
                    {
                      rotateX: sortRotation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "180deg"],
                      }),
                    },
                  ],
                }}
              >
                <SortDescendingIcon
                  size={16}
                  color={tokens.colors.roogo.primary[500]}
                  weight="bold"
                />
              </Animated.View>
            </TouchableOpacity>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {[
                { id: "date", label: "Plus récent", icon: CalendarIcon },
                { id: "price", label: "Prix", icon: TagIcon },
                { id: "views", label: "Candidats", icon: UsersIcon },
              ].map((option) => {
                const isActive = sortBy === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => toggleSort(option.id as any)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 10,
                      backgroundColor: isActive ? "#FDF2F0" : "transparent",
                    }}
                  >
                    <option.icon
                      size={14}
                      color={
                        isActive
                          ? tokens.colors.roogo.primary[500]
                          : tokens.colors.roogo.neutral[400]
                      }
                      weight={isActive ? "fill" : "regular"}
                    />
                    <Text
                      style={{
                        marginLeft: 6,
                        fontSize: 13,
                        fontFamily: isActive
                          ? "Urbanist-Bold"
                          : "Urbanist-Medium",
                        color: isActive
                          ? tokens.colors.roogo.primary[500]
                          : tokens.colors.roogo.neutral[500],
                      }}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
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
              {filteredProperties.length === 0 ? (
                <View style={{ alignItems: "center", marginTop: 40 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: tokens.colors.roogo.neutral[500],
                      fontFamily: "Urbanist-Medium",
                      textAlign: "center",
                    }}
                  >
                    {selectedStatus
                      ? "Aucune propriété avec ce statut."
                      : "Vous n'avez pas encore d'annonces."}
                  </Text>
                </View>
              ) : (
                filteredProperties.map((property) => (
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
                        views: property.slots_filled, // Using slots as proxy for engagement in card
                        favorites: 0, // Favorites count not implemented yet
                      }}
                      showStats={true}
                      showActions={true}
                      showFavorite={false}
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
                ))
              )}
            </View>
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}
