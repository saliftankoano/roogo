import {
  Bath,
  BedDouble,
  ChevronLeft,
  Heart,
  MapPin,
  Ruler,
} from "lucide-react-native";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyValueRow } from "@/components/KeyValueRow";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Stepper } from "@/components/Stepper";
import type { ListingDraft } from "@/forms/listingSchema";
import {
  CITIES,
  EQUIPEMENTS,
  INTERDICTIONS,
  PROPERTY_TYPES,
} from "@/forms/listingSchema";
import { tokens } from "@/theme/tokens";

interface ListingStep3ScreenProps {
  navigation: any;
  formData: Partial<ListingDraft>;
  onBack: () => void;
  onSubmit: () => Promise<void>;
  errors: Record<string, string>;
}

export const ListingStep3Screen: React.FC<ListingStep3ScreenProps> = ({
  navigation,
  formData,
  onBack,
  onSubmit,
  errors,
}) => {
  const handlePublish = () => {
    onSubmit();
  };

  // Get labels for display
  const propertyTypeLabel =
    PROPERTY_TYPES.find((t) => t.id === formData.type)?.label || "";
  const villeLabel = CITIES.find((c) => c.id === formData.ville)?.label || "";
  const equipementsLabels =
    formData.equipements
      ?.map((eq) => EQUIPEMENTS.find((e) => e.id === eq)?.label)
      .filter(Boolean)
      .join(", ") || "Aucun";
  const interdictionsLabels =
    formData.interdictions
      ?.map((int) => INTERDICTIONS.find((i) => i.id === int)?.label)
      .filter(Boolean)
      .join(", ") || "Aucune";

  // Format price with dots
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formattedPrice = formData.prixMensuel
    ? `${formatPrice(formData.prixMensuel)} CFA/mois`
    : "";

  // Determine category based on property type
  const category = formData.type === "commercial" ? "Business" : "Residential";

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-roogo-neutral-100">
        <TouchableOpacity
          onPress={onBack}
          className="mr-4 p-2 -ml-2 rounded-full active:bg-roogo-neutral-100"
        >
          <ChevronLeft size={28} color={tokens.colors.roogo.neutral[900]} />
        </TouchableOpacity>
        <Text className="text-xl font-urbanist font-bold text-roogo-neutral-900">
          Ajouter une propriété
        </Text>
      </View>

      {/* Stepper */}
      <Stepper
        steps={[
          { id: 1, label: "Le bien" },
          { id: 2, label: "Photos & Équipements" },
          { id: 3, label: "Publication" },
        ]}
        currentStep={3}
        completedSteps={[1, 2]}
      />

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 20 }}
      >
        {/* Preview Card */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-roogo-neutral-900 mb-3 font-urbanist">
            Aperçu de l&apos;annonce
          </Text>

          {/* Actual PropertyCard Design - Compact Version */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#E5E5E5",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {/* Image Section */}
            <View style={{ position: "relative" }}>
              {formData.photos && formData.photos.length > 0 ? (
                <Image
                  source={{ uri: formData.photos[0].uri }}
                  style={{ width: "100%", height: 160 }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: 160,
                    backgroundColor: tokens.colors.roogo.neutral[100],
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: tokens.colors.roogo.neutral[500],
                      fontSize: 12,
                      fontFamily: "Urbanist-Medium",
                    }}
                  >
                    Aucune photo
                  </Text>
                </View>
              )}

              {/* Category Tag */}
              <View
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  backgroundColor:
                    category === "Residential"
                      ? tokens.colors.roogo.primary[500]
                      : tokens.colors.roogo.accent[600],
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 100,
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 11,
                    fontFamily: "Urbanist-Bold",
                  }}
                >
                  {category === "Residential" ? "Résidentiel" : "Business"}
                </Text>
              </View>

              {/* Heart Icon */}
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  backgroundColor: "rgba(0,0,0, 0.3)",
                  padding: 8,
                  borderRadius: 100,
                  backdropFilter: "blur(10px)",
                }}
              >
                <Heart size={18} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Content Section */}
            <View style={{ padding: 16, backgroundColor: "#FFFFFF" }}>
              {/* Title and Location */}
              <View className="mb-3">
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Urbanist-Bold",
                    color: tokens.colors.roogo.neutral[900],
                    marginBottom: 4,
                  }}
                  numberOfLines={1}
                >
                  {formData.titre || "Titre de l'annonce"}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MapPin size={14} color={tokens.colors.roogo.neutral[500]} />
                  <Text
                    style={{
                      marginLeft: 4,
                      color: tokens.colors.roogo.neutral[500],
                      fontSize: 13,
                      fontFamily: "Urbanist-Medium",
                    }}
                    numberOfLines={1}
                  >
                    {villeLabel}, {formData.quartier || "Quartier"}
                  </Text>
                </View>
              </View>

              {/* Price */}
              <Text
                style={{
                  color: tokens.colors.roogo.primary[500],
                  fontSize: 20,
                  fontFamily: "Urbanist-Bold",
                  marginBottom: 16,
                }}
              >
                {formattedPrice}
              </Text>

              {/* Property Details Grid - Compact */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: tokens.colors.roogo.neutral[100],
                  paddingHorizontal: 8,
                }}
              >
                {/* Bedrooms */}
                <View style={{ flex: 1, alignItems: "center" }}>
                  <View className="flex-row items-center gap-2">
                    <BedDouble
                      size={18}
                      color={tokens.colors.roogo.neutral[700]}
                      strokeWidth={2}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Urbanist-Bold",
                        color: tokens.colors.roogo.neutral[900],
                      }}
                    >
                      {formData.chambres || 0}
                    </Text>
                  </View>
                </View>

                {/* Divider */}
                <View
                  style={{
                    width: 1,
                    height: 20,
                    backgroundColor: "#D1D5DB",
                  }}
                />

                {/* Bathrooms */}
                <View style={{ flex: 1, alignItems: "center" }}>
                  <View className="flex-row items-center gap-2">
                    <Bath
                      size={18}
                      color={tokens.colors.roogo.neutral[700]}
                      strokeWidth={2}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Urbanist-Bold",
                        color: tokens.colors.roogo.neutral[900],
                      }}
                    >
                      {formData.sdb || 0}
                    </Text>
                  </View>
                </View>

                {/* Divider */}
                <View
                  style={{
                    width: 1,
                    height: 20,
                    backgroundColor: "#D1D5DB",
                  }}
                />

                {/* Area */}
                <View style={{ flex: 1, alignItems: "center" }}>
                  <View className="flex-row items-center gap-2">
                    <Ruler
                      size={18}
                      color={tokens.colors.roogo.neutral[700]}
                      strokeWidth={2}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Urbanist-Bold",
                        color: tokens.colors.roogo.neutral[900],
                      }}
                    >
                      {formData.superficie || 0} m²
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Résumé */}
        <View className="mb-8">
          <Text className="text-sm font-bold text-roogo-neutral-900 mb-3 font-urbanist">
            Résumé des informations
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: "#E5E5E5",
              borderRadius: 16,
              paddingHorizontal: 16,
              backgroundColor: "#FFFFFF",
            }}
          >
            <KeyValueRow label="Type" value={propertyTypeLabel} />
            <KeyValueRow label="Ville" value={villeLabel} />
            <KeyValueRow label="Quartier" value={formData.quartier || "-"} />
            <KeyValueRow label="Prix mensuel" value={formattedPrice} />
            {(formData.chambres || formData.sdb || formData.superficie) && (
              <KeyValueRow
                label="Détails"
                value={`${formData.chambres || 0} ch · ${
                  formData.sdb || 0
                } sdb · ${formData.superficie || 0} m²`}
              />
            )}
            {formData.vehicules && formData.vehicules > 0 && (
              <KeyValueRow
                label="Véhicules"
                value={formData.vehicules.toString()}
              />
            )}
            <KeyValueRow label="Équipements" value={equipementsLabels} />
            {formData.cautionMois && formData.cautionMois > 0 && (
              <KeyValueRow
                label="Caution"
                value={`${formData.cautionMois} mois de loyer`}
              />
            )}
            <KeyValueRow
              label="Interdictions"
              value={interdictionsLabels}
              showDivider={false}
            />
          </View>
        </View>

        {/* Footer Button */}
        <View className="mb-8">
          <PrimaryButton title="Publier la propriété" onPress={handlePublish} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
