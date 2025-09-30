import { Heart, MapPin } from "lucide-react-native";
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
  };
  isHorizontal?: boolean;
}

// Format price with dots for thousands separator
const formatPrice = (price: string) => {
  return price.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function PropertyCard({
  property,
  isHorizontal = false,
}: PropertyCardProps) {
  return (
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
        {/* For Sale Tag */}
        <View className="absolute top-3 left-3 bg-green-500 px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-semibold">À Vendre</Text>
        </View>
        {/* Heart Icon */}
        <TouchableOpacity className="absolute top-3 right-3 bg-white/20 p-2 rounded-full">
          <Heart size={20} color="white" />
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
              {property.area}
            </Text>
            {property.parking && (
              <>
                <Text className="text-gray-400 text-sm"> | </Text>
                <Text className="text-gray-700 text-sm font-medium">
                  {property.parking} parking
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
