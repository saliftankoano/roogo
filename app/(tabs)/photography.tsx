import { Camera, Check, Crown } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AgentOnly from "../components/AgentOnly";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_SPACING = 20;
const GOLDEN_RATIO = 1.618;
const CARD_HEIGHT = Math.round(CARD_WIDTH * GOLDEN_RATIO * 0.7);
const ICON_SIZE = Math.round(CARD_WIDTH * 0.14);

type Package = {
  id: string;
  name: string;
  photos: number;
  price: string;
  features: string[];
  color: string;
  bgColor: string;
};

export default function PhotographyScreen() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
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
      name: "À nous aller",
      photos: 10,
      price: "25.000",
      color: "#3B82F6",
      bgColor: "bg-blue-500",
      features: [
        "10 photos professionnelles",
        "Retouche basique",
        "Livraison en 48h",
        "Photos haute résolution",
      ],
    },
    {
      id: "standard",
      name: "Patron oubien?",
      photos: 20,
      price: "45.000",
      color: "#8B5CF6",
      bgColor: "bg-purple-500",
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
      name: "Grand Boss",
      photos: 35,
      price: "75.000",
      color: "#84CC16",
      bgColor: "bg-lime-500",
      features: [
        "35 photos professionnelles",
        "Retouche premium",
        "Livraison en 24h",
        "Photos haute résolution",
        "Vue drone complète",
        "Photos crépusculaires",
        "Visite virtuelle 360°",
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
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          {/* Header */}
          <View className="px-6 pt-4 pb-2">
            <View className="items-center">
              <View className="bg-figma-primary/10 rounded-full p-4 mb-4">
                <Camera size={32} color="#FF6B35" />
              </View>
              <Text className="text-3xl font-bold text-gray-900 text-center font-urbanist">
                Services Photo Pro
              </Text>
              <Text className="text-gray-600 text-center mt-3 px-4 font-urbanist text-base leading-6">
                Swipez pour découvrir nos offres professionnelles
              </Text>
            </View>
          </View>

          {!showForm ? (
            <>
              {/* Swipeable Cards */}
              <View className="mb-10 mt-3">
                <Animated.FlatList
                  ref={flatListRef}
                  data={packages}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={CARD_WIDTH + CARD_SPACING}
                  decelerationRate="fast"
                  scrollEventThrottle={16}
                  contentContainerStyle={{
                    paddingLeft: (SCREEN_WIDTH - CARD_WIDTH) / 2,
                    paddingRight:
                      (SCREEN_WIDTH - CARD_WIDTH) / 2 + CARD_SPACING,
                  }}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: true }
                  )}
                  onMomentumScrollEnd={(event) => {
                    const index = Math.round(
                      event.nativeEvent.contentOffset.x /
                        (CARD_WIDTH + CARD_SPACING)
                    );
                    setCurrentCardIndex(index);
                  }}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item: pkg, index }) => {
                    const inputRange = [
                      (index - 1) * (CARD_WIDTH + CARD_SPACING),
                      index * (CARD_WIDTH + CARD_SPACING),
                      (index + 1) * (CARD_WIDTH + CARD_SPACING),
                    ];
                    const scale = scrollX.interpolate({
                      inputRange,
                      outputRange: [0.9, 1, 0.9],
                      extrapolate: "clamp",
                    });
                    return (
                      <TouchableOpacity
                        onPress={() => handlePackageSelect(pkg.id)}
                        activeOpacity={0.9}
                        style={{
                          width: CARD_WIDTH,
                          marginRight: CARD_SPACING,
                        }}
                      >
                        <Animated.View
                          className={`${pkg.bgColor} rounded-3xl p-6`}
                          style={{
                            transform: [{ scale }],
                            minHeight: CARD_HEIGHT,
                            borderRadius: 24,
                            // Soft shadow without harsh rectangle
                            shadowColor: "#000",
                            shadowOpacity: 0.08,
                            shadowRadius: 16,
                            shadowOffset: { width: 0, height: 8 },
                            elevation: Platform.OS === "android" ? 0 : 3,
                          }}
                        >
                          {/* Crown Icon */}
                          <View className="items-center mb-3">
                            <View className="bg-white/30 rounded-full p-3">
                              {pkg.id === "premium" ? (
                                <Crown
                                  size={ICON_SIZE}
                                  color="white"
                                  fill="white"
                                />
                              ) : (
                                <Camera size={ICON_SIZE} color="white" />
                              )}
                            </View>
                          </View>

                          {/* Price */}
                          <View className="items-center mb-5">
                            <Text className="text-white text-4xl font-bold font-urbanist">
                              ${pkg.price}
                            </Text>
                          </View>

                          {/* Package Name */}
                          <Text className="text-white text-center text-xl font-bold mb-5 font-urbanist">
                            {pkg.name}
                          </Text>

                          {/* Features */}
                          <View className="space-y-3.5 mb-6">
                            {pkg.features.map(
                              (feature: string, idx: number) => (
                                <View
                                  key={idx}
                                  className="flex-row items-center mb-2"
                                >
                                  <View className="bg-white/25 rounded-full p-1.5 mr-3.5">
                                    <Check size={14} color="white" />
                                  </View>
                                  <Text className="text-white flex-1 font-urbanist text-sm">
                                    {feature}
                                  </Text>
                                </View>
                              )
                            )}
                          </View>

                          {/* CTA Button */}
                          <View className="bg-white rounded-2xl py-4 mt-auto">
                            <Text className="text-center font-bold text-lg font-urbanist">
                              Sélectionner
                            </Text>
                          </View>
                        </Animated.View>
                      </TouchableOpacity>
                    );
                  }}
                />

                {/* Pagination Dots */}
                <View className="flex-row justify-center mt-6 gap-2">
                  {packages.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        flatListRef.current?.scrollToIndex({
                          index,
                          animated: true,
                        });
                        setCurrentCardIndex(index);
                      }}
                    >
                      <View
                        className={`rounded-full ${
                          index === currentCardIndex
                            ? "w-8 h-3 bg-figma-primary"
                            : "w-3 h-3 bg-gray-300"
                        }`}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Why Choose Us */}
              <View className="px-6 py-8">
                <Text className="text-2xl font-bold text-gray-900 mb-6 font-urbanist">
                  Pourquoi nous choisir?
                </Text>
                <View className="space-y-5">
                  <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100">
                    <View className="flex-row items-start">
                      <View className="bg-blue-100 rounded-full p-3 mr-4">
                        <Text className="text-2xl">📸</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-gray-900 text-lg font-urbanist mb-1">
                          Photographes professionnels
                        </Text>
                        <Text className="text-gray-600 text-sm font-urbanist leading-5">
                          Équipe expérimentée en photographie immobilière avec
                          équipement de pointe
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100">
                    <View className="flex-row items-start">
                      <View className="bg-purple-100 rounded-full p-3 mr-4">
                        <Text className="text-2xl">⚡</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-gray-900 text-lg font-urbanist mb-1">
                          Livraison rapide
                        </Text>
                        <Text className="text-gray-600 text-sm font-urbanist leading-5">
                          Vos photos retouchées en 24-48h maximum pour une mise
                          en ligne rapide
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <View className="flex-row items-start">
                      <View className="bg-lime-100 rounded-full p-3 mr-4">
                        <Text className="text-2xl">✨</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-gray-900 text-lg font-urbanist mb-1">
                          Qualité garantie
                        </Text>
                        <Text className="text-gray-600 text-sm font-urbanist leading-5">
                          Retouches professionnelles et révisions illimitées
                          jusqu&apos;à satisfaction
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* FAQ Section */}
              <View className="px-6 py-8 bg-gray-50">
                <Text className="text-2xl font-bold text-gray-900 mb-6 font-urbanist">
                  Questions fréquentes
                </Text>

                <View className="space-y-3">
                  <View className="bg-white rounded-2xl p-5 border border-gray-100">
                    <View className="flex-row justify-between items-start">
                      <Text className="flex-1 text-gray-900 font-semibold font-urbanist text-base">
                        Combien de temps dure une séance photo?
                      </Text>
                      <View className="bg-gray-100 rounded-full w-6 h-6 items-center justify-center ml-3">
                        <Text className="text-gray-600 font-bold">+</Text>
                      </View>
                    </View>
                  </View>

                  <View className="bg-white rounded-2xl p-5 border border-gray-100">
                    <View className="flex-row justify-between items-start mb-3">
                      <Text className="flex-1 text-gray-900 font-semibold font-urbanist text-base">
                        Puis-je annuler ou reporter une séance?
                      </Text>
                      <View className="bg-gray-100 rounded-full w-6 h-6 items-center justify-center ml-3">
                        <Text className="text-gray-600 font-bold">−</Text>
                      </View>
                    </View>
                    <Text className="text-gray-600 text-sm font-urbanist leading-5">
                      Oui! Vous pouvez annuler ou reporter votre séance
                      jusqu&apos;à 24h avant sans frais supplémentaires.
                    </Text>
                  </View>

                  <View className="bg-white rounded-2xl p-5 border border-gray-100">
                    <View className="flex-row justify-between items-start">
                      <Text className="flex-1 text-gray-900 font-semibold font-urbanist text-base">
                        Les photos incluent-elles les retouches?
                      </Text>
                      <View className="bg-gray-100 rounded-full w-6 h-6 items-center justify-center ml-3">
                        <Text className="text-gray-600 font-bold">+</Text>
                      </View>
                    </View>
                  </View>

                  <View className="bg-white rounded-2xl p-5 border border-gray-100">
                    <View className="flex-row justify-between items-start">
                      <Text className="flex-1 text-gray-900 font-semibold font-urbanist text-base">
                        Couvrez-vous toutes les villes du Burkina?
                      </Text>
                      <View className="bg-gray-100 rounded-full w-6 h-6 items-center justify-center ml-3">
                        <Text className="text-gray-600 font-bold">+</Text>
                      </View>
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
