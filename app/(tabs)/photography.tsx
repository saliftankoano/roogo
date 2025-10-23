import { useRouter } from "expo-router";
import { Camera, Check } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AgentOnly from "../components/AgentOnly";

type Package = {
  id: string;
  name: string;
  photos: number;
  price: string;
  features: string[];
};

export default function PhotographyScreen() {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    propertyAddress: "",
    quartier: "",
    city: "",
    propertyType: "",
    contactPhone: "",
    preferredDate: "",
    additionalNotes: "",
  });

  const packages: Package[] = [
    {
      id: "basic",
      name: "Basique",
      photos: 10,
      price: "25.000",
      features: [
        "10 photos professionnelles",
        "Retouche basique",
        "Livraison en 48h",
        "Photos haute résolution",
      ],
    },
    {
      id: "standard",
      name: "Standard",
      photos: 20,
      price: "45.000",
      features: [
        "20 photos professionnelles",
        "Retouche avancée",
        "Livraison en 24h",
        "Photos haute résolution",
        "Vue drone (extérieur)",
        "Photos crépusculaires",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      photos: 35,
      price: "75.000",
      features: [
        "35 photos professionnelles",
        "Retouche premium",
        "Livraison en 24h",
        "Photos haute résolution",
        "Vue drone complète",
        "Photos crépusculaires",
        "Visite virtuelle 360°",
        "Vidéo promotionnelle",
      ],
    },
  ];

  const propertyTypes = [
    { id: "villa", label: "Villa" },
    { id: "apartment", label: "Appartement" },
    { id: "house", label: "Maison" },
    { id: "land", label: "Terrain" },
    { id: "commercial", label: "Commercial" },
  ];

  const cities = [
    "Ouagadougou",
    "Bobo-Dioulasso",
    "Koudougou",
    "Ouahigouya",
    "Banfora",
    "Kaya",
    "Tenkodogo",
    "Fada N'Gourma",
    "Dédougou",
    "Koupéla",
  ];

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
    setShowForm(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Validate required fields
    if (
      !formData.propertyAddress ||
      !formData.quartier ||
      !formData.city ||
      !formData.propertyType ||
      !formData.contactPhone
    ) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    const selectedPkg = packages.find((pkg) => pkg.id === selectedPackage);
    Alert.alert(
      "Demande envoyée!",
      `Votre demande pour le forfait ${selectedPkg?.name} a été envoyée. Nous vous contacterons bientôt au ${formData.contactPhone}.`
    );

    // Reset form
    setFormData({
      propertyAddress: "",
      quartier: "",
      city: "",
      propertyType: "",
      contactPhone: "",
      preferredDate: "",
      additionalNotes: "",
    });
    setSelectedPackage(null);
    setShowForm(false);
  };

  return (
    <AgentOnly>
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          {/* Header */}
          <View className="px-6 py-6 border-b border-gray-200">
            <View className="flex-row items-center mb-2">
              <Camera size={28} color="#FF6B35" />
              <Text className="text-2xl font-bold text-gray-900 ml-3 font-urbanist">
                Services Photo Pro
              </Text>
            </View>
            <Text className="text-gray-600 text-sm mt-2 font-urbanist">
              Des photos professionnelles pour valoriser vos propriétés et
              attirer plus de clients
            </Text>
          </View>

          {!showForm ? (
            <>
              {/* Packages */}
              <View className="px-6 py-6">
                <Text className="text-xl font-semibold text-gray-900 mb-4 font-urbanist">
                  Nos Forfaits
                </Text>

                <View className="space-y-4">
                  {packages.map((pkg) => (
                    <TouchableOpacity
                      key={pkg.id}
                      className={`border-2 rounded-2xl mb-10 p-5 ${
                        selectedPackage === pkg.id
                          ? "border-figma-primary bg-figma-primary/5"
                          : "border-gray-200 bg-white"
                      }`}
                      onPress={() => handlePackageSelect(pkg.id)}
                    >
                      {/* Package Header */}
                      <View className="flex-row justify-between items-start mb-3">
                        <View>
                          <Text className="text-xl font-bold text-gray-900 font-urbanist">
                            {pkg.name}
                          </Text>
                          <Text className="text-gray-600 text-sm mt-1 font-urbanist">
                            {pkg.photos} photos professionnelles
                          </Text>
                        </View>
                        <View>
                          <Text className="text-2xl font-bold text-figma-primary font-urbanist">
                            {pkg.price}
                          </Text>
                          <Text className="text-gray-600 text-sm text-right font-urbanist">
                            FCFA
                          </Text>
                        </View>
                      </View>

                      {/* Features */}
                      <View className="space-y-2 mt-3">
                        {pkg.features.map((feature, index) => (
                          <View
                            key={index}
                            className="flex-row items-center space-x-2"
                          >
                            <Check size={16} color="#10B981" />
                            <Text className="text-gray-700 text-sm flex-1 ml-2 font-urbanist">
                              {feature}
                            </Text>
                          </View>
                        ))}
                      </View>

                      {/* CTA */}
                      <View className="mt-4 pt-4 border-t border-gray-200">
                        <Text className="text-figma-primary font-semibold text-center font-urbanist">
                          Sélectionner ce forfait
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Why Choose Us */}
              <View className="px-6 py-6 bg-gray-50 mt-4">
                <Text className="text-lg font-semibold text-gray-900 mb-4 font-urbanist">
                  Pourquoi nous choisir?
                </Text>
                <View className="space-y-3">
                  <View className="flex-row items-start">
                    <Text className="text-figma-primary text-xl mr-3">📸</Text>
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900 font-urbanist">
                        Photographes professionnels
                      </Text>
                      <Text className="text-gray-600 text-sm font-urbanist">
                        Équipe expérimentée en photographie immobilière
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-start">
                    <Text className="text-figma-primary text-xl mr-3">⚡</Text>
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900 font-urbanist">
                        Livraison rapide
                      </Text>
                      <Text className="text-gray-600 text-sm font-urbanist">
                        Vos photos retouchées en 24-48h maximum
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-start">
                    <Text className="text-figma-primary text-xl mr-3">✨</Text>
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900 font-urbanist">
                        Qualité garantie
                      </Text>
                      <Text className="text-gray-600 text-sm font-urbanist">
                        Retouches professionnelles incluses
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Request Form */}
              <View className="px-6 py-6">
                <TouchableOpacity
                  onPress={() => setShowForm(false)}
                  className="mb-4"
                >
                  <Text className="text-figma-primary font-semibold font-urbanist">
                    ← Retour aux forfaits
                  </Text>
                </TouchableOpacity>

                <Text className="text-xl font-semibold text-gray-900 mb-2 font-urbanist">
                  Demande de service photo
                </Text>
                <Text className="text-gray-600 text-sm mb-6 font-urbanist">
                  Remplissez les informations pour votre propriété
                </Text>

                {/* Selected Package Info */}
                <View className="bg-figma-primary/10 border border-figma-primary rounded-xl p-4 mb-6">
                  <Text className="text-sm text-gray-600 font-urbanist">
                    Forfait sélectionné
                  </Text>
                  <Text className="text-lg font-bold text-gray-900 font-urbanist">
                    {packages.find((pkg) => pkg.id === selectedPackage)?.name} -{" "}
                    {packages.find((pkg) => pkg.id === selectedPackage)?.price}{" "}
                    FCFA
                  </Text>
                </View>

                {/* Property Address */}
                <View className="mb-4">
                  <Text className="text-base font-semibold text-gray-900 mb-2 font-urbanist">
                    Adresse de la propriété *
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-urbanist"
                    placeholder="Ex: Rue 12.45, Secteur 15"
                    value={formData.propertyAddress}
                    onChangeText={(value) =>
                      handleInputChange("propertyAddress", value)
                    }
                  />
                </View>

                {/* Quartier */}
                <View className="mb-4">
                  <Text className="text-base font-semibold text-gray-900 mb-2 font-urbanist">
                    Quartier *
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-urbanist"
                    placeholder="Ex: Koulouba, Zone du bois"
                    value={formData.quartier}
                    onChangeText={(value) =>
                      handleInputChange("quartier", value)
                    }
                  />
                </View>

                {/* City */}
                <View className="mb-4">
                  <Text className="text-base font-semibold text-gray-900 mb-2 font-urbanist">
                    Ville *
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {cities.map((city) => (
                      <TouchableOpacity
                        key={city}
                        className={`border rounded-lg px-3 py-2 ${
                          formData.city === city
                            ? "border-figma-primary bg-figma-primary/10"
                            : "border-gray-300 bg-white"
                        }`}
                        onPress={() => handleInputChange("city", city)}
                      >
                        <Text
                          className={`text-sm font-urbanist ${
                            formData.city === city
                              ? "text-figma-primary"
                              : "text-gray-700"
                          }`}
                        >
                          {city}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Property Type */}
                <View className="mb-4">
                  <Text className="text-base font-semibold text-gray-900 mb-2 font-urbanist">
                    Type de propriété *
                  </Text>
                  <View className="flex-row flex-wrap gap-3">
                    {propertyTypes.map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        className={`border-2 rounded-xl px-4 py-3 ${
                          formData.propertyType === type.id
                            ? "border-figma-primary bg-figma-primary/10"
                            : "border-gray-300 bg-white"
                        }`}
                        onPress={() =>
                          handleInputChange("propertyType", type.id)
                        }
                      >
                        <Text
                          className={`font-medium font-urbanist ${
                            formData.propertyType === type.id
                              ? "text-figma-primary"
                              : "text-gray-700"
                          }`}
                        >
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Contact Phone */}
                <View className="mb-4">
                  <Text className="text-base font-semibold text-gray-900 mb-2 font-urbanist">
                    Téléphone de contact *
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-urbanist"
                    placeholder="Ex: +226 70 12 34 56"
                    value={formData.contactPhone}
                    onChangeText={(value) =>
                      handleInputChange("contactPhone", value)
                    }
                    keyboardType="phone-pad"
                  />
                </View>

                {/* Preferred Date */}
                <View className="mb-4">
                  <Text className="text-base font-semibold text-gray-900 mb-2 font-urbanist">
                    Date préférée (optionnel)
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-urbanist"
                    placeholder="Ex: Lundi 25 Octobre"
                    value={formData.preferredDate}
                    onChangeText={(value) =>
                      handleInputChange("preferredDate", value)
                    }
                  />
                </View>

                {/* Additional Notes */}
                <View className="mb-4">
                  <Text className="text-base font-semibold text-gray-900 mb-2 font-urbanist">
                    Notes additionnelles (optionnel)
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-4 text-gray-900 font-urbanist min-h-[100px]"
                    placeholder="Informations supplémentaires sur la propriété ou vos besoins..."
                    value={formData.additionalNotes}
                    onChangeText={(value) =>
                      handleInputChange("additionalNotes", value)
                    }
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  className="bg-figma-primary rounded-xl py-4 items-center mt-6"
                  onPress={handleSubmit}
                >
                  <Text className="text-white font-semibold text-lg font-urbanist">
                    Envoyer la demande
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </AgentOnly>
  );
}
