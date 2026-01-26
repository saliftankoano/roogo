import {
  BedIcon,
  CaretLeftIcon,
  CaretDownIcon,
  CaretUpIcon,
  MapPinIcon,
  RulerIcon,
} from "phosphor-react-native";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyValueRow } from "@/components/ui/KeyValueRow";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import type { ListingDraft } from "@/forms/listingSchema";
import {
  CITIES,
  EQUIPEMENTS,
  INTERDICTIONS,
  PROPERTY_TYPES,
  TIERS,
} from "@/forms/listingSchema";
import { tokens } from "@/theme/tokens";
import { TierSelectionCard } from "@/components/listing/TierSelectionCard";
import { formatCurrency } from "@/utils/formatting";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ListingStep3ScreenProps {
  navigation: any;
  formData: Partial<ListingDraft>;
  onFormChange: (data: Partial<ListingDraft>) => void;
  onBack: () => void;
  onSubmit: () => Promise<void>;
  errors: Record<string, string>;
  isStaff?: boolean;
}

export const ListingStep3Screen: React.FC<ListingStep3ScreenProps> = ({
  navigation,
  formData,
  onFormChange,
  onBack,
  onSubmit,
  errors,
  isStaff = false,
}) => {
  const [showFullPreview, setShowFullPreview] = useState(false);

  const togglePreview = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFullPreview(!showFullPreview);
  };

  const handleTierSelect = (tierId: string) => {
    onFormChange({ ...formData, tier_id: tierId as any });
  };

  const handlePublish = () => {
    onSubmit();
  };

  const calculateTierPrice = (tierId: string, baseFee: number) => {
    const rent = formData.prixMensuel || 0;
    const percentageFee = rent * 0.05;
    return baseFee + percentageFee;
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

  const formattedPrice = formData.prixMensuel
    ? formatCurrency(formData.prixMensuel)
    : "";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-roogo-neutral-100">
        <TouchableOpacity
          onPress={onBack}
          className="mr-4 p-2 -ml-2 rounded-full active:bg-roogo-neutral-100"
        >
          <CaretLeftIcon size={28} color={tokens.colors.roogo.neutral[900]} />
        </TouchableOpacity>
        <View>
          <Text className="text-xl font-urbanist font-bold text-roogo-neutral-900">
            Dernière étape
          </Text>
          <Text className="text-xs font-urbanist-medium text-roogo-neutral-500">
            {isStaff 
              ? "Vérifiez les détails avant publication" 
              : "Choisissez votre pack de visibilité"}
          </Text>
        </View>
      </View>

      <View className="flex-1">
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 220, paddingTop: 20 }}
        >
          {/* Unified Expandable Preview Card */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 24,
              borderWidth: 1.5,
              borderColor: tokens.colors.roogo.neutral[400],
              marginBottom: 24,
              overflow: "hidden",
            }}
          >
            {/* Header / Compact View */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={togglePreview}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                backgroundColor: showFullPreview
                  ? "white"
                  : tokens.colors.roogo.neutral[50],
              }}
            >
              <View className="flex-row items-center flex-1 mr-4">
                {!showFullPreview && (
                  <View className="w-12 h-12 rounded-xl overflow-hidden mr-3 bg-roogo-neutral-200">
                    {formData.photos && formData.photos.length > 0 ? (
                      <Image
                        source={{ uri: formData.photos[0].uri }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center">
                        <Text className="text-[8px] font-urbanist text-roogo-neutral-400">
                          NO IMG
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                <View className="flex-1">
                  <Text
                    className="font-urbanist-bold text-roogo-neutral-900 truncate"
                    numberOfLines={1}
                  >
                    {formData.titre || "Annonce sans titre"}
                  </Text>
                  <Text className="font-urbanist-medium text-roogo-primary-500 text-sm">
                    {formattedPrice}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <Text className="font-urbanist-bold text-roogo-neutral-400 text-xs mr-1">
                  {showFullPreview ? "Réduire" : "Vérifier"}
                </Text>
                {showFullPreview ? (
                  <CaretUpIcon
                    size={16}
                    color={tokens.colors.roogo.neutral[400]}
                  />
                ) : (
                  <CaretDownIcon
                    size={16}
                    color={tokens.colors.roogo.neutral[400]}
                  />
                )}
              </View>
            </TouchableOpacity>

            {/* Expandable Guts */}
            {showFullPreview && (
              <View style={{ padding: 16, paddingTop: 0 }}>
                {/* Full Image */}
                <View
                  style={{
                    width: "100%",
                    height: 180,
                    borderRadius: 16,
                    overflow: "hidden",
                    marginBottom: 16,
                  }}
                >
                  {formData.photos && formData.photos.length > 0 ? (
                    <Image
                      source={{ uri: formData.photos[0].uri }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={{
                        width: "100%",
                        height: "100%",
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
                </View>

                {/* Location & Quick Specs */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <MapPinIcon
                    size={14}
                    color={tokens.colors.roogo.neutral[500]}
                  />
                  <Text
                    style={{
                      marginLeft: 4,
                      color: tokens.colors.roogo.neutral[500],
                      fontSize: 13,
                      fontFamily: "Urbanist-Medium",
                    }}
                    numberOfLines={1}
                  >
                    {villeLabel}, {formData.quartier}
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      gap: 12,
                    }}
                  >
                    <View className="flex-row items-center gap-1">
                      <BedIcon
                        size={14}
                        color={tokens.colors.roogo.neutral[500]}
                      />
                      <Text className="text-xs font-urbanist-bold text-roogo-neutral-500">
                        {formData.chambres || 0}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <RulerIcon
                        size={14}
                        color={tokens.colors.roogo.neutral[500]}
                      />
                      <Text className="text-xs font-urbanist-bold text-roogo-neutral-500">
                        {formData.superficie || 0} m²
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Detailed Table */}
                <View
                  style={{
                    borderTopWidth: 1,
                    borderColor: tokens.colors.roogo.neutral[100],
                    paddingTop: 8,
                  }}
                >
                  <KeyValueRow label="Type" value={propertyTypeLabel} />
                  <KeyValueRow label="Équipements" value={equipementsLabels} />
                  <KeyValueRow
                    label="Interdictions"
                    value={interdictionsLabels}
                    showDivider={false}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Tier Selection - HIDE FOR STAFF (they get free premium) */}
          {!isStaff && (
            <View className="mb-8">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-urbanist-bold text-roogo-neutral-900">
                  Packs de publication
                </Text>
                <View className="bg-roogo-primary-100 px-3 py-1 rounded-full">
                  <Text className="text-[10px] font-urbanist-bold text-roogo-primary-600 uppercase tracking-widest">
                    Meilleure visibilité
                  </Text>
                </View>
              </View>

              {TIERS.map((tier) => (
                <TierSelectionCard
                  key={tier.id}
                  tier={tier as any}
                  selected={formData.tier_id === tier.id}
                  onSelect={handleTierSelect}
                  calculatedPrice={calculateTierPrice(tier.id, tier.base_fee)}
                />
              ))}
              {errors.tier_id && (
                <Text className="text-xs text-roogo-error mt-1.5 font-urbanist font-medium ml-1">
                  {errors.tier_id}
                </Text>
              )}
            </View>
          )}

          {isStaff && (
            <View className="mb-8 p-6 bg-roogo-primary-50 rounded-[24px] border border-roogo-primary-100">
              <Text className="text-lg font-urbanist-bold text-roogo-primary-700 mb-2">
                Compte Staff
              </Text>
              <Text className="text-sm font-urbanist-medium text-roogo-primary-600 leading-relaxed">
                En tant que membre de l&apos;équipe Roogo, vous bénéficiez de la publication gratuite et illimitée. Votre annonce sera vérifiée et mise en ligne immédiatement.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Sticky Footer - Lifted to be above the TabBar */}
        <View
          style={{
            position: "absolute",
            bottom: Platform.OS === "ios" ? 115 : 100, // Above the floating tab bar
            left: 20,
            right: 20,
            padding: 16,
            backgroundColor: "white",
            borderRadius: 24,
            borderWidth: 1,
            borderColor: tokens.colors.roogo.neutral[100],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <PrimaryButton
            title={
              isStaff 
                ? "Publier (Gratuit Staff)" 
                : formData.tier_id 
                  ? "Payer et Publier" 
                  : "Choisissez un pack"
            }
            onPress={handlePublish}
            disabled={!isStaff && !formData.tier_id}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
