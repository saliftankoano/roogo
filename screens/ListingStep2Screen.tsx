import { ChevronLeft } from "lucide-react-native";
import {
  Armchair,
  Bed,
  Car,
  PottedPlant,
  Ruler,
  ShieldCheck,
  Shower,
  Sun,
  SwimmingPool,
  WifiHigh,
} from "phosphor-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChipSelectable } from "@/components/ChipSelectable";
import { OutlinedField } from "@/components/OutlinedField";
import { PhotoDropZone } from "@/components/PhotoDropZone";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Stepper } from "@/components/Stepper";
import type { ListingDraft } from "@/forms/listingSchema";
import { EQUIPEMENTS, INTERDICTIONS } from "@/forms/listingSchema";
import { tokens } from "@/theme/tokens";

interface ListingStep2ScreenProps {
  navigation: any;
  formData: Partial<ListingDraft>;
  onFormChange: (data: Partial<ListingDraft>) => void;
  onNext: () => void;
  onBack: () => void;
  errors: Record<string, string>;
}

export const ListingStep2Screen: React.FC<ListingStep2ScreenProps> = ({
  navigation,
  formData,
  onFormChange,
  onNext,
  onBack,
  errors,
}) => {
  const handleFieldChange = (field: keyof ListingDraft, value: any) => {
    onFormChange({ ...formData, [field]: value });
  };

  const handleEquipementToggle = (equipementId: string) => {
    const current = formData.equipements || [];
    const updated = current.includes(equipementId as any)
      ? current.filter((id) => id !== equipementId)
      : [...current, equipementId as any];
    handleFieldChange("equipements", updated);
  };

  const handleInterdictionToggle = (interdictionId: string) => {
    const current = formData.interdictions || [];
    const updated = current.includes(interdictionId as any)
      ? current.filter((id) => id !== interdictionId)
      : [...current, interdictionId as any];
    handleFieldChange("interdictions", updated);
  };

  const getEquipementIcon = (id: string) => {
    switch (id) {
      case "wifi":
        return <WifiHigh size={18} color={tokens.colors.roogo.neutral[500]} />;
      case "securite":
        return (
          <ShieldCheck size={18} color={tokens.colors.roogo.neutral[500]} />
        );
      case "jardin":
        return (
          <PottedPlant size={18} color={tokens.colors.roogo.neutral[500]} />
        );
      case "solaires":
        return <Sun size={18} color={tokens.colors.roogo.neutral[500]} />;
      case "piscine":
        return (
          <SwimmingPool size={18} color={tokens.colors.roogo.neutral[500]} />
        );
      case "meuble":
        return <Armchair size={18} color={tokens.colors.roogo.neutral[500]} />;
      default:
        return null;
    }
  };

  const isValid = formData.photos && formData.photos.length >= 3;

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
        currentStep={2}
        completedSteps={[1]}
      />

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 120 }}
      >
        {/* Grid inputs: Chambres, Salles de bain, Superficie */}
        <View className="flex-row gap-3 mb-2">
          <View className="flex-1">
            <OutlinedField
              label="Chambres"
              labelIcon={
                <Bed size={18} color={tokens.colors.roogo.neutral[900]} />
              }
              placeholder="0"
              value={formData.chambres?.toString() || ""}
              onChangeText={(value) => {
                const numericValue = value.replace(/[^0-9]/g, "");
                handleFieldChange(
                  "chambres",
                  numericValue ? parseInt(numericValue) : undefined
                );
              }}
              keyboardType="numeric"
              error={errors.chambres}
            />
          </View>
          <View className="flex-1">
            <OutlinedField
              label="Douche(s)"
              labelIcon={
                <Shower size={18} color={tokens.colors.roogo.neutral[900]} />
              }
              placeholder="0"
              value={formData.sdb?.toString() || ""}
              onChangeText={(value) => {
                const numericValue = value.replace(/[^0-9]/g, "");
                handleFieldChange(
                  "sdb",
                  numericValue ? parseInt(numericValue) : undefined
                );
              }}
              keyboardType="numeric"
              error={errors.sdb}
            />
          </View>
          <View className="flex-1">
            <OutlinedField
              label="Superficie"
              labelIcon={
                <Ruler size={18} color={tokens.colors.roogo.neutral[900]} />
              }
              placeholder="0"
              value={formData.superficie?.toString() || ""}
              onChangeText={(value) => {
                const numericValue = value.replace(/[^0-9]/g, "");
                handleFieldChange(
                  "superficie",
                  numericValue ? parseInt(numericValue) : undefined
                );
              }}
              keyboardType="numeric"
              error={errors.superficie}
            />
          </View>
        </View>

        {/* Nombre de véhicules */}
        <OutlinedField
          label="Nombre de véhicules"
          labelIcon={<Car size={18} color={tokens.colors.roogo.neutral[900]} />}
          placeholder="0"
          value={formData.vehicules?.toString() || ""}
          onChangeText={(value) => {
            const numericValue = value.replace(/[^0-9]/g, "");
            handleFieldChange(
              "vehicules",
              numericValue ? parseInt(numericValue) : undefined
            );
          }}
          keyboardType="numeric"
          error={errors.vehicules}
        />

        {/* Description */}
        <View className="mb-16">
          <OutlinedField
            label="Description"
            placeholder="Décrivez votre propriété..."
            value={formData.description || ""}
            onChangeText={(value) => handleFieldChange("description", value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{ minHeight: 120 }}
            error={errors.description}
          />
        </View>

        {/* Photos */}
        <View className="mb-8 mt-4">
          <Text className="text-sm font-bold text-roogo-neutral-900 mb-3 font-urbanist">
            Photos <Text className="text-roogo-error">*</Text>
          </Text>
          <PhotoDropZone
            photos={formData.photos || []}
            onPhotosChange={(photos) => handleFieldChange("photos", photos)}
            minPhotos={3}
            maxPhotos={15}
            error={errors.photos}
          />
        </View>

        {/* Équipements et services */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-roogo-neutral-900 mb-3 font-urbanist">
            Équipements et services
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {EQUIPEMENTS.map((equipement) => {
              const icon = getEquipementIcon(equipement.id);
              const isSelected = (formData.equipements || []).includes(
                equipement.id as any
              );
              // Clone icon with correct color if selected
              const iconElement = icon
                ? React.cloneElement(icon as any, {
                    color: isSelected
                      ? "#FFFFFF"
                      : tokens.colors.roogo.neutral[500],
                  })
                : null;

              return (
                <ChipSelectable
                  key={equipement.id}
                  label={equipement.label}
                  icon={iconElement}
                  selected={isSelected}
                  onPress={() => handleEquipementToggle(equipement.id)}
                />
              );
            })}
          </View>
        </View>

        {/* Conditions de location */}
        <View className="mb-8">
          {/* Caution */}
          <OutlinedField
            label="Caution (en mois de loyer)"
            placeholder="Ex: 2"
            value={formData.cautionMois?.toString() || ""}
            onChangeText={(value) => {
              const numericValue = value.replace(/[^0-9]/g, "");
              const parsed = numericValue ? parseInt(numericValue) : undefined;
              if (parsed === undefined || (parsed >= 0 && parsed <= 12)) {
                handleFieldChange("cautionMois", parsed);
              }
            }}
            keyboardType="numeric"
            error={errors.cautionMois}
          />

          {/* Interdictions */}
          <View className="mt-4">
            <Text className="text-sm font-bold text-roogo-neutral-900 mb-3 font-urbanist">
              Interdictions
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {INTERDICTIONS.map((interdiction) => {
                const Icon = interdiction.icon;
                const isSelected = (formData.interdictions || []).includes(
                  interdiction.id as any
                );
                return (
                  <View
                    key={interdiction.id}
                    style={{ width: "48%", marginBottom: 8 }}
                  >
                    <ChipSelectable
                      label={interdiction.label}
                      icon={
                        <Icon
                          size={18}
                          color={
                            isSelected
                              ? "#FFFFFF"
                              : tokens.colors.roogo.neutral[500]
                          }
                        />
                      }
                      selected={isSelected}
                      onPress={() => handleInterdictionToggle(interdiction.id)}
                      style={{ marginRight: 0, width: "100%" }}
                    />
                  </View>
                );
              })}
            </View>
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
