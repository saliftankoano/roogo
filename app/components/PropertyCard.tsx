import {
  Bath,
  BedDouble,
  Car,
  Eye,
  Heart,
  MapPin,
  Pencil,
  Ruler,
  Share2,
  Trash2,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Animated,
  Image,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PropertyCardProps {
  property: {
    id: number;
    title: string;
    location: string;
    price: string;
    bedrooms: number;
    bathrooms: number;
    area: string;
    parking: number;
    period?: string;
    image: any;
    category: "Residential" | "Business";
    views?: number;
    favorites?: number;
  };
  isHorizontal?: boolean;
  onPress?: () => void;
  showStats?: boolean;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

// Format price with dots for thousands separator
const formatPrice = (price: string) => {
  return price.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function PropertyCard({
  property,
  isHorizontal = false,
  onPress,
  showStats = false,
  showActions = false,
  onEdit,
  onDelete,
  isFavorite: propIsFavorite,
  onToggleFavorite,
}: PropertyCardProps) {
  const [localIsFavorite, setLocalIsFavorite] = useState(
    propIsFavorite ?? false
  );
  const isFavorite = propIsFavorite ?? localIsFavorite;
  const dividerAnimation = useRef(new Animated.Value(0)).current;

  // Animate divider on mount
  React.useEffect(() => {
    Animated.timing(dividerAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [dividerAnimation]);
  const content = (
    <View
      className={`bg-white rounded-2xl overflow-hidden border border-gray-200 pb-2 ${
        isHorizontal ? "mr-4" : "mb-4"
      }`}
      style={isHorizontal ? { width: 280 } : {}}
    >
      {/* Image Section */}
      <View className="relative">
        <Image
          source={property.image}
          className="w-full h-[200px]"
          resizeMode="cover"
        />
        {/* Property Category Tag */}
        <View
          className={`absolute top-3 left-3 ${
            property.category === "Residential"
              ? "bg-[#E48C26]"
              : "bg-[#2563EB]"
          } px-3 py-1 rounded-full`}
        >
          <Text className="text-white text-xs font-semibold font-urbanist">
            {property.category === "Residential" ? "Résidentiel" : "Business"}
          </Text>
        </View>
        {/* Heart Icon */}
        <TouchableOpacity
          className="absolute top-3 right-3 bg-gray-900/50 p-2.5 rounded-full"
          onPress={() => {
            if (onToggleFavorite) {
              onToggleFavorite();
            } else {
              setLocalIsFavorite(!localIsFavorite);
            }
          }}
        >
          <Heart
            size={24}
            color={isFavorite ? "#FF4B4B" : "white"}
            strokeWidth={2.5}
            fill={isFavorite ? "#FF4B4B" : "transparent"}
          />
        </TouchableOpacity>
      </View>

      {/* Content Section */}
      <View className="p-4 bg-white">
        {/* Title and Location */}
        <View className="mb-2">
          <Text className="text-xl font-bold text-gray-900 mb-1">
            {property.title}
          </Text>
          <View className="flex-row items-center">
            <MapPin size={16} color="#6B7280" />
            <Text className="ml-1 text-gray-600 text-sm">
              {property.location}
            </Text>
          </View>
        </View>

        {/* Price */}
        <Text className="text-green-600 text-2xl font-bold mb-4 text-right">
          {formatPrice(property.price)} CFA
          {property.period ? `/${property.period}` : ""}
        </Text>

        {/* Property Details */}
        <View
          className="flex-row items-center py-4 rounded-2xl"
          style={{
            backgroundColor: "white",
            borderWidth: 1,
            borderColor: "#E8E8E8",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 8,
            elevation: 2,
            paddingHorizontal: isHorizontal ? 8 : 12,
          }}
        >
          <View className="flex-1 items-center">
            <View
              className="rounded-full items-center justify-center mb-2"
              style={{
                backgroundColor: "#F8F8F8",
                width: isHorizontal ? 36 : 40,
                height: isHorizontal ? 36 : 40,
              }}
            >
              <BedDouble
                size={isHorizontal ? 18 : 20}
                color="#374151"
                strokeWidth={2}
              />
            </View>
            <Text
              className="font-bold text-figma-grey-900 font-urbanist"
              style={{ fontSize: isHorizontal ? 20 : 24 }}
            >
              {property.bedrooms}
            </Text>
            <Text
              className="text-figma-grey-700 mt-1 font-urbanist"
              style={{
                letterSpacing: 0.5,
                fontSize: isHorizontal ? 10 : 12,
              }}
            >
              Chambres
            </Text>
          </View>

          <View
            style={{
              width: 1,
              height: 50,
              backgroundColor: "#F0F0F0",
            }}
          />

          <View className="flex-1 items-center">
            <View
              className="rounded-full items-center justify-center mb-2"
              style={{
                backgroundColor: "#F8F8F8",
                width: isHorizontal ? 36 : 40,
                height: isHorizontal ? 36 : 40,
              }}
            >
              <Bath
                size={isHorizontal ? 18 : 20}
                color="#374151"
                strokeWidth={2}
              />
            </View>
            <Text
              className="font-bold text-figma-grey-900 font-urbanist"
              style={{ fontSize: isHorizontal ? 20 : 24 }}
            >
              {property.bathrooms}
            </Text>
            <Text
              className="text-figma-grey-700 mt-1 font-urbanist"
              style={{
                letterSpacing: 0.5,
                fontSize: isHorizontal ? 10 : 12,
              }}
            >
              Douches
            </Text>
          </View>

          <View
            style={{
              width: 1,
              height: 50,
              backgroundColor: "#F0F0F0",
            }}
          />

          <View className="flex-1 items-center">
            <View
              className="rounded-full items-center justify-center mb-2"
              style={{
                backgroundColor: "#F8F8F8",
                width: isHorizontal ? 36 : 40,
                height: isHorizontal ? 36 : 40,
              }}
            >
              <Ruler
                size={isHorizontal ? 18 : 20}
                color="#374151"
                strokeWidth={2}
              />
            </View>
            <Text
              className="font-bold text-figma-grey-900 font-urbanist"
              style={{ fontSize: isHorizontal ? 20 : 24 }}
            >
              {property.area}
            </Text>
            <Text
              className="text-figma-grey-700 mt-1 font-urbanist"
              style={{
                letterSpacing: 0.5,
                fontSize: isHorizontal ? 10 : 12,
              }}
            >
              m²
            </Text>
          </View>

          {property.parking > 0 && !isHorizontal && (
            <>
              <View
                style={{
                  width: 1,
                  height: 50,
                  backgroundColor: "#F0F0F0",
                }}
              />

              <View className="flex-1 items-center">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: "#F8F8F8" }}
                >
                  <Car size={20} color="#374151" strokeWidth={2} />
                </View>
                <Text className="text-2xl font-bold text-figma-grey-900 font-urbanist">
                  {property.parking}
                </Text>
                <Text
                  className="text-xs text-figma-grey-700 mt-1 font-urbanist"
                  style={{ letterSpacing: 0.5 }}
                >
                  Parking
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Stats Section - Only render if there are stats */}
        {showStats &&
          property.views !== undefined &&
          property.favorites !== undefined && (
            <Animated.View
              className="mt-4 pt-4"
              style={{
                borderTopWidth: 1,
                borderTopColor: dividerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [
                    "rgba(243, 244, 246, 0)",
                    "rgba(243, 244, 246, 1)",
                  ],
                }),
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center space-x-4">
                  <TouchableOpacity
                    className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-lg"
                    onPress={() => {}}
                  >
                    <Eye size={16} color="#6B7280" />
                    <Text className="ml-1.5 text-gray-700 font-medium">
                      {property.views}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-row items-center bg-red-50 px-3 py-1.5 rounded-lg"
                    onPress={() => {
                      if (onToggleFavorite) {
                        onToggleFavorite();
                      } else {
                        setLocalIsFavorite(!localIsFavorite);
                      }
                    }}
                  >
                    <Heart
                      size={16}
                      color="#EF4444"
                      fill={isFavorite ? "#EF4444" : "transparent"}
                    />
                    <Text className="ml-1.5 text-red-700 font-medium">
                      {property.favorites + (isFavorite ? 1 : 0)}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  className="bg-gray-50 p-2 rounded-lg"
                  onPress={async () => {
                    try {
                      await Share.share({
                        message: `Découvrez cette propriété: ${property.title} à ${property.location} - ${property.price} CFA`,
                        title: "Partager la propriété",
                      });
                    } catch (error) {
                      console.error(error);
                    }
                  }}
                >
                  <Share2 size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

        {/* Action Buttons */}
        {showActions && (
          <Animated.View
            className="mt-4 pt-4"
            style={{
              borderTopWidth: 1,
              borderTopColor: dividerAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [
                  "rgba(243, 244, 246, 0)",
                  "rgba(243, 244, 246, 1)",
                ],
              }),
            }}
          >
            <View className="flex-row justify-between items-center">
              {onDelete && (
                <TouchableOpacity
                  onPress={onDelete}
                  className="flex-1 flex-row items-center justify-center bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl mr-2"
                  style={{
                    shadowColor: "#EF4444",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                >
                  <Trash2 size={18} color="#DC2626" />
                  <Text className="ml-2 text-red-700 font-medium">
                    Supprimer
                  </Text>
                </TouchableOpacity>
              )}
              {onEdit && (
                <TouchableOpacity
                  onPress={onEdit}
                  className="flex-1 flex-row items-center justify-center bg-blue-500 hover:bg-blue-600 px-4 py-2.5 rounded-xl"
                  style={{
                    shadowColor: "#2563EB",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                >
                  <Pencil size={18} color="white" />
                  <Text className="ml-2 text-white font-medium">Modifier</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        className={isHorizontal ? "mr-4" : "mb-4"}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}
