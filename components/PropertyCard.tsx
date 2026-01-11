import { tokens } from "../theme/tokens";
import { formatPrice } from "../utils/formatting";
import { useUser } from "@clerk/clerk-expo";
import { useUserType } from "../hooks/useUserType";
import {
  BathtubIcon,
  BedIcon,
  EyeIcon,
  HeartIcon,
  MapPinIcon,
  PencilIcon,
  RulerIcon,
  ShareIcon,
  TrashIcon,
} from "phosphor-react-native";
import React, { useRef, useState } from "react";
import {
  Animated,
  Image,
  Share,
  Text,
  TouchableOpacity,
  View,
  Easing,
} from "react-native";
import AuthPromptModal from "./AuthPromptModal";

interface PropertyCardProps {
  property: {
    id: number | string;
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
    isSponsored?: boolean;
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
  showFavorite?: boolean;
}

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
  showFavorite = true,
}: PropertyCardProps) {
  const [localIsFavorite, setLocalIsFavorite] = useState(
    propIsFavorite ?? false
  );
  const [authPromptVisible, setAuthPromptVisible] = useState(false);
  const { user } = useUser();
  const { isOwner } = useUserType();
  const isAuthenticated = !!user;
  const isFavorite = propIsFavorite ?? localIsFavorite;
  const dividerAnimation = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(1)).current;

  // Owners shouldn't see or use the favorite feature
  const shouldShowFavorite = showFavorite && !isOwner;

  const handleFavoritePress = () => {
    if (!isAuthenticated) {
      setAuthPromptVisible(true);
      return;
    }

    // Animate heart
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
    ]).start();

    if (onToggleFavorite) {
      onToggleFavorite();
    } else {
      setLocalIsFavorite(!localIsFavorite);
    }
  };

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
      className={`bg-white rounded-3xl overflow-hidden mb-6 ${
        isHorizontal ? "mr-4 w-[280px]" : ""
      }`}
      style={{
        shadowColor: property.isSponsored
          ? tokens.colors.roogo.primary[500]
          : "#000",
        shadowOffset: {
          width: 0,
          height: property.isSponsored ? 6 : 4,
        },
        shadowOpacity: property.isSponsored ? 0.15 : 0.06,
        shadowRadius: property.isSponsored ? 16 : 12,
        elevation: property.isSponsored ? 8 : 4,
        borderWidth: property.isSponsored ? 1.5 : 0,
        borderColor: tokens.colors.roogo.primary[500],
      }}
    >
      {/* Image Section */}
      <View className="relative">
        <Image
          source={
            property.image &&
            typeof property.image === "object" &&
            property.image.uri
              ? { uri: property.image.uri }
              : typeof property.image === "number"
                ? property.image
                : typeof property.image === "string"
                  ? { uri: property.image }
                  : {
                      uri: "https://via.placeholder.com/400x300?text=Pas+d%27image",
                    }
          }
          className="w-full h-[240px] bg-roogo-neutral-100"
          resizeMode="cover"
        />
        {/* Floating Category Tag */}
        <View
          className={`absolute top-4 left-4 px-4 py-1.5 rounded-full shadow-sm ${
            property.category === "Residential"
              ? "bg-roogo-primary-500"
              : "bg-roogo-accent-600"
          }`}
        >
          <Text className="text-white text-xs font-bold font-urbanist tracking-wide uppercase">
            {property.category === "Residential" ? "Résidentiel" : "Business"}
          </Text>
        </View>
        {/* Heart Icon */}
        {shouldShowFavorite && (
          <TouchableOpacity
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-sm"
            onPress={handleFavoritePress}
            activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <HeartIcon
                size={20}
                color={
                  isFavorite
                    ? tokens.colors.roogo.error
                    : tokens.colors.roogo.neutral[900]
                }
                weight={isFavorite ? "fill" : "regular"}
              />
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>

      {/* Content Section */}
      <View className="p-5">
        {/* Title and Price Row */}
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-2">
            <Text className="text-xl font-bold text-roogo-neutral-900 font-urbanist leading-tight">
              {property.title}
            </Text>
            <View className="flex-row items-center mt-1">
              <MapPinIcon size={14} color={tokens.colors.roogo.neutral[500]} />
              <Text className="ml-1 text-roogo-neutral-500 text-sm font-medium">
                {property.location}
              </Text>
            </View>
          </View>
          <Text className="text-xl font-bold text-roogo-primary-500 font-urbanist">
            {formatPrice(property.price)}
            <Text className="text-sm font-normal text-roogo-neutral-500">
              {property.period ? `/${property.period}` : ""}
            </Text>
          </Text>
        </View>

        {/* Property Features Chips */}
        <View className="flex-row flex-wrap mt-3">
          <View className="flex-row items-center bg-roogo-neutral-100 px-3 py-1.5 rounded-lg mr-3 mb-2">
            <BedIcon size={16} color={tokens.colors.roogo.neutral[700]} />
            <Text className="ml-1.5 text-sm font-semibold text-roogo-neutral-700 font-urbanist">
              {property.bedrooms} Beds
            </Text>
          </View>
          <View className="flex-row items-center bg-roogo-neutral-100 px-3 py-1.5 rounded-lg mr-3 mb-2">
            <BathtubIcon size={16} color={tokens.colors.roogo.neutral[700]} />
            <Text className="ml-1.5 text-sm font-semibold text-roogo-neutral-700 font-urbanist">
              {property.bathrooms} Baths
            </Text>
          </View>
          <View className="flex-row items-center bg-roogo-neutral-100 px-3 py-1.5 rounded-lg mb-2">
            <RulerIcon size={16} color={tokens.colors.roogo.neutral[700]} />
            <Text className="ml-1.5 text-sm font-semibold text-roogo-neutral-700 font-urbanist">
              {property.area} m²
            </Text>
          </View>
        </View>

        {/* Stats Section - Only render if there are stats */}
        {showStats &&
          property.views !== undefined &&
          property.favorites !== undefined && (
            <View className="mt-4 pt-2">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center space-x-4">
                  <View className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                    <EyeIcon size={16} color="#6B7280" />
                    <Text className="ml-1.5 text-gray-700 font-medium font-urbanist">
                      {property.views}
                    </Text>
                  </View>
                  <View className="flex-row items-center bg-red-50 px-3 py-1.5 rounded-lg">
                    <HeartIcon size={16} color="#EF4444" weight="fill" />
                    <Text className="ml-1.5 text-red-700 font-medium font-urbanist">
                      {property.favorites}
                    </Text>
                  </View>
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
                  <ShareIcon size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>
          )}

        {/* Action Buttons */}
        {showActions && (
          <View className="mt-4">
            <View className="flex-row justify-between items-center gap-3">
              {onDelete && (
                <TouchableOpacity
                  onPress={onDelete}
                  className="flex-1 flex-row items-center justify-center bg-red-50 px-4 py-3 rounded-xl"
                >
                  <TrashIcon size={18} color="#DC2626" />
                  <Text className="ml-2 text-red-700 font-bold font-urbanist">
                    Supprimer
                  </Text>
                </TouchableOpacity>
              )}
              {onEdit && (
                <TouchableOpacity
                  onPress={onEdit}
                  className="flex-1 flex-row items-center justify-center bg-roogo-primary-500 px-4 py-3 rounded-xl"
                  style={{
                    shadowColor: tokens.colors.roogo.primary[500],
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <PencilIcon size={18} color="white" />
                  <Text className="ml-2 text-white font-bold font-urbanist">
                    Modifier
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onPress}
          className={isHorizontal ? "mr-4" : "mb-4"}
        >
          {content}
        </TouchableOpacity>
        <AuthPromptModal
          visible={authPromptVisible}
          onClose={() => setAuthPromptVisible(false)}
          title="Enregistrez vos favoris"
          description="Connectez-vous pour sauvegarder vos propriétés favorites"
        />
      </>
    );
  }

  return (
    <>
      {content}
      <AuthPromptModal
        visible={authPromptVisible}
        onClose={() => setAuthPromptVisible(false)}
        title="Enregistrez vos favoris"
        description="Connectez-vous pour sauvegarder vos propriétés favorites"
      />
    </>
  );
}
