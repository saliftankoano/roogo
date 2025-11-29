import { formatPrice } from "@/utils/formatting";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChipSelectable } from "@/components/ChipSelectable";
import { OutlinedField } from "@/components/OutlinedField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Stepper } from "@/components/Stepper";
import type { ListingDraft } from "@/forms/listingSchema";
import { CITIES, PROPERTY_TYPES } from "@/forms/listingSchema";
import { tokens } from "@/theme/tokens";
import { MagicWand } from "phosphor-react-native";

interface ListingStep1ScreenProps {
  navigation: any;
  formData: Partial<ListingDraft>;
  onFormChange: (data: Partial<ListingDraft>) => void;
  onNext: () => void;
  errors: Record<string, string>;
}

export const ListingStep1Screen: React.FC<ListingStep1ScreenProps> = ({
  navigation,
  formData,
  onFormChange,
  onNext,
  errors,
}) => {
  const handleFieldChange = (field: keyof ListingDraft, value: any) => {
    onFormChange({ ...formData, [field]: value });
  };

  const handleFillMockData = () => {
    const whiteVillaUri = Image.resolveAssetSource(
      require("../assets/images/homes/white_villa.jpg")
    ).uri;
    const redVillaUri = Image.resolveAssetSource(
      require("../assets/images/homes/red_villa.jpg")
    ).uri;
    const img3Uri = Image.resolveAssetSource(
      require("../assets/images/white_villa.jpg")
    ).uri;

    onFormChange({
      ...formData,
      // Step 1
      titre: "Villa de Luxe Ouaga 2000",
      type: "villa",
      prixMensuel: 350000,
      quartier: "Ouaga 2000",
      ville: "ouaga",
      // Step 2
      chambres: 4,
      sdb: 3,
      superficie: 450,
      vehicules: 2,
      description:
        "Magnifique villa située dans un quartier sécurisé. Grand jardin, piscine, groupe électrogène et toutes les commodités modernes. Idéal pour une famille ou des expatriés.",
      photos: [
        {
          uri: whiteVillaUri,
          width: 1000,
          height: 800,
        },
        {
          uri: redVillaUri,
          width: 1000,
          height: 800,
        },
        {
          uri: img3Uri,
          width: 1000,
          height: 800,
        },
      ],
      equipements: ["wifi", "piscine", "jardin", "securite", "solaires"],
      interdictions: ["no_animaux"],
      cautionMois: 3,
    });
  };

  const isValid =
    formData.titre &&
    formData.titre.length >= 4 &&
    formData.type &&
    formData.prixMensuel &&
    formData.prixMensuel >= 1000 &&
    formData.quartier &&
    formData.quartier.length >= 2 &&
    formData.ville;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-roogo-neutral-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4 p-2 -ml-2 rounded-full active:bg-roogo-neutral-100"
          >
            <ChevronLeft size={28} color={tokens.colors.roogo.neutral[900]} />
          </TouchableOpacity>
          <Text className="text-xl font-urbanist font-bold text-roogo-neutral-900">
            Ajouter une propriété
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleFillMockData}
          className="p-2 rounded-full bg-roogo-primary-500/10"
        >
          <MagicWand
            size={20}
            color={tokens.colors.roogo.primary[500]}
            weight="bold"
          />
        </TouchableOpacity>
      </View>

      {/* Stepper */}
      <Stepper
        steps={[
          { id: 1, label: "Le bien" },
          { id: 2, label: "Photos & Équipements" },
          { id: 3, label: "Publication" },
        ]}
        currentStep={1}
        completedSteps={[]}
      />

      <ScrollView
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Titre de l'annonce */}
        <View className="mt-4">
          <OutlinedField
            label="Titre de l'annonce"
            required
            placeholder="Ex: Belle villa moderne à Cocody"
            value={formData.titre || ""}
            onChangeText={(value) => handleFieldChange("titre", value)}
            error={errors.titre}
          />
        </View>

        {/* Type de propriété */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-roogo-neutral-900 mb-3 font-urbanist">
            Type de propriété <Text className="text-roogo-error">*</Text>
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {PROPERTY_TYPES.map((type) => (
              <ChipSelectable
                key={type.id}
                label={type.label}
                icon={type.icon}
                selected={formData.type === type.id}
                onPress={() => handleFieldChange("type", type.id)}
                compact
              />
            ))}
          </View>
          {errors.type && (
            <Text className="text-xs text-roogo-error mt-1.5 font-urbanist font-medium ml-1">
              {errors.type}
            </Text>
          )}
        </View>

        {/* Prix de location */}
        <View>
          <OutlinedField
            label="Prix de location (FCFA) / Mois"
            required
            placeholder="Ex: 150 000"
            value={formatPrice(formData.prixMensuel)}
            onChangeText={(value) => {
              const numericValue = value.replace(/[^0-9]/g, "");
              handleFieldChange(
                "prixMensuel",
                numericValue ? parseInt(numericValue) : undefined
              );
            }}
            keyboardType="numeric"
            error={errors.prixMensuel}
          />
        </View>

        {/* Localisation */}
        <View className="mt-2">
          <OutlinedField
            label="Quartier"
            required
            placeholder="Ex: Koulouba, Zone du bois"
            value={formData.quartier || ""}
            onChangeText={(value) => handleFieldChange("quartier", value)}
            error={errors.quartier}
          />

          <View className="mb-6">
            <Text className="text-sm font-bold text-roogo-neutral-900 mb-3 font-urbanist">
              Ville <Text className="text-roogo-error">*</Text>
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {CITIES.map((city) => (
                <ChipSelectable
                  key={city.id}
                  label={city.label}
                  selected={formData.ville === city.id}
                  onPress={() => handleFieldChange("ville", city.id)}
                />
              ))}
            </View>
            {errors.ville && (
              <Text className="text-xs text-roogo-error mt-1.5 font-urbanist font-medium ml-1">
                {errors.ville}
              </Text>
            )}
          </View>
        </View>

        {/* Static Footer Button */}
        <View className="mb-8">
          <PrimaryButton title="Suivant" onPress={onNext} disabled={!isValid} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
