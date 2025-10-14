import * as ImagePicker from "expo-image-picker";
import {
  Camera,
  Car,
  Shield,
  Sofa,
  Sun,
  Trees,
  Tv,
  Waves,
  Wifi,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AgentOnly from "../components/AgentOnly";

export default function AddPropertyScreen() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    listingType: "", // "sell" or "rent"
    quartier: "",
    city: "",
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    vehicles: "",
    photos: [] as string[],
    amenities: [] as string[],
  });

  const [selectedPropertyType, setSelectedPropertyType] = useState<
    string | null
  >(null);

  const [selectedListingType, setSelectedListingType] = useState<string | null>(
    null
  );

  const propertyTypes = [
    { id: "villa", label: "Villa (luxe)", icon: "🏰" },
    { id: "apartment", label: "Appartement", icon: "🏢" },
    { id: "house", label: "Maison (standard)", icon: "🏡" },
    { id: "land", label: "Terrain", icon: "🌍" },
    { id: "commercial", label: "Commercial", icon: "🏪" },
  ];

  const listingTypes = [
    { id: "sell", label: "Vente", icon: "💰" },
    { id: "rent", label: "Location", icon: "🏠" },
  ];

  const amenities = [
    { id: "wifi", label: "WiFi", icon: Wifi, color: "#3B82F6" },
    { id: "parking", label: "Parking", icon: Car, color: "#000000" },
    { id: "security", label: "Sécurité", icon: Shield, color: "#EF4444" },
    { id: "garden", label: "Jardin", icon: Trees, color: "#22C55E" },
    { id: "solar", label: "Panneaux solaires", icon: Sun, color: "#F59E0B" },
    { id: "tv", label: "Salle TV", icon: Tv, color: "#8B5CF6" },
    { id: "pool", label: "Piscine", icon: Waves, color: "#06B6D4" },
    { id: "furnished", label: "Meublé", icon: Sofa, color: "#F97316" },
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPhoto = async () => {
    try {
      // Request permissions
      const { status: mediaStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();

      if (mediaStatus !== "granted" && cameraStatus !== "granted") {
        Alert.alert(
          "Permissions requises",
          "Nous avons besoin d'accéder à votre galerie ou appareil photo pour ajouter des images."
        );
        return;
      }

      // Show action sheet
      Alert.alert("Ajouter une photo", "Choisissez la source de la photo", [
        {
          text: "Appareil photo",
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
              setFormData((prev) => ({
                ...prev,
                photos: [...prev.photos, result.assets[0].uri],
              }));
            }
          },
        },
        {
          text: "Galerie",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              quality: 0.8,
              allowsMultipleSelection: true,
              selectionLimit: 5,
            });

            if (!result.canceled && result.assets.length > 0) {
              setFormData((prev) => ({
                ...prev,
                photos: [
                  ...prev.photos,
                  ...result.assets.map((asset) => asset.uri),
                ],
              }));
            }
          },
        },
        {
          text: "Annuler",
          style: "cancel",
        },
      ]);
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'ajouter la photo");
      console.error(error);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleAmenityToggle = (amenityId: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter((id) => id !== amenityId)
        : [...prev.amenities, amenityId],
    }));
  };

  const handleSubmit = () => {
    // Validate required fields
    if (
      !formData.title ||
      !formData.price ||
      !formData.quartier ||
      !formData.city ||
      !selectedPropertyType ||
      !selectedListingType
    ) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    Alert.alert("Succès", "Propriété ajoutée avec succès!");
    // Reset form
    setFormData({
      title: "",
      description: "",
      price: "",
      listingType: "",
      quartier: "",
      city: "",
      propertyType: "",
      bedrooms: "",
      bathrooms: "",
      area: "",
      vehicles: "",
      photos: [],
      amenities: [],
    });
    setSelectedPropertyType(null);
    setSelectedListingType(null);
  };

  return (
    <AgentOnly>
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 py-4 border-b border-figma-border">
            <Text className="text-2xl font-bold text-figma-grey-900 font-urbanist">
              Ajouter une propriété
            </Text>
            <Text className="text-figma-grey-600 text-sm mt-1 font-urbanist">
              Remplissez les informations de votre propriété
            </Text>
          </View>

          {/* Form */}
          <View className="px-6 py-6 space-y-6">
            {/* Title */}
            <View>
              <Text className="text-base font-semibold text-figma-grey-900 mb-2 font-urbanist">
                Titre de l&apos;annonce *
              </Text>
              <TextInput
                className="border border-figma-border rounded-xl px-4 py-3 text-figma-grey-900 font-urbanist"
                placeholder="Ex: Belle villa moderne à Cocody"
                value={formData.title}
                onChangeText={(value) => handleInputChange("title", value)}
              />
            </View>

            {/* Listing Type */}
            <View className="mt-4">
              <Text className="text-base font-semibold text-figma-grey-900 mb-2 font-urbanist">
                Type d&apos;annonce *
              </Text>
              <View className="flex-row gap-3">
                {listingTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    className={`flex-1 border-2 rounded-xl px-4 py-3 flex-row items-center justify-center ${
                      selectedListingType === type.id
                        ? "border-figma-primary bg-figma-primary/10"
                        : "border-figma-border bg-white"
                    }`}
                    onPress={() => {
                      setSelectedListingType(type.id);
                      handleInputChange("listingType", type.id);
                    }}
                  >
                    <Text className="text-lg mr-2">{type.icon}</Text>
                    <Text
                      className={`font-medium font-urbanist ${
                        selectedListingType === type.id
                          ? "text-figma-primary"
                          : "text-figma-grey-700"
                      }`}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Property Type */}
            <View className="mt-4">
              <Text className="text-base font-semibold text-figma-grey-900 mb-2 font-urbanist">
                Type de propriété *
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {propertyTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    className={`border-2 rounded-xl px-4 py-3 flex-row items-center ${
                      selectedPropertyType === type.id
                        ? "border-figma-primary bg-figma-primary/10"
                        : "border-figma-border bg-white"
                    }`}
                    onPress={() => {
                      setSelectedPropertyType(type.id);
                      handleInputChange("propertyType", type.id);
                    }}
                  >
                    <Text className="text-lg mr-2">{type.icon}</Text>
                    <Text
                      className={`font-medium font-urbanist ${
                        selectedPropertyType === type.id
                          ? "text-figma-primary"
                          : "text-figma-grey-700"
                      }`}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price */}
            <View className="mt-4">
              <Text className="text-base font-semibold text-figma-grey-900 mb-2 font-urbanist">
                Prix (FCFA) *{selectedListingType === "rent" && " / Mois"}
                {selectedListingType === "sell" && " (Prix d'achat)"}
              </Text>
              <TextInput
                className="border border-figma-border rounded-xl px-4 py-3 text-figma-grey-900 font-urbanist"
                placeholder={
                  selectedListingType === "rent" ? "Ex: 150000" : "Ex: 45000000"
                }
                value={formData.price}
                onChangeText={(value) => handleInputChange("price", value)}
                keyboardType="numeric"
              />
            </View>

            {/* Location - Quartier */}
            <View className="mt-4">
              <Text className="text-base font-semibold text-figma-grey-900 mb-2 font-urbanist">
                Quartier *
              </Text>
              <TextInput
                className="border border-figma-border rounded-xl px-4 py-3 text-figma-grey-900 font-urbanist"
                placeholder="Ex: Koulouba, Zone du bois"
                value={formData.quartier}
                onChangeText={(value) => handleInputChange("quartier", value)}
              />
            </View>

            {/* Location - City */}
            <View className="mt-4">
              <Text className="text-base font-semibold text-figma-grey-900 mb-2 font-urbanist">
                Ville *
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {cities.map((city) => (
                  <TouchableOpacity
                    key={city}
                    className={`border rounded-lg px-3 py-2 ${
                      formData.city === city
                        ? "border-figma-primary bg-figma-primary/10"
                        : "border-figma-border bg-white"
                    }`}
                    onPress={() => handleInputChange("city", city)}
                  >
                    <Text
                      className={`text-sm font-urbanist ${
                        formData.city === city
                          ? "text-figma-primary"
                          : "text-figma-grey-700"
                      }`}
                    >
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Property Details */}
            <View className="mt-4">
              <Text className="text-base font-semibold text-figma-grey-900 mb-3 font-urbanist">
                Détails de la propriété
              </Text>
              <View className="flex-row gap-[9%]">
                <View className="flex-1 w-[30%]">
                  <Text className="text-sm text-figma-grey-600 mb-1 font-urbanist">
                    Chambres
                  </Text>
                  <TextInput
                    className="border border-figma-border rounded-xl px-4 py-3 text-figma-grey-900 font-urbanist"
                    placeholder="3"
                    value={formData.bedrooms}
                    onChangeText={(value) =>
                      handleInputChange("bedrooms", value)
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1 w-[30%]">
                  <Text className="text-sm text-figma-grey-600 mb-1 font-urbanist">
                    Salles de bain
                  </Text>
                  <TextInput
                    className="border border-figma-border rounded-xl px-4 py-3 text-figma-grey-900 font-urbanist"
                    placeholder="2"
                    value={formData.bathrooms}
                    onChangeText={(value) =>
                      handleInputChange("bathrooms", value)
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1 w-[30%]">
                  <Text className="text-sm text-figma-grey-600 mb-1 font-urbanist">
                    Superficie (m²)
                  </Text>
                  <TextInput
                    className="border border-figma-border rounded-xl px-4 py-3 text-figma-grey-900 font-urbanist"
                    placeholder="150"
                    value={formData.area}
                    onChangeText={(value) => handleInputChange("area", value)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Vehicles Field */}
              <View className="mt-4">
                <Text className="text-sm text-figma-grey-600 mb-1 font-urbanist">
                  Nombre de véhicules
                </Text>
                <TextInput
                  className="border border-figma-border rounded-xl px-4 py-3 text-figma-grey-900 font-urbanist"
                  placeholder="2"
                  value={formData.vehicles}
                  onChangeText={(value) => handleInputChange("vehicles", value)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Description */}
            <View className="mt-4">
              <Text className="text-base font-semibold text-figma-grey-900 mb-2 font-urbanist">
                Description
              </Text>
              <TextInput
                className="border border-figma-border rounded-xl px-4 py-4 text-figma-grey-900 font-urbanist min-h-[120px]"
                placeholder="Décrivez votre propriété en détail...\n\nEx: Maison moderne avec de grands espaces de vie, idéale pour les familles recherchant le confort et la proximité des commodités. Située dans un quartier calme et sécurisé..."
                value={formData.description}
                onChangeText={(value) =>
                  handleInputChange("description", value)
                }
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            {/* Photos */}
            <View className="mt-4">
              <Text className="text-base font-semibold text-figma-grey-900 mb-2 font-urbanist">
                Photos
              </Text>
              <TouchableOpacity
                className="border-2 border-dashed border-figma-primary rounded-xl p-6 items-center"
                onPress={handleAddPhoto}
              >
                <Camera size={32} color="#FF6B35" />
                <Text className="text-figma-primary font-medium mt-2 font-urbanist">
                  Ajouter des photos
                </Text>
                <Text className="text-figma-grey-600 text-sm mt-1 font-urbanist">
                  Appuyez pour sélectionner des images
                </Text>
              </TouchableOpacity>

              {/* Photo Preview */}
              {formData.photos.length > 0 && (
                <View className="mt-4">
                  <Text className="text-sm text-figma-grey-600 mb-2 font-urbanist">
                    Photos ajoutées ({formData.photos.length})
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {formData.photos.map((photo, index) => (
                      <View key={index} className="relative">
                        <Image
                          source={{ uri: photo }}
                          className="w-20 h-20 rounded-lg"
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                          onPress={() => handleRemovePhoto(index)}
                        >
                          <X size={12} color="white" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Amenities */}
            <View className="mt-4">
              <Text className="text-base font-semibold text-figma-grey-900 mb-3 font-urbanist">
                Équipements et services
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {amenities.map((amenity) => {
                  const IconComponent = amenity.icon;
                  const isSelected = formData.amenities.includes(amenity.id);
                  return (
                    <TouchableOpacity
                      key={amenity.id}
                      className={`border-2 rounded-xl px-4 py-3 flex-row items-center ${
                        isSelected
                          ? "border-figma-primary bg-figma-primary/10"
                          : "border-figma-border bg-white"
                      }`}
                      onPress={() => handleAmenityToggle(amenity.id)}
                    >
                      <IconComponent
                        size={20}
                        color={isSelected ? "#FF6B35" : amenity.color}
                      />
                      <Text
                        className={`ml-2 font-medium font-urbanist ${
                          isSelected
                            ? "text-figma-primary"
                            : "text-figma-grey-700"
                        }`}
                      >
                        {amenity.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className="bg-figma-primary rounded-xl py-4 items-center mt-6 mb-20"
              onPress={handleSubmit}
            >
              <Text className="text-white font-semibold text-lg font-urbanist">
                Publier la propriété
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AgentOnly>
  );
}
