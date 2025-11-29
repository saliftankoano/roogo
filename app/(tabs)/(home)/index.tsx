import { tokens } from "../../../theme/tokens";
import { router } from "expo-router";
import { MapPin, SlidersHorizontal } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FilterModal, { FiltersState } from "../../../components/FilterModal";
import PropertyCard from "../../../components/PropertyCard";
import type { Property } from "../../../constants/properties";
import { fetchActiveProperties } from "../../../services/propertyFetchService";

const INITIAL_FILTERS: FiltersState = {
  neighborhood: "Tous",
  bedrooms: "Tous",
  bathrooms: "Tous",
  parking: "Tous",
  minArea: null,
  maxArea: null,
  minPrice: 0,
  maxPrice: 2000000,
};

const getNumericValue = (value: string) => {
  const numeric = parseInt(value.replace(/\D/g, ""), 10);
  return Number.isNaN(numeric) ? 0 : numeric;
};

type PropertyWithCategory = Property & { category: "Residential" | "Business" };

const CATEGORIES = [
  { id: "All", label: "Tout" },
  { id: "Residential", label: "Résidentiel" },
  { id: "Business", label: "Business" },
] as const;

export default function HomeScreen() {
  // const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<
    "All" | "Residential" | "Business"
  >("All");
  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  // Fetch properties from Supabase on mount
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedProperties = await fetchActiveProperties();
        setProperties(fetchedProperties);
      } catch (err) {
        console.error("Error loading properties:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement des propriétés"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  const updateFilter = (key: keyof FiltersState, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const filteredProperties = useMemo(() => {
    const propertyMatchesFilters = (property: PropertyWithCategory) => {
      // Search query filter (Disabled for now as search bar is removed)
      /* if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchTitle = property.title.toLowerCase().includes(query);
        const matchLocation = property.location.toLowerCase().includes(query);
        if (!matchTitle && !matchLocation) return false;
      } */

      if (
        filters.neighborhood !== "Tous" &&
        property.location !== filters.neighborhood
      ) {
        return false;
      }

      if (filters.bedrooms !== "Tous") {
        if (filters.bedrooms === "4+") {
          if (property.bedrooms < 4) return false;
        } else if (property.bedrooms !== Number(filters.bedrooms)) {
          return false;
        }
      }

      if (filters.bathrooms !== "Tous") {
        if (filters.bathrooms === "3+") {
          if (property.bathrooms < 3) return false;
        } else if (property.bathrooms !== Number(filters.bathrooms)) {
          return false;
        }
      }

      if (filters.parking !== "Tous") {
        if (filters.parking === "3+") {
          if (property.parking < 3) return false;
        } else if (property.parking < Number(filters.parking)) {
          return false;
        }
      }

      const areaValue = getNumericValue(property.area);
      if (filters.minArea !== null && areaValue < filters.minArea) {
        return false;
      }
      if (filters.maxArea !== null && areaValue > filters.maxArea) {
        return false;
      }

      const priceValue = getNumericValue(property.price);
      if (priceValue < filters.minPrice || priceValue > filters.maxPrice) {
        return false;
      }

      return true;
    };
    return properties
      .filter(
        (property) =>
          (selectedCategory === "All" ||
            property.category === selectedCategory) &&
          propertyMatchesFilters(property)
      )
      .sort((a, b) => {
        // Sponsored properties come first
        if (a.isSponsored && !b.isSponsored) return -1;
        if (!a.isSponsored && b.isSponsored) return 1;
        return 0;
      });
  }, [selectedCategory, filters, properties]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color={tokens.colors.roogo.primary[500]}
          />
          <Text className="mt-4 text-gray-600">
            Chargement des propriétés...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Erreur de chargement
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-4">
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setLoading(true);
              fetchActiveProperties()
                .then(setProperties)
                .catch((err) => setError(err.message))
                .finally(() => setLoading(false));
            }}
            className="bg-blue-500 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-roogo-neutral-100" edges={["top"]}>
      {/* Header with Location and Filters */}
      <View className="px-6 pt-2 pb-6 flex-row items-center justify-between">
        <TouchableOpacity className="flex-row items-center bg-white px-4 py-3 rounded-full shadow-sm border border-roogo-neutral-100 flex-1 mr-3">
          <MapPin size={20} color={tokens.colors.roogo.primary[500]} />
          <Text className="ml-3 text-lg font-bold text-roogo-neutral-900 font-urbanist">
            Ouagadougou
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilterModalVisible(true)}
          className="w-12 h-12 bg-roogo-neutral-900 rounded-full items-center justify-center shadow-md"
        >
          <SlidersHorizontal size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Categories Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="pl-6 mb-8"
          contentContainerStyle={{ paddingRight: 24 }}
        >
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                className={`mr-3 px-6 py-2.5 rounded-full ${
                  isSelected
                    ? "bg-roogo-neutral-900" // Removed shadow-md to fix artifact
                    : "bg-white border border-roogo-neutral-200"
                }`}
              >
                <Text
                  className={`font-bold font-urbanist ${
                    isSelected
                      ? "text-white" // White text on black
                      : "text-roogo-neutral-500"
                  }`}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Property List */}
        <View className="px-6">
          {filteredProperties.length === 0 ? (
            <Text className="text-sm text-roogo-neutral-500 text-center mt-8">
              Aucune propriété ne correspond à vos critères pour le moment.
            </Text>
          ) : (
            <View className="space-y-5">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isHorizontal={false}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/(home)/details",
                      params: {
                        id: property.uuid || property.id.toString(),
                      },
                    })
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        onFilterChange={updateFilter}
        onReset={resetFilters}
        resultsCount={filteredProperties.length}
      />
    </SafeAreaView>
  );
}
