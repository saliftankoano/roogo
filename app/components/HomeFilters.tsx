import Slider from "@react-native-community/slider";
import { SlidersHorizontal, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

export type FiltersState = {
  neighborhood: string;
  bedrooms: string;
  bathrooms: string;
  parking: string;
  area: string;
  minPrice: number;
  maxPrice: number;
};

const BEDROOM_OPTIONS = ["Tous", "1", "2", "3", "4+"];
const BATHROOM_OPTIONS = ["Tous", "1", "2", "3+"];
const PARKING_OPTIONS = ["Tous", "1", "2", "3+"];
const AREA_OPTIONS = ["Tous", "<800", "800-1200", ">1200"];

const NEIGHBORHOODS = [
  "Tous",
  "Ouagadougou",
  "Ouaga 2000",
  "Somgandé",
  "Cissin",
];

interface HomeFiltersProps {
  filters: FiltersState;
  onFilterChange: (key: keyof FiltersState, value: string | number) => void;
  onReset: () => void;
}

export default function HomeFilters({
  filters,
  onFilterChange,
  onReset,
}: HomeFiltersProps) {
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  const STEP = 50000;
  const MIN_PRICE = 0;
  const MAX_PRICE = 2000000;

  const clampToStep = (value: number) => Math.round(value / STEP) * STEP;

  const handleMinChange = (value: number) => {
    const clamped = clampToStep(
      Math.min(value, Math.max(filters.maxPrice - STEP, MIN_PRICE))
    );
    onFilterChange("minPrice", clamped);
  };

  const handleMaxChange = (value: number) => {
    const clamped = clampToStep(
      Math.max(value, Math.min(filters.minPrice + STEP, MAX_PRICE))
    );
    onFilterChange("maxPrice", clamped);
  };

  const minSliderMax = useMemo(
    () => Math.max(filters.maxPrice - STEP, MIN_PRICE),
    [filters.maxPrice]
  );

  const maxSliderMin = useMemo(
    () => Math.min(filters.minPrice + STEP, MAX_PRICE),
    [filters.minPrice]
  );

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-gray-900">Filtres</Text>
        <TouchableOpacity
          className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg"
          onPress={() => setFilterModalVisible(true)}
        >
          <SlidersHorizontal size={18} color="#374151" />
          <Text className="ml-2 text-sm font-semibold text-gray-700">
            Plus de filtres
          </Text>
        </TouchableOpacity>
      </View>

      {/* Neighborhood Filter */}
      <View className="mb-3">
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          Quartier
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {NEIGHBORHOODS.map((neighborhood) => (
            <TouchableOpacity
              key={neighborhood}
              onPress={() => onFilterChange("neighborhood", neighborhood)}
              className={`mr-2 px-4 py-2 rounded-full border ${
                filters.neighborhood === neighborhood
                  ? "bg-blue-500 border-blue-500"
                  : "bg-white border-gray-300"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  filters.neighborhood === neighborhood
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                {neighborhood}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filters Modal */}
      <Modal
        visible={isFilterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                Filtres supplémentaires
              </Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <X size={20} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Chambres
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {BEDROOM_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => onFilterChange("bedrooms", option)}
                      className={`px-4 py-2 rounded-full border ${
                        filters.bedrooms === option
                          ? "bg-blue-500 border-blue-500"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          filters.bedrooms === option
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Salles de bains
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {BATHROOM_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => onFilterChange("bathrooms", option)}
                      className={`px-4 py-2 rounded-full border ${
                        filters.bathrooms === option
                          ? "bg-blue-500 border-blue-500"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          filters.bathrooms === option
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Stationnement
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {PARKING_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => onFilterChange("parking", option)}
                      className={`px-4 py-2 rounded-full border ${
                        filters.parking === option
                          ? "bg-blue-500 border-blue-500"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          filters.parking === option
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {option === "3+" ? "3 places et +" : option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Surface
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {AREA_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => onFilterChange("area", option)}
                      className={`px-4 py-2 rounded-full border ${
                        filters.area === option
                          ? "bg-blue-500 border-blue-500"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          filters.area === option
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {option === "<800"
                          ? "Moins de 800 m²"
                          : option === "800-1200"
                            ? "800 à 1200 m²"
                            : option === ">1200"
                              ? "Plus de 1200 m²"
                              : option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Budget (CFA)
                </Text>
                <View className="px-2">
                  <View className="mb-4">
                    <Text className="text-xs font-semibold text-gray-500 mb-1">
                      Minimum
                    </Text>
                    <Slider
                      minimumValue={MIN_PRICE}
                      maximumValue={minSliderMax}
                      step={STEP}
                      value={filters.minPrice}
                      minimumTrackTintColor="#2563EB"
                      maximumTrackTintColor="#E5E7EB"
                      thumbTintColor="#2563EB"
                      onSlidingComplete={handleMinChange}
                    />
                  </View>
                  <View>
                    <Text className="text-xs font-semibold text-gray-500 mb-1">
                      Maximum
                    </Text>
                    <Slider
                      minimumValue={maxSliderMin}
                      maximumValue={MAX_PRICE}
                      step={STEP}
                      value={filters.maxPrice}
                      minimumTrackTintColor="#2563EB"
                      maximumTrackTintColor="#E5E7EB"
                      thumbTintColor="#2563EB"
                      onSlidingComplete={handleMaxChange}
                    />
                  </View>
                  <View className="flex-row justify-between mt-4">
                    <Text className="text-sm text-gray-600">
                      Min: {filters.minPrice.toLocaleString()} CFA
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Max: {filters.maxPrice.toLocaleString()} CFA
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                onPress={onReset}
                className="flex-1 mr-3 border border-gray-200 rounded-full py-3"
              >
                <Text className="text-center text-sm font-semibold text-gray-700">
                  Réinitialiser
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                className="flex-1 ml-3 bg-blue-500 rounded-full py-3"
              >
                <Text className="text-center text-sm font-semibold text-white">
                  Appliquer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
