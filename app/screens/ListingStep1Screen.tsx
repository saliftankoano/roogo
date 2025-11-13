import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChipSelectable } from "../components/ChipSelectable";
import { OutlinedField } from "../components/OutlinedField";
import { PrimaryButton } from "../components/PrimaryButton";
import { Stepper } from "../components/Stepper";
import type { ListingDraft } from "../forms/listingSchema";
import { CITIES, PROPERTY_TYPES } from "../forms/listingSchema";

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
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <ChevronLeft size={24} color="#111111" />
        </TouchableOpacity>
        <Text className="text-[18px] font-semibold text-[#111111]">
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
        currentStep={1}
        completedSteps={[]}
      />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Titre de l'annonce */}
        <View style={{ marginTop: 10 }}>
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
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#374151",
              marginBottom: 10,
            }}
          >
            Type de propriété <Text style={{ color: "#EF4444" }}>*</Text>
          </Text>
          <View
            className="flex-row flex-wrap gap-2"
            style={{ paddingVertical: 6 }}
          >
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
            <Text className="text-[12px] text-[#EF4444] mt-1">
              {errors.type}
            </Text>
          )}
        </View>

        {/* Prix de location */}
        <View style={{ marginTop: 8 }}>
          <OutlinedField
            label="Prix de location (FCFA) / Mois"
            required
            placeholder="Ex: 150000"
            value={formData.prixMensuel?.toString() || ""}
            onChangeText={(value) => {
              const numericValue = value.replace(/[^0-9]/g, "");
              handleFieldChange(
                "prixMensuel",
                numericValue ? parseInt(numericValue) : undefined
              );
            }}
            keyboardType="numeric"
            error={errors.prixMensuel}
            onBlur={(e) => {
              // Format on blur (visual feedback for users)
            }}
          />
        </View>

        {/* Localisation */}
        <View style={{ marginTop: 8 }}>
          <OutlinedField
            label="Quartier"
            required
            placeholder="Ex: Koulouba, Zone du bois"
            value={formData.quartier || ""}
            onChangeText={(value) => handleFieldChange("quartier", value)}
            error={errors.quartier}
          />

          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#374151",
                marginBottom: 10,
              }}
            >
              Ville <Text style={{ color: "#EF4444" }}>*</Text>
            </Text>
            <View
              className="flex-row flex-wrap gap-2"
              style={{ paddingVertical: 6 }}
            >
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
              <Text
                style={{
                  fontSize: 12,
                  color: "#EF4444",
                  marginTop: 4,
                  fontWeight: "500",
                }}
              >
                {errors.ville}
              </Text>
            )}
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
        <PrimaryButton title="Suivant" onPress={onNext} disabled={!isValid} />
      </View>
    </SafeAreaView>
  );
};
