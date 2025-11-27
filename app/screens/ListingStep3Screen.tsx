import {
  Bath,
  BedDouble,
  ChevronLeft,
  Heart,
  MapPin,
  Ruler,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyValueRow } from "../components/KeyValueRow";
import { PrimaryButton } from "../components/PrimaryButton";
import { Stepper } from "../components/Stepper";
import type { ListingDraft } from "../forms/listingSchema";
import {
  CITIES,
  EQUIPEMENTS,
  INTERDICTIONS,
  PROPERTY_TYPES,
} from "../forms/listingSchema";

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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
        }}
      >
        <TouchableOpacity onPress={onBack} style={{ marginRight: 12 }}>
          <ChevronLeft size={24} color="#111111" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}>
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
        style={{ flex: 1, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Preview Card */}
        <View style={{ marginTop: 16, marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#374151",
              marginBottom: 10,
            }}
          >
            Aperçu de l&apos;annonce
          </Text>

          {/* Actual PropertyCard Design - Compact Version */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              paddingBottom: 6,
            }}
          >
            {/* Image Section */}
            <View style={{ position: "relative" }}>
              {formData.photos && formData.photos.length > 0 ? (
                <Image
                  source={{ uri: formData.photos[0].uri }}
                  style={{ width: "100%", height: 140 }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: 140,
                    backgroundColor: "#F3F4F6",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
                    Aucune photo
                  </Text>
                </View>
              )}

              {/* Category Tag */}
              <View
                style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  backgroundColor:
                    category === "Residential" ? "#E48C26" : "#2563EB",
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  borderRadius: 999,
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 11,
                    fontWeight: "600",
                  }}
                >
                  {category === "Residential" ? "Résidentiel" : "Business"}
                </Text>
              </View>

              {/* Heart Icon */}
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: "rgba(17, 24, 39, 0.5)",
                  padding: 7,
                  borderRadius: 999,
                }}
              >
                <Heart size={18} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Content Section */}
            <View style={{ padding: 12, backgroundColor: "#FFFFFF" }}>
              {/* Title and Location */}
              <View style={{ marginBottom: 6 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#111827",
                    marginBottom: 3,
                  }}
                  numberOfLines={1}
                >
                  {formData.titre || "Titre de l'annonce"}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MapPin size={13} color="#6B7280" />
                  <Text
                    style={{
                      marginLeft: 3,
                      color: "#6B7280",
                      fontSize: 12,
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
                  color: "#16A34A",
                  fontSize: 18,
                  fontWeight: "700",
                  marginBottom: 10,
                  textAlign: "right",
                }}
              >
                {formattedPrice}
              </Text>

              {/* Property Details Grid - Compact */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E8E8E8",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.03,
                  shadowRadius: 4,
                  elevation: 1,
                  paddingHorizontal: 8,
                }}
              >
                {/* Bedrooms */}
                <View style={{ flex: 1, alignItems: "center" }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "#F8F8F8",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 4,
                    }}
                  >
                    <BedDouble size={16} color="#374151" strokeWidth={2} />
                  </View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    {formData.chambres || 0}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#6B7280",
                      marginTop: 2,
                      letterSpacing: 0.3,
                    }}
                  >
                    Chambres
                  </Text>
                </View>

                {/* Divider */}
                <View
                  style={{
                    width: 1,
                    height: 40,
                    backgroundColor: "#F0F0F0",
                  }}
                />

                {/* Bathrooms */}
                <View style={{ flex: 1, alignItems: "center" }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "#F8F8F8",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 4,
                    }}
                  >
                    <Bath size={16} color="#374151" strokeWidth={2} />
                  </View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    {formData.sdb || 0}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#6B7280",
                      marginTop: 2,
                      letterSpacing: 0.3,
                    }}
                  >
                    Douches
                  </Text>
                </View>

                {/* Divider */}
                <View
                  style={{
                    width: 1,
                    height: 40,
                    backgroundColor: "#F0F0F0",
                  }}
                />

                {/* Area */}
                <View style={{ flex: 1, alignItems: "center" }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "#F8F8F8",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 4,
                    }}
                  >
                    <Ruler size={16} color="#374151" strokeWidth={2} />
                  </View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    {formData.superficie || 0}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#6B7280",
                      marginTop: 2,
                      letterSpacing: 0.3,
                    }}
                  >
                    m²
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Résumé */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#374151",
              marginBottom: 12,
            }}
          >
            Résumé des informations
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: "#E9ECEF",
              borderRadius: 12,
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
                value={`${formData.chambres || 0} ch · ${formData.sdb || 0} sdb · ${
                  formData.superficie || 0
                } m²`}
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

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Sticky footer */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 2,
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          backgroundColor: "#FFFFFF",
        }}
      >
        <PrimaryButton title="Publier la propriété" onPress={handlePublish} />
      </View>
    </SafeAreaView>
  );
};
