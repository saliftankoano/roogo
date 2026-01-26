import { tokens } from "@/theme/tokens";
import { formatCurrency } from "@/utils/formatting";
import { useUser } from "@clerk/clerk-expo";
import { useUserType } from "@/hooks/useUserType";
import {
  EyeIcon,
  HeartIcon,
  MapPinIcon,
  PencilIcon,
  ShareIcon,
  TrashIcon,
  LightningIcon,
  FireIcon,
  SealCheckIcon,
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
import { Video, ResizeMode } from "expo-av";
import AuthPromptModal from "@/components/auth/AuthPromptModal";

const isVideo = (image: any) => {
  if (typeof image === "object" && image.uri) {
    const uri = image.uri.toLowerCase();
    return (
      uri.endsWith(".mp4") ||
      uri.endsWith(".mov") ||
      uri.endsWith(".avi") ||
      uri.endsWith(".mkv") ||
      uri.endsWith(".webm")
    );
  }
  return false;
};

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
    recentViews?: number;
    status?: string;
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
    propIsFavorite ?? false,
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

  const imageSource =
    property.image && typeof property.image === "object" && property.image.uri
      ? { uri: property.image.uri }
      : typeof property.image === "number"
        ? property.image
        : typeof property.image === "string"
          ? { uri: property.image }
          : {
              uri: "https://via.placeholder.com/400x300?text=Pas+d%27image",
            };

  const content = (
    <View
      className={`bg-white rounded-2xl overflow-hidden mb-4 ${
        isHorizontal ? "mr-4 w-[260px]" : ""
      }`}
      style={{
        shadowColor: property.isSponsored
          ? tokens.colors.roogo.primary[500]
          : "#000",
        shadowOffset: {
          width: 0,
          height: property.isSponsored ? 4 : 2,
        },
        shadowOpacity: property.isSponsored ? 0.12 : 0.05,
        shadowRadius: property.isSponsored ? 12 : 8,
        elevation: property.isSponsored ? 6 : 3,
        borderWidth: property.isSponsored ? 1.5 : 0,
        borderColor: tokens.colors.roogo.primary[500],
      }}
    >
      {/* Image Section */}
      <View className="relative">
        {isVideo(imageSource) ? (
          <Video
            source={imageSource}
            style={{
              width: "100%",
              aspectRatio: 16 / 9,
              backgroundColor: tokens.colors.roogo.neutral[100],
            }}
            resizeMode={ResizeMode.COVER}
            shouldPlay={false}
            isMuted={true}
            onError={() => {}}
          />
        ) : (
          <Image
            source={imageSource}
            className="w-full bg-roogo-neutral-100"
            style={{ aspectRatio: 16 / 9 }}
            resizeMode="cover"
          />
        )}
        {/* Floating Category Tag */}
        <View
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full shadow-sm ${
            property.category === "Residential"
              ? "bg-roogo-primary-500"
              : "bg-roogo-accent-600"
          }`}
        >
          <Text className="text-white text-[10px] font-bold font-urbanist tracking-wide uppercase">
            {property.category === "Residential" ? "Résidentiel" : "Business"}
          </Text>
        </View>
        {/* Sponsored Badge */}
        {property.isSponsored && (
          <View className="absolute top-3 left-28 flex-row items-center bg-white px-2 py-1 rounded-full shadow-md border border-roogo-primary-500/30">
            <LightningIcon
              size={10}
              weight="fill"
              color={tokens.colors.roogo.primary[500]}
            />
            <Text className="text-roogo-primary-500 text-[9px] font-black font-urbanist tracking-tighter uppercase ml-1">
              À LA UNE
            </Text>
          </View>
        )}

        {/* Trending Badge */}
        {!property.isSponsored && (property.recentViews || 0) > 10 && (
          <View className="absolute top-3 left-28 flex-row items-center bg-roogo-error/90 px-2 py-1 rounded-full shadow-md backdrop-blur-md">
            <FireIcon size={10} weight="fill" color="white" />
            <Text className="text-white text-[9px] font-black font-urbanist tracking-tighter uppercase ml-1">
              POPULAIRE
            </Text>
          </View>
        )}

        {/* Heart Icon */}
        {shouldShowFavorite && (
          <TouchableOpacity
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-sm"
            onPress={handleFavoritePress}
            activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <HeartIcon
                size={18}
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

        {/* Verified Badge */}
        {property.status === "en_ligne" && (
          <View className="absolute bottom-3 left-3 flex-row items-center bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-md border border-green-200">
            <SealCheckIcon size={14} weight="fill" color="#16A34A" />
            <Text className="text-green-700 text-[10px] font-bold font-urbanist tracking-tight uppercase ml-1">
              Vérifié
            </Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View className="p-3">
        {/* Title and Price Row */}
        <View className="flex-row justify-between items-start mb-1">
          <View className="flex-1 mr-2">
            <Text
              numberOfLines={1}
              className="text-lg font-bold text-roogo-neutral-900 font-urbanist leading-tight"
            >
              {property.title}
            </Text>
            <View className="flex-row items-center mt-0.5">
              <MapPinIcon size={12} color={tokens.colors.roogo.neutral[500]} />
              <Text
                numberOfLines={1}
                className="ml-1 text-roogo-neutral-500 text-xs font-medium"
              >
                {property.location}
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-lg font-bold text-roogo-primary-500 font-urbanist">
              {formatCurrency(property.price)}
            </Text>
            {property.period && (
              <Text className="text-xs font-normal text-roogo-neutral-500 -mt-1">
                /{property.period}
              </Text>
            )}
          </View>
        </View>

        {/* Property Features Inline */}
        <Text
          numberOfLines={1}
          className="text-xs text-roogo-neutral-600 font-medium font-urbanist mt-1"
        >
          {property.bedrooms} Ch • {property.bathrooms} Douches • {property.area}{" "}
          m²
        </Text>

        {/* Stats Section */}
        {showStats &&
          property.views !== undefined &&
          property.favorites !== undefined && (
            <View className="mt-3 pt-2 border-t border-roogo-neutral-100">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center space-x-3">
                  <View className="flex-row items-center">
                    <EyeIcon size={14} color="#6B7280" />
                    <Text className="ml-1 text-xs text-gray-600 font-medium font-urbanist">
                      {property.views}
                    </Text>
                  </View>
                  <View className="flex-row items-center ml-3">
                    <HeartIcon size={14} color="#EF4444" weight="fill" />
                    <Text className="ml-1 text-xs text-gray-600 font-medium font-urbanist">
                      {property.favorites}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  className="bg-gray-50 p-1.5 rounded-lg"
                  onPress={async () => {
                    try {
                      await Share.share({
                        message: `Découvrez cette propriété: ${property.title} à ${property.location} - ${formatCurrency(property.price)}`,
                        title: "Partager la propriété",
                      });
                    } catch (error) {
                      console.error(error);
                    }
                  }}
                >
                  <ShareIcon size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>
          )}

        {/* Action Buttons */}
        {showActions && (
          <View className="mt-3 pt-2 border-t border-roogo-neutral-100">
            <View className="flex-row justify-between items-center gap-2">
              {onDelete && (
                <TouchableOpacity
                  onPress={onDelete}
                  className="flex-1 flex-row items-center justify-center bg-red-50 px-3 py-2 rounded-lg"
                >
                  <TrashIcon size={16} color="#DC2626" />
                  <Text className="ml-1.5 text-red-700 font-bold font-urbanist text-xs">
                    Supprimer
                  </Text>
                </TouchableOpacity>
              )}
              {onEdit && (
                <TouchableOpacity
                  onPress={onEdit}
                  className="flex-1 flex-row items-center justify-center bg-roogo-primary-500 px-3 py-2 rounded-lg"
                  style={{
                    shadowColor: tokens.colors.roogo.primary[500],
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <PencilIcon size={16} color="white" />
                  <Text className="ml-1.5 text-white font-bold font-urbanist text-xs">
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

