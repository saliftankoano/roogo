import { ChevronDown, X } from "lucide-react-native";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Easing,
  PanResponder,
  Keyboard,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { tokens } from "../theme/tokens";
import { formatPrice, parsePrice } from "../utils/formatting";

export type FiltersState = {
  neighborhood: string;
  bedrooms: string;
  bathrooms: string;
  parking: string;
  minArea: number | null;
  maxArea: number | null;
  minPrice: number;
  maxPrice: number;
};

const BEDROOM_OPTIONS = ["Tous", "1", "2", "3", "4+"];
const BATHROOM_OPTIONS = ["Tous", "1", "2", "3+"];
const PARKING_OPTIONS = ["Tous", "1", "2", "3+"];
const NEIGHBORHOODS = [
  "Tous",
  "Ouagadougou",
  "Ouaga 2000",
  "Somgandé",
  "Cissin",
];

const HISTOGRAM_DATA = [
  5, 15, 25, 40, 60, 75, 90, 100, 85, 70, 55, 40, 30, 20, 15, 10, 5, 8, 12, 18,
  25, 15, 10, 5,
];

const SURFACE_OPTIONS = [
  0, 500, 750, 1000, 1250, 1500, 1750, 2000, 2500, 3000, 4000, 5000,
];

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FiltersState;
  onFilterChange: (key: keyof FiltersState, value: any) => void;
  onReset: () => void;
  resultsCount: number;
}

// Histogram Bar with entrance animation
const HistogramBar = ({
  heightPercent,
  index,
  isActive,
}: {
  heightPercent: number;
  index: number;
  isActive: boolean;
}) => {
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: heightPercent,
      duration: 400,
      delay: index * 25,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [animatedHeight, heightPercent, index]);

  useEffect(() => {
    Animated.timing(animatedOpacity, {
      toValue: isActive ? 1 : 0.3,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isActive, animatedOpacity]);

  return (
    <Animated.View
      style={{
        flex: 1,
        marginHorizontal: 1,
        backgroundColor: tokens.colors.roogo.primary[500],
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
        height: animatedHeight.interpolate({
          inputRange: [0, 100],
          outputRange: ["0%", "100%"],
        }),
        opacity: animatedOpacity,
      }}
    />
  );
};

// Custom Dual Range Slider built from scratch
const THUMB_SIZE = 28;
const TRACK_HEIGHT = 4;

interface DualRangeSliderProps {
  minValue: number;
  maxValue: number;
  min: number;
  max: number;
  step: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}

const DualRangeSlider = ({
  minValue,
  maxValue,
  min,
  max,
  step,
  onMinChange,
  onMaxChange,
}: DualRangeSliderProps) => {
  const sliderWidth = useRef(0);
  const minThumbX = useRef(new Animated.Value(0)).current;
  const maxThumbX = useRef(new Animated.Value(0)).current;

  // Convert value to position
  const valueToPosition = useCallback(
    (value: number) => {
      if (sliderWidth.current === 0) return 0;
      const ratio = (value - min) / (max - min);
      return ratio * (sliderWidth.current - THUMB_SIZE);
    },
    [min, max]
  );

  // Convert position to value
  const positionToValue = useCallback(
    (position: number) => {
      if (sliderWidth.current === 0) return min;
      const ratio = position / (sliderWidth.current - THUMB_SIZE);
      const rawValue = min + ratio * (max - min);
      return Math.round(rawValue / step) * step;
    },
    [min, max, step]
  );

  // Update thumb positions when values change externally
  useEffect(() => {
    if (sliderWidth.current > 0) {
      minThumbX.setValue(valueToPosition(minValue));
      maxThumbX.setValue(valueToPosition(maxValue));
    }
  }, [minValue, maxValue, valueToPosition, minThumbX, maxThumbX]);

  // Min thumb pan responder
  const minPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        minThumbX.setOffset((minThumbX as any)._value);
        minThumbX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        const newX = Math.max(
          0,
          Math.min(
            (minThumbX as any)._offset + gestureState.dx,
            (maxThumbX as any)._value - THUMB_SIZE / 2
          )
        );
        minThumbX.setValue(newX - (minThumbX as any)._offset);
      },
      onPanResponderRelease: () => {
        minThumbX.flattenOffset();
        const finalValue = positionToValue((minThumbX as any)._value);
        const clampedValue = Math.min(finalValue, maxValue - step);
        onMinChange(Math.max(min, clampedValue));
      },
    })
  ).current;

  // Max thumb pan responder
  const maxPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        maxThumbX.setOffset((maxThumbX as any)._value);
        maxThumbX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        const newX = Math.min(
          sliderWidth.current - THUMB_SIZE,
          Math.max(
            (maxThumbX as any)._offset + gestureState.dx,
            (minThumbX as any)._value + THUMB_SIZE / 2
          )
        );
        maxThumbX.setValue(newX - (maxThumbX as any)._offset);
      },
      onPanResponderRelease: () => {
        maxThumbX.flattenOffset();
        const finalValue = positionToValue((maxThumbX as any)._value);
        const clampedValue = Math.max(finalValue, minValue + step);
        onMaxChange(Math.min(max, clampedValue));
      },
    })
  ).current;

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    sliderWidth.current = width;
    minThumbX.setValue(valueToPosition(minValue));
    maxThumbX.setValue(valueToPosition(maxValue));
  };

  // Calculate track fill positions
  const minPercent = ((minValue - min) / (max - min)) * 100;
  const maxPercent = ((maxValue - min) / (max - min)) * 100;

  return (
    <View className="h-12 justify-center" onLayout={handleLayout}>
      {/* Track Background */}
      <View
        style={{
          position: "absolute",
          left: THUMB_SIZE / 2,
          right: THUMB_SIZE / 2,
          height: TRACK_HEIGHT,
          backgroundColor: tokens.colors.roogo.neutral[100],
          borderRadius: TRACK_HEIGHT / 2,
        }}
      />

      {/* Active Track Fill */}
      <View
        style={{
          position: "absolute",
          left: `${minPercent}%`,
          right: `${100 - maxPercent}%`,
          height: TRACK_HEIGHT,
          backgroundColor: tokens.colors.roogo.primary[500],
          borderRadius: TRACK_HEIGHT / 2,
          marginLeft: THUMB_SIZE / 2,
          marginRight: THUMB_SIZE / 2,
        }}
      />

      {/* Min Thumb */}
      <Animated.View
        {...minPanResponder.panHandlers}
        style={{
          position: "absolute",
          left: minThumbX,
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          borderRadius: THUMB_SIZE / 2,
          backgroundColor: tokens.colors.roogo.primary[500],
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 4,
        }}
      />

      {/* Max Thumb */}
      <Animated.View
        {...maxPanResponder.panHandlers}
        style={{
          position: "absolute",
          left: maxThumbX,
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          borderRadius: THUMB_SIZE / 2,
          backgroundColor: tokens.colors.roogo.primary[500],
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 4,
        }}
      />
    </View>
  );
};

