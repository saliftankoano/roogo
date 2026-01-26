import { useUser } from "@clerk/clerk-expo";
import { useFocusEffect, useRouter } from "expo-router";
import { HeartIcon } from "phosphor-react-native";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthPromptModal from "@/components/auth/AuthPromptModal";
import PropertyCard from "@/components/property/PropertyCard";
import type { Property } from "../../constants/properties";
import {
  fetchUserFavorites,
  removeFavorite,
} from "../../services/favoritesService";
import { tokens } from "../../theme/tokens";

export default function FavorisScreen() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const hasRenderedOnce = useRef(false);
  const hasLoadedOnce = useRef(false);

  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track that we've rendered content at least once
  if (isLoaded) {
    hasRenderedOnce.current = true;
  }

  // Fetch favorites from Supabase
  const loadFavorites = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Only show loading spinner on first load
      if (!hasLoadedOnce.current) {
        setLoading(true);
      }
      setError(null);

      const favorites = await fetchUserFavorites(user.id);
      setFavoriteProperties(favorites);
      hasLoadedOnce.current = true;
    } catch (err) {
      console.error("Error loading favorites:", err);
      setError(
        err instanceof Error ? err.message : "Erreur lors du chargement"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  // Load favorites when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        loadFavorites();
      }
    }, [loadFavorites, user?.id])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadFavorites();
  }, [loadFavorites]);

  const handleRemoveFavorite = useCallback(
    async (property: Property) => {
      if (!user?.id || !property.uuid) return;

      // Optimistic update - remove immediately from UI
      setFavoriteProperties((prev) =>
        prev.filter((p) => p.uuid !== property.uuid)
      );

      // Then sync with server
      const result = await removeFavorite(user.id, property.uuid);

      if (!result.success) {
        // Rollback on error
        setFavoriteProperties((prev) => [...prev, property]);
        Alert.alert(
          "Erreur",
          result.error || "Impossible de retirer des favoris"
        );
      }
    },
    [user?.id]
  );

  // Only show loading on first render, never on tab switches
  if (!isLoaded && !hasRenderedOnce.current) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#FFFFFF" }}
        edges={["top"]}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator
            size="large"
            color={tokens.colors.roogo.primary[500]}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#FFFFFF" }}
        edges={["top"]}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          <Text className="text-xl font-bold text-gray-900 mb-4 text-center font-urbanist">
            Connectez-vous pour voir vos favoris
          </Text>
          <Text className="text-base text-gray-600 mb-6 text-center font-urbanist">
            Enregistrez vos propriétés favorites et accédez-y facilement
          </Text>
          <AuthPromptModal
            visible={true}
            onClose={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/");
              }
            }}
            title="Voir vos favoris"
            description="Connectez-vous pour accéder à vos propriétés favorites"
          />
        </View>
      </SafeAreaView>
    );
  }

  // Show loading only on first load
  if (loading && !hasLoadedOnce.current) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#FFFFFF" }}
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
              marginTop: 16,
              fontSize: 16,
              color: tokens.colors.roogo.neutral[500],
              fontFamily: "Urbanist-Medium",
            }}
          >
            Chargement de vos favoris...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: tokens.colors.roogo.neutral[100] }}
      edges={["top"]}
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }}>
        <Text
          style={{
            fontSize: 28,
            fontFamily: "Urbanist-Bold",
            color: tokens.colors.roogo.neutral[900],
          }}
        >
          Mes Favoris
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Urbanist-Medium",
            color: tokens.colors.roogo.neutral[500],
            marginTop: 4,
          }}
        >
          {favoriteProperties.length} propriété
          {favoriteProperties.length !== 1 ? "s" : ""} sauvegardée
          {favoriteProperties.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 120,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[tokens.colors.roogo.primary[500]]}
            tintColor={tokens.colors.roogo.primary[500]}
          />
        }
      >
        {error ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 60,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: tokens.colors.roogo.error,
                fontFamily: "Urbanist-Medium",
                textAlign: "center",
              }}
            >
              {error}
            </Text>
          </View>
        ) : favoriteProperties.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 60,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: tokens.colors.roogo.primary[50],
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <HeartIcon
                size={40}
                color={tokens.colors.roogo.primary[500]}
                weight="fill"
              />
            </View>
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Urbanist-Bold",
                color: tokens.colors.roogo.neutral[900],
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Aucun favori pour le moment
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Urbanist-Medium",
                color: tokens.colors.roogo.neutral[500],
                textAlign: "center",
                paddingHorizontal: 32,
              }}
            >
              Parcourez les propriétés et appuyez sur le coeur pour les
              sauvegarder ici
            </Text>
          </View>
        ) : (
          favoriteProperties.map((property) => (
            <PropertyCard
              key={property.uuid || property.id}
              property={{
                ...property,
                views: undefined,
                favorites: undefined,
              }}
              isFavorite={true}
              onToggleFavorite={() => handleRemoveFavorite(property)}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/(home)/details",
                  params: { id: property.uuid || property.id.toString() },
                })
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
