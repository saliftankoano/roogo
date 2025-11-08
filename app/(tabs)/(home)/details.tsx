import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Ban,
  Bath,
  BedDouble,
  Camera,
  Car,
  DollarSign,
  Heart,
  MapPin,
  Ruler,
  Share2,
  Shield,
  Sofa,
  Sun,
  Trees,
  Tv,
  Waves,
  Wifi,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AgentCard from "../../components/AgentCard";
import ContactSheet from "../../components/ContactSheet";
import PhotoGallery from "../../components/PhotoGallery";
import type { Property } from "../../constants/properties";
import { properties } from "../../constants/properties";

const formatPrice = (price: string) =>
  price.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export default function PropertyDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isContactSheetVisible, setIsContactSheetVisible] = useState(false);
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);

  const property: Property | undefined = useMemo(() => {
    if (!id) return undefined;
    const numericId = Array.isArray(id)
      ? parseInt(id[0], 10)
      : parseInt(id, 10);
    if (Number.isNaN(numericId)) return undefined;
    return properties.find((item) => item.id === numericId);
  }, [id]);

  if (!property) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <StatusBar barStyle="dark-content" />
        <Text className="text-lg font-semibold text-gray-800">
          Propriété introuvable.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-500 rounded-full"
        >
          <Text className="text-white font-semibold">Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="bg-transparent"
      >
        <View className="relative">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              const images = property.images || [property.image];
              if (images.length > 0) {
                setGalleryInitialIndex(0);
                setIsGalleryVisible(true);
              }
            }}
          >
            <Image source={property.image} className="w-full h-[360px]" />

            {/* Photo Counter Badge */}
            {((property.images && property.images.length > 1) ||
              (!property.images && property.image)) && (
              <View className="absolute bottom-4 right-4 bg-black/70 px-3 py-2 rounded-full flex-row items-center">
                <Camera size={16} color="white" />
                <Text className="ml-2 text-white text-sm font-semibold font-urbanist">
                  {property.images ? property.images.length : 1} photo
                  {property.images && property.images.length > 1 ? "s" : ""}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Photo Thumbnails */}
          {property.images && property.images.length > 1 && (
            <View className="absolute bottom-4 left-4 flex-row gap-2">
              {property.images.slice(0, 3).map((img, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.9}
                  onPress={() => {
                    setGalleryInitialIndex(index);
                    setIsGalleryVisible(true);
                  }}
                  className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}
                >
                  <Image
                    source={img}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View className="absolute top-6 left-4 right-4 flex-row justify-between items-center">
            <TouchableOpacity
              className="bg-white/90 rounded-full px-4 py-3 flex-row items-center"
              onPress={() => router.back()}
            >
              <ArrowLeft size={20} color="#111827" />
              <Text className="ml-2 text-sm font-semibold text-gray-900">
                Retour
              </Text>
            </TouchableOpacity>
            <View className="flex-row gap-2">
              <TouchableOpacity className="bg-white/90 w-12 h-12 rounded-full items-center justify-center">
                <Share2 size={20} color="#111827" />
              </TouchableOpacity>
              <TouchableOpacity className="bg-white/90 w-12 h-12 rounded-full items-center justify-center">
                <Heart size={20} color="#111827" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="px-6 py-6 bg-white mt-6 rounded-3xl mx-4">
          {/* Price & Address */}
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              {formatPrice(property.price)} CFA
              {property.period ? `/${property.period}` : ""}
            </Text>
          </View>

          {/* Property High Level Details */}
          <View className="flex-row flex-wrap gap-6 mb-6 mt-4">
            {/* Bedrooms */}
            <View className="flex-row justify-center items-center space-x-2">
              <BedDouble size={15} color="#666666" />
              <Text className="text-gray-600 text-sm pl-1">
                {property.bedrooms}{" "}
                {property.bedrooms === 1 ? "Chambre" : "Chambres"}
              </Text>
            </View>
            {/* Bathrooms */}
            <View className="flex-row items-center space-x-2">
              <Bath size={15} color="#666666" />
              <Text className="text-gray-600 text-sm pl-1">
                {property.bathrooms}{" "}
                {property.bathrooms === 1 ? "Salle de bain" : "Salles de bain"}
              </Text>
            </View>
            {/* Area */}
            <View className="flex-row items-center space-x-2">
              <Ruler size={15} color="#666666" />
              <Text className="text-gray-600 text-sm pl-1">
                {property.area} m²
              </Text>
            </View>
            {/* Parking */}
            <View className="flex-row items-center space-x-2">
              <Car size={15} color="#666666" />
              <Text className="text-gray-600 text-sm pl-1">
                {property.parking}{" "}
                {property.parking === 1 ? "Véhicule" : "Véhicules"}
              </Text>
            </View>
            {/* Swimming Pool */}
            {property.amenities.some((amenity) =>
              amenity.toLowerCase().includes("piscine")
            ) && (
              <View className="flex-row items-center space-x-2">
                <Waves size={15} color="#666666" />
                <Text className="text-gray-600 text-sm pl-1">Piscine</Text>
              </View>
            )}
            {/* Furnished Status */}
            {property.description.toLowerCase().includes("meubl") && (
              <View className="flex-row items-center space-x-2">
                <Sofa size={15} color="#666666" />
                <Text className="text-gray-600 text-sm pl-1">Meublé</Text>
              </View>
            )}
          </View>
          {/* Description */}
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Description
          </Text>
          <Text className="text-sm leading-6 text-gray-600">
            {property.description}
          </Text>
        </View>

        <View className="px-6 py-6 bg-white mt-4 rounded-3xl mx-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Adresse
          </Text>
          <View className="flex-row items-center">
            <MapPin size={18} color="#2563EB" />
            <Text className="ml-2 text-sm text-gray-600 flex-1">
              {property.address}
            </Text>
          </View>
        </View>

        {/* Rental Requirements */}
        {(property.deposit ||
          (property.prohibitions && property.prohibitions.length > 0)) && (
          <View className="px-6 py-6 bg-white mt-4 rounded-3xl mx-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Conditions de location
            </Text>

            {/* Deposit */}
            {property.deposit && (
              <View className="mb-4 pb-4 border-b border-gray-100">
                <View className="flex-row items-center mb-2">
                  <View className="bg-orange-50 p-2 rounded-full mr-3">
                    <DollarSign size={20} color="#E48C26" />
                  </View>
                  <Text className="text-base font-semibold text-gray-900">
                    Caution
                  </Text>
                </View>
                <Text className="text-sm text-gray-600 ml-12">
                  {property.deposit} {property.deposit === 1 ? "mois" : "mois"}{" "}
                  de loyer
                </Text>
                <Text className="text-xs text-gray-500 ml-12 mt-1">
                  ({formatPrice(property.price)} × {property.deposit} ={" "}
                  {formatPrice(
                    String(Number(property.price) * property.deposit)
                  )}{" "}
                  CFA)
                </Text>
              </View>
            )}

            {/* Prohibitions */}
            {property.prohibitions && property.prohibitions.length > 0 && (
              <View>
                <View className="flex-row items-center mb-3">
                  <View className="bg-red-50 p-2 rounded-full mr-3">
                    <Ban size={20} color="#EF4444" />
                  </View>
                  <Text className="text-base font-semibold text-gray-900">
                    Interdictions
                  </Text>
                </View>
                <View className="ml-12">
                  {property.prohibitions.map((prohibition, index) => (
                    <View key={index} className="flex-row items-center mb-2">
                      <View className="w-1.5 h-1.5 rounded-full bg-red-500 mr-3" />
                      <Text className="text-sm text-gray-700">
                        {prohibition}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        <View className="px-6 py-6 bg-white mt-4 rounded-3xl mx-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Équipements
          </Text>
          <View className="flex-row flex-wrap gap-4">
            <View className="flex-row items-center space-x-2 w-[30%]">
              <View className="bg-blue-50 p-2 rounded-full">
                <Wifi size={20} color="#2563EB" />
              </View>
              <Text className="text-gray-700 text-sm">Fibre optique</Text>
            </View>
            <View className="flex-row items-center space-x-2 w-[30%]">
              <View className="bg-blue-50 p-2 rounded-full">
                <Shield size={20} color="#2563EB" />
              </View>
              <Text className="text-gray-700 text-sm">Sécurité 24/7</Text>
            </View>
            <View className="flex-row items-center space-x-2 w-[30%]">
              <View className="bg-blue-50 p-2 rounded-full">
                <Waves size={20} color="#2563EB" />
              </View>
              <Text className="text-gray-700 text-sm">Piscine privée</Text>
            </View>
            <View className="flex-row items-center space-x-2 w-[30%]">
              <View className="bg-blue-50 p-2 rounded-full">
                <Tv size={20} color="#2563EB" />
              </View>
              <Text className="text-gray-700 text-sm">Salle cinéma</Text>
            </View>
            <View className="flex-row items-center space-x-2 w-[30%]">
              <View className="bg-blue-50 p-2 rounded-full">
                <Sun size={20} color="#2563EB" />
              </View>
              <Text className="text-gray-700 text-sm">Panneaux solaires</Text>
            </View>
            <View className="flex-row items-center space-x-2 w-[30%]">
              <View className="bg-blue-50 p-2 rounded-full">
                <Trees size={20} color="#2563EB" />
              </View>
              <Text className="text-gray-700 text-sm">Jardin privé</Text>
            </View>
          </View>
        </View>
        {/* Add padding at bottom to prevent content from being hidden behind the agent section */}
        <View className="h-24" />
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-2">
        {property.agent ? (
          <View className="shadow-lg shadow-black/10">
            <AgentCard
              agent={property.agent}
              onContactPress={() => setIsContactSheetVisible(true)}
            />
          </View>
        ) : (
          <TouchableOpacity
            className="bg-blue-500 py-4 rounded-2xl items-center"
            onPress={() => setIsContactSheetVisible(true)}
            accessibilityLabel="Contacter l'agent"
            accessibilityRole="button"
          >
            <Text className="text-white text-lg font-semibold">
              Contactez l&apos;agent
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ContactSheet
        visible={isContactSheetVisible}
        onClose={() => setIsContactSheetVisible(false)}
        property={property}
      />

      <PhotoGallery
        visible={isGalleryVisible}
        images={property.images || [property.image]}
        initialIndex={galleryInitialIndex}
        onClose={() => setIsGalleryVisible(false)}
      />
    </SafeAreaView>
  );
}
