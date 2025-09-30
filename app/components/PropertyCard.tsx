import { Heart, MapPin } from "lucide-react-native";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

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
    category: "Louer" | "Acheter";
  };
  isHorizontal?: boolean;
  onPress?: () => void;
}

// Format price with dots for thousands separator
const formatPrice = (price: string) => {
  return price.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function PropertyCard({
  property,
  isHorizontal = false,
  onPress,
}: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
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
          className={`absolute top-3 left-3 ${property.category === "Louer" ? "bg-blue-500" : "bg-green-500"} px-3 py-1 rounded-full`}
        >
          <Text className="text-white text-xs font-semibold">
            {property.category === "Louer" ? "À Louer" : "À Vendre"}
          </Text>
        </View>
        {/* Heart Icon */}
        <TouchableOpacity
          className="absolute top-3 right-3 bg-gray-900/50 p-2.5 rounded-full"
          onPress={() => setIsFavorite(!isFavorite)}
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
        {/* Location and Price Row */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <MapPin size={16} color="#6B7280" />
            <Text className="ml-1 text-gray-600 text-sm">
              {property.location}
            </Text>
          </View>
          <Text className="text-green-600 text-lg font-bold">
            {formatPrice(property.price)} CFA
            {property.period ? `/${property.period}` : ""}
          </Text>
        </View>

        {/* Property Details Row */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-3">
            <Text className="text-gray-700 text-sm font-medium">
              {property.bedrooms} chambres
            </Text>
            <Text className="text-gray-400 text-sm"> | </Text>
            <Text className="text-gray-700 text-sm font-medium">
              {property.bathrooms} salles de bain(s)
            </Text>
            <Text className="text-gray-400 text-sm"> | </Text>
            <Text className="text-gray-700 text-sm font-medium">
              {property.area} m²
            </Text>
            {property.parking && (
              <>
                <Text className="text-gray-400 text-sm"> | </Text>
                <Text className="text-gray-700 text-sm font-medium">
                  {property.parking}{" "}
                  {property.parking === 1 ? "Véhicule" : "Véhicules"}
                </Text>
              </>
            )}
          </View>
        </View>
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