export default function FilterModal({
  visible,
  onClose,
  filters,
  onFilterChange,
  onReset,
  resultsCount,
}: FilterModalProps) {
  const STEP = 50000;
  const MIN_PRICE = 0;
  const MAX_PRICE = 2000000;

  // Local state for slider to allow smooth dragging
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice);

  useEffect(() => {
    setLocalMinPrice(filters.minPrice);
    setLocalMaxPrice(filters.maxPrice);
  }, [filters.minPrice, filters.maxPrice]);

  const [expandedDropdown, setExpandedDropdown] = useState<string | null>(null);

  // Animated values for dropdown heights
  const dropdownAnimations = useRef<{ [key: string]: Animated.Value }>(
    {}
  ).current;

  const getDropdownAnim = (key: string) => {
    if (!dropdownAnimations[key]) {
      dropdownAnimations[key] = new Animated.Value(0);
    }
    return dropdownAnimations[key];
  };

  const handleMinPriceChange = (value: number) => {
    const clamped = Math.round(value / STEP) * STEP;
    setLocalMinPrice(clamped);
    onFilterChange("minPrice", clamped);
  };

  const handleMaxPriceChange = (value: number) => {
    const clamped = Math.round(value / STEP) * STEP;
    setLocalMaxPrice(clamped);
    onFilterChange("maxPrice", clamped);
  };

  const handleMinTextChange = (text: string) => {
    const val = parsePrice(text);
    if (val !== undefined) {
      setLocalMinPrice(val);
    } else if (text === "") {
      setLocalMinPrice(0);
    }
  };

  const handleMinTextSubmit = () => {
    const clamped = Math.min(
      Math.max(localMinPrice, MIN_PRICE),
      localMaxPrice - STEP
    );
    setLocalMinPrice(clamped);
    onFilterChange("minPrice", clamped);
  };

  const handleMaxTextChange = (text: string) => {
    const val = parsePrice(text);
    if (val !== undefined) {
      setLocalMaxPrice(val);
    } else if (text === "") {
      setLocalMaxPrice(0);
    }
  };

  const handleMaxTextSubmit = () => {
    const clamped = Math.max(
      Math.min(localMaxPrice, MAX_PRICE),
      localMinPrice + STEP
    );
    setLocalMaxPrice(clamped);
    onFilterChange("maxPrice", clamped);
  };

  const toggleDropdown = (key: string) => {
    const isCurrentlyExpanded = expandedDropdown === key;
    const anim = getDropdownAnim(key);

    // Close any other open dropdown first
    if (expandedDropdown && expandedDropdown !== key) {
      const prevAnim = getDropdownAnim(expandedDropdown);
      Animated.timing(prevAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }

    // Toggle current dropdown
    Animated.timing(anim, {
      toValue: isCurrentlyExpanded ? 0 : 1,
      duration: 250,
      easing: isCurrentlyExpanded
        ? Easing.in(Easing.ease)
        : Easing.out(Easing.back(1.1)),
      useNativeDriver: false,
    }).start();

    setExpandedDropdown(isCurrentlyExpanded ? null : key);
  };

  const FilterSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View className="mb-8">
      <Text className="text-lg font-bold text-roogo-neutral-900 mb-4 font-urbanist">
        {title}
      </Text>
      {children}
    </View>
  );

  const FilterDropdown = ({
    label,
    value,
    options,
    onSelect,
    dropdownKey,
    placeholder = "Indifférent",
  }: {
    label?: string;
    value: string | number | null;
    options: (string | number)[];
    onSelect: (val: string | number | null) => void;
    dropdownKey: string;
    placeholder?: string;
  }) => {
    const isExpanded = expandedDropdown === dropdownKey;
    const anim = getDropdownAnim(dropdownKey);
    const optionsCount = options.length;
    const itemHeight = 48;
    const maxVisibleItems = 5; // Show max 5 items, scroll for rest
    const dropdownHeight =
      Math.min(optionsCount, maxVisibleItems) * itemHeight + 4;

    // Animated chevron rotation
    const chevronRotation = anim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"],
    });

    return (
      <View className="flex-1" style={{ zIndex: isExpanded ? 100 : 1 }}>
        {label && (
          <Text className="text-sm font-bold text-roogo-neutral-900 mb-2 font-urbanist">
            {label}
          </Text>
        )}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => toggleDropdown(dropdownKey)}
          className="flex-row justify-between items-center px-4 py-3 bg-roogo-neutral-900 rounded-xl"
        >
          <Text className="text-white font-urbanist font-semibold">
            {value === "Tous" || value === 0 || value === null
              ? placeholder
              : value.toString()}
          </Text>
          <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
            <ChevronDown size={20} color="white" />
          </Animated.View>
        </TouchableOpacity>

        {/* Animated Dropdown Content - Absolutely positioned to not affect siblings */}
        <Animated.View
          pointerEvents={isExpanded ? "auto" : "none"}
          style={{
            position: "absolute",
            top: label ? 70 : 52, // Account for label height + button height
            left: 0,
            right: 0,
            height: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, dropdownHeight],
            }),
            opacity: anim,
            overflow: "hidden",
            borderRadius: 12,
            // White glow shadow for better separation on dark backgrounds
            shadowColor: "#fff",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 12,
            // Border for extra definition
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.15)",
          }}
        >
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator={optionsCount > maxVisibleItems}
            style={{
              backgroundColor: tokens.colors.roogo.neutral[900],
              borderRadius: 11, // Slightly smaller to account for border
              maxHeight: dropdownHeight,
            }}
          >
            {options.map((opt, index) => (
              <TouchableOpacity
                key={opt.toString()}
                activeOpacity={0.7}
                onPress={() => {
                  onSelect(opt === 0 ? null : opt);
                  toggleDropdown(dropdownKey);
                }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderBottomWidth: index < options.length - 1 ? 1 : 0,
                  borderBottomColor: tokens.colors.roogo.neutral[700],
                }}
              >
                <Text className="text-white font-urbanist">
                  {opt === "Tous" || opt === 0 ? placeholder : opt.toString()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1" onPress={Keyboard.dismiss}>
        <SafeAreaView className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-roogo-neutral-100">
            <TouchableOpacity onPress={onReset} className="px-2">
              <Text className="text-roogo-neutral-500 font-urbanist font-semibold">
                Réinitialiser
              </Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold text-roogo-neutral-900 font-urbanist">
              Filtres
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <X size={24} color={tokens.colors.roogo.neutral[900]} />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1 px-6 py-6"
            showsVerticalScrollIndicator={false}
          >
            {/* Neighborhood Chips */}
            <FilterSection title="Quartier">
              <View className="flex-row flex-wrap">
                {NEIGHBORHOODS.map((neighborhood) => (
                  <TouchableOpacity
                    key={neighborhood}
                    onPress={() => onFilterChange("neighborhood", neighborhood)}
                    className={`px-5 py-2 rounded-full mr-2 mb-2 border ${
                      filters.neighborhood === neighborhood
                        ? "bg-roogo-neutral-900 border-roogo-neutral-900"
                        : "bg-white border-roogo-neutral-200"
                    }`}
                  >
                    <Text
                      className={`font-semibold font-urbanist ${
                        filters.neighborhood === neighborhood
                          ? "text-white"
                          : "text-roogo-neutral-700"
                      }`}
                    >
                      {neighborhood === "Tous" ? "Tout" : neighborhood}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </FilterSection>

            {/* Price Histogram & Inputs */}
            <FilterSection title="Budget (CFA)">
              <View>
                {/* Histogram */}
                <View className="flex-row items-end h-24 mb-4">
                  {HISTOGRAM_DATA.map((h, i) => {
                    const barPrice = (i / HISTOGRAM_DATA.length) * MAX_PRICE;
                    const isActive =
                      barPrice >= localMinPrice && barPrice <= localMaxPrice;
                    return (
                      <HistogramBar
                        key={i}
                        heightPercent={h}
                        index={i}
                        isActive={isActive}
                      />
                    );
                  })}
                </View>

                {/* Custom Dual Range Slider */}
                <View className="mb-4 px-1">
                  <DualRangeSlider
                    minValue={localMinPrice}
                    maxValue={localMaxPrice}
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    step={STEP}
                    onMinChange={handleMinPriceChange}
                    onMaxChange={handleMaxPriceChange}
                  />
                </View>

                {/* Price Inputs */}
                <View className="flex-row justify-between gap-4">
                  <View className="flex-1">
                    <Text className="text-xs text-roogo-neutral-500 font-urbanist mb-1">
                      Minimum
                    </Text>
                    <View
                      style={{
                        backgroundColor: tokens.colors.roogo.neutral[100],
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: tokens.colors.border,
                      }}
                    >
                      <TextInput
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          fontSize: 16,
                          fontWeight: "600",
                          color: tokens.colors.roogo.neutral[900],
                        }}
                        value={formatPrice(localMinPrice)}
                        onChangeText={handleMinTextChange}
                        onBlur={handleMinTextSubmit}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-roogo-neutral-500 font-urbanist mb-1 text-right">
                      Maximum
                    </Text>
                    <View
                      style={{
                        backgroundColor: tokens.colors.roogo.neutral[100],
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: tokens.colors.border,
                      }}
                    >
                      <TextInput
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          fontSize: 16,
                          fontWeight: "600",
                          color: tokens.colors.roogo.neutral[900],
                          textAlign: "right",
                        }}
                        value={formatPrice(localMaxPrice)}
                        onChangeText={handleMaxTextChange}
                        onBlur={handleMaxTextSubmit}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>
              </View>
            </FilterSection>

            {/* Layout: Surface (Split) */}
            <FilterSection title="Surface (m²)">
              <View className="flex-row gap-4">
                <FilterDropdown
                  dropdownKey="minArea"
                  value={filters.minArea}
                  options={[0, ...SURFACE_OPTIONS.filter((v) => v > 0)]}
                  onSelect={(val) => onFilterChange("minArea", val)}
                  placeholder="Min"
                />
                <FilterDropdown
                  dropdownKey="maxArea"
                  value={filters.maxArea}
                  options={[0, ...SURFACE_OPTIONS.filter((v) => v > 0)]}
                  onSelect={(val) => onFilterChange("maxArea", val)}
                  placeholder="Max"
                />
              </View>
            </FilterSection>

            {/* Layout: Bed & Bath (Alternating Row) */}
            <View className="flex-row gap-4 mb-8">
              <View className="flex-1">
                <FilterSection title="Chambres">
                  <FilterDropdown
                    dropdownKey="bedrooms"
                    value={filters.bedrooms}
                    options={BEDROOM_OPTIONS}
                    onSelect={(val) =>
                      onFilterChange("bedrooms", val || "Tous")
                    }
                    placeholder="Indifférent"
                  />
                </FilterSection>
              </View>
              <View className="flex-1">
                <FilterSection title="Bains">
                  <FilterDropdown
                    dropdownKey="bathrooms"
                    value={filters.bathrooms}
                    options={BATHROOM_OPTIONS}
                    onSelect={(val) =>
                      onFilterChange("bathrooms", val || "Tous")
                    }
                    placeholder="Indifférent"
                  />
                </FilterSection>
              </View>
            </View>

            {/* Layout: Parking (Full Width) */}
            <FilterSection title="Parking">
              <FilterDropdown
                dropdownKey="parking"
                value={filters.parking}
                options={PARKING_OPTIONS}
                onSelect={(val) => onFilterChange("parking", val || "Tous")}
                placeholder="Indifférent"
              />
            </FilterSection>

            {/* Extra space at bottom for last dropdown to expand fully */}
            <View className="h-72" />
          </ScrollView>

          {/* Bottom Action */}
          <View
            className="p-6 bg-white border-t border-roogo-neutral-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 10,
            }}
          >
            <TouchableOpacity
              onPress={onClose}
              className="bg-roogo-primary-500 w-full py-4 rounded-full items-center shadow-lg shadow-roogo-primary-500/30"
            >
              <Text className="text-white font-bold font-urbanist text-lg">
                Voir {resultsCount} résultats
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
}
