import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeFilters, { FiltersState } from "../../components/HomeFilters";
import PropertyCard from "../../components/PropertyCard";
import type { Property } from "../../constants/properties";
import { properties } from "../../constants/properties";

const INITIAL_FILTERS: FiltersState = {
  neighborhood: "Tous",
  bedrooms: "Tous",
  bathrooms: "Tous",
  parking: "Tous",
  area: "Tous",
  minPrice: 0,
  maxPrice: 2000000,
};

const getNumericValue = (value: string) => {
  const numeric = parseInt(value.replace(/\D/g, ""), 10);
  return Number.isNaN(numeric) ? 0 : numeric;
};

type PropertyWithCategory = Property & { category: "Louer" | "Acheter" };

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState("Louer");
  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS);

  const categories = [
    {
      id: "Louer",
      label: "Louer",
      image: require("../../../assets/images/louer.png"),
    },
    {
      id: "Acheter",
      label: "Àcheter",
      image: require("../../../assets/images/acheter.png"),
    },
  ];

  const updateFilter = (key: keyof FiltersState, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const filteredProperties = useMemo(() => {
    const propertyMatchesFilters = (property: PropertyWithCategory) => {
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

      if (filters.area !== "Tous") {
        const areaValue = getNumericValue(property.area);
        if (filters.area === "<800" && areaValue >= 800) return false;
        if (
          filters.area === "800-1200" &&
          (areaValue < 800 || areaValue > 1200)
        )
          return false;
        if (filters.area === ">1200" && areaValue <= 1200) return false;
      }

      const priceValue = getNumericValue(property.price);
      if (priceValue < filters.minPrice || priceValue > filters.maxPrice) {
        return false;
      }

      return true;
    };
    return properties.filter(
      (property) =>
        property.category === selectedCategory &&
        propertyMatchesFilters(property)
    );
  }, [selectedCategory, filters]);

  const sponsoredProperties = useMemo(() => {
    return filteredProperties.filter((property) => property.isSponsored);
  }, [filteredProperties]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Category Selection */}
        <View className="px-4 pb-10">
          <View className="flex-row items-center justify-between">
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                className="flex-1 items-center"
              >
                <View className="items-center">
                  <Image
                    source={category.image}
                    style={{
                      width: 60,
                      height: 60,
                      opacity: selectedCategory === category.id ? 1 : 0.4,
                    }}
                    resizeMode="contain"
                  />
                </View>
                <Text
                  className={`text-xl font-bold ${
                    selectedCategory === category.id
                      ? "text-gray-900"
                      : "text-gray-500"
                  }`}
                >
                  {category.label}
                </Text>
                {selectedCategory === category.id && (
                  <View className="w-16 h-2 bg-gray-900 rounded-full mt-3" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Filter Section */}
        <View className="px-4">
          <HomeFilters
            filters={filters}
            onFilterChange={updateFilter}
            onReset={resetFilters}
          />
        </View>

        {/* Sponsored Homes Section */}
        <View className="px-4 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">
              Maisons Sponsorisées
            </Text>
            <ChevronRight size={20} color="#6B7280" />
          </View>

          {sponsoredProperties.length === 0 ? (
            <Text className="text-sm text-gray-500">
              Aucune propriété sponsorisée ne correspond à vos filtres.
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row"
            >
              {sponsoredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isHorizontal={true}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/(home)/details",
                      params: { id: property.id.toString() },
                    })
                  }
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* All Properties Section */}
        <View className="px-4 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">
              Toutes les propriétés
            </Text>
            <ChevronRight size={20} color="#6B7280" />
          </View>

          {filteredProperties.length === 0 ? (
            <Text className="text-sm text-gray-500">
              Aucune propriété ne correspond à vos critères pour le moment.
            </Text>
          ) : (
            <View className="space-y-4">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isHorizontal={false}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/(home)/details",
                      params: { id: property.id.toString() },
                    })
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
