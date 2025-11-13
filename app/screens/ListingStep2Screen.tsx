import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChipSelectable } from "../components/ChipSelectable";
import { OutlinedField } from "../components/OutlinedField";
import { PhotoDropZone } from "../components/PhotoDropZone";
import { PrimaryButton } from "../components/PrimaryButton";
import { Stepper } from "../components/Stepper";
import type { ListingDraft } from "../forms/listingSchema";
import { EQUIPEMENTS, INTERDICTIONS } from "../forms/listingSchema";

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

  const isValid = formData.photos && formData.photos.length >= 3;

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
        currentStep={2}
        completedSteps={[1]}
      />

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Grid inputs: Chambres, Salles de bain, Superficie */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            marginTop: 20,
            marginBottom: 8,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#6B7280",
                marginBottom: 6,
              }}
            >
              Chambres
            </Text>
            <OutlinedField
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
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#6B7280",
                marginBottom: 6,
              }}
            >
              Salles de bain
            </Text>
            <OutlinedField
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
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#6B7280",
                marginBottom: 6,
              }}
            >
              Superficie (m²)
            </Text>
            <OutlinedField
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
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#374151",
              marginBottom: 8,
            }}
          >
            Description
          </Text>
          <OutlinedField
            placeholder="Décrivez votre propriété..."
            value={formData.description || ""}
            onChangeText={(value) => handleFieldChange("description", value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{ minHeight: 100 }}
            error={errors.description}
          />
        </View>

        {/* Photos */}
        <View style={{ marginBottom: 24, marginTop: 18 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#374151",
              marginBottom: 12,
            }}
          >
            Photos <Text style={{ color: "#EF4444" }}>*</Text>
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
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#374151",
              marginBottom: 10,
            }}
          >
            Équipements et services
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              paddingVertical: 6,
            }}
          >
            {EQUIPEMENTS.map((equipement) => (
              <ChipSelectable
                key={equipement.id}
                label={equipement.label}
                selected={(formData.equipements || []).includes(
                  equipement.id as any
                )}
                onPress={() => handleEquipementToggle(equipement.id)}
              />
            ))}
          </View>
        </View>

        {/* Conditions de location */}
        <View style={{ marginBottom: 16 }}>
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
          <View>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#6B7280",
                marginBottom: 8,
              }}
            >
              Interdictions
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                paddingVertical: 6,
              }}
            >
              {INTERDICTIONS.map((interdiction) => (
                <ChipSelectable
                  key={interdiction.id}
                  label={interdiction.label}
                  selected={(formData.interdictions || []).includes(
                    interdiction.id as any
                  )}
                  onPress={() => handleInterdictionToggle(interdiction.id)}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Sticky footer */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 16,
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
