import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CameraIcon,
  CheckIcon,
  CrownIcon,
  LightningIcon,
  SealCheckIcon,
  CaretDownIcon,
  ArrowLeftIcon,
} from "phosphor-react-native";
import AgentOnly from "../../components/AgentOnly";
import { tokens } from "../../theme/tokens";
import { formatPrice } from "../../utils/formatting";
import { OutlinedField } from "../../components/OutlinedField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ChipSelectable } from "../../components/ChipSelectable";
import { PaymentModal } from "../../components/PaymentModal";

if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_SPACING = 20;
const GOLDEN_RATIO = 1.618;
const CARD_HEIGHT = Math.round(CARD_WIDTH * GOLDEN_RATIO * 0.75);
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

const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 0 : 1,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <TouchableOpacity
      onPress={toggle}
      activeOpacity={0.7}
      style={{
        backgroundColor: tokens.colors.roogo.neutral[100],
        borderRadius: 16,
        padding: 20,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontFamily: "Urbanist-SemiBold",
            color: tokens.colors.roogo.neutral[900],
            flex: 1,
            marginRight: 16,
          }}
        >
          {question}
        </Text>
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 20,
            padding: 8,
          }}
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            <CaretDownIcon
              size={16}
              color={tokens.colors.roogo.neutral[500]}
              weight="bold"
            />
          </Animated.View>
        </View>
      </View>
      {isOpen && (
        <View style={{ marginTop: 12 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Urbanist-Regular",
              color: tokens.colors.roogo.neutral[900],
              lineHeight: 22,
            }}
          >
            {answer}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
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
  const [loading, setLoading] = useState(false);

  // Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDescription, setPaymentDescription] = useState("");

  const packages: Package[] = [
    {
      id: "basic",
      name: "À nous aller",
      photos: 10,
      price: "25.000",
      color: tokens.colors.roogo.accent[500],
      bgColor: "#3FA6D9",
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
      color: tokens.colors.roogo.primary[500],
      bgColor: "#C96A2E",
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
      color: tokens.colors.roogo.primary[700],
      bgColor: "#5A321A",
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
  ];

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
    setShowForm(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);

    const selectedPkg = packages.find((pkg) => pkg.id === selectedPackage);
    Alert.alert(
      "Paiement reçu !",
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

  const handleSubmit = async () => {
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
    if (!selectedPkg) return;

    // Prepare Payment
    const price = parseInt(selectedPkg.price.replace(/\./g, ""), 10);
    setPaymentAmount(price);
    setPaymentDescription(
      `Forfait photo ${selectedPkg.name.replace(/[^a-zA-Z0-9\s]/g, "")}`
    );
    setShowPaymentModal(true);
  };

  const faqs = [
    {
      q: "Combien de temps dure une séance photo?",
      a: "Une séance photo dure généralement entre 45 minutes et 1h30, selon la taille de la propriété et le forfait choisi.",
    },
    {
      q: "Puis-je annuler ou reporter une séance?",
      a: "Oui, vous pouvez annuler ou reporter votre séance jusqu'à 24h avant l'heure prévue sans frais supplémentaires.",
    },
    {
      q: "Les photos incluent-elles les retouches?",
      a: "Oui, toutes nos photos incluent des retouches professionnelles pour garantir la meilleure qualité possible.",
    },
    {
      q: "Couvrez-vous toutes les villes du Burkina?",
      a: "Nous couvrons principalement Ouagadougou et Bobo-Dioulasso, mais nous pouvons nous déplacer dans d'autres villes sur demande (frais supplémentaires possibles).",
    },
  ];

  return (
    <AgentOnly>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: tokens.colors.roogo.neutral[100] }}
        edges={["top"]}
      >
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Header */}
          <View
            style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 }}
          >
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  backgroundColor: "rgba(201, 106, 46, 0.1)",
                  borderRadius: 100,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <CameraIcon
                  size={32}
                  color={tokens.colors.roogo.primary[500]}
                  weight="duotone"
                />
              </View>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "bold",
                  fontFamily: "Urbanist-Bold",
                  color: tokens.colors.roogo.neutral[900],
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                Services Photo Pro
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Urbanist-Regular",
                  color: tokens.colors.roogo.neutral[500],
                  textAlign: "center",
                  lineHeight: 24,
                  paddingHorizontal: 16,
                }}
              >
                Swipez pour découvrir nos offres professionnelles
              </Text>
            </View>
          </View>

          {!showForm ? (
            <>
              {/* Swipeable Cards */}
              <View style={{ marginBottom: 24, marginTop: 12 }}>
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
                      outputRange: [0.92, 1, 0.92],
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
                          style={{
                            backgroundColor: pkg.bgColor,
                            padding: 24,
                            transform: [{ scale }],
                            minHeight: CARD_HEIGHT,
                            borderRadius: 24,
                            shadowColor: pkg.bgColor,
                            shadowOffset: { width: 0, height: 12 },
                            shadowOpacity: 0.25,
                            shadowRadius: 16,
                            elevation: 8,
                          }}
                        >
                          {/* Icon */}
                          <View
                            style={{ alignItems: "center", marginBottom: 16 }}
                          >
                            <View
                              style={{
                                backgroundColor: "rgba(255,255,255,0.2)",
                                borderRadius: 50,
                                padding: 12,
                              }}
                            >
                              {pkg.id === "premium" ? (
                                <CrownIcon
                                  size={ICON_SIZE}
                                  color="white"
                                  weight="fill"
                                />
                              ) : (
                                <CameraIcon
                                  size={ICON_SIZE}
                                  color="white"
                                  weight="fill"
                                />
                              )}
                            </View>
                          </View>

                          {/* Price */}
                          <View
                            style={{ alignItems: "center", marginBottom: 20 }}
                          >
                            <Text
                              style={{
                                color: "white",
                                fontSize: 36,
                                fontFamily: "Urbanist-Bold",
                                marginBottom: 4,
                              }}
                            >
                              {formatPrice(pkg.price.replace(/\./g, ""))} FCFA
                            </Text>
                            <Text
                              style={{
                                color: "rgba(255,255,255,0.9)",
                                fontSize: 18,
                                fontFamily: "Urbanist-SemiBold",
                                textTransform: "uppercase",
                                letterSpacing: 1,
                              }}
                            >
                              {pkg.name}
                            </Text>
                          </View>

                          {/* Features */}
                          <View style={{ marginBottom: 24, gap: 12 }}>
                            {pkg.features.map(
                              (feature: string, idx: number) => (
                                <View
                                  key={idx}
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                  }}
                                >
                                  <View
                                    style={{
                                      backgroundColor: "rgba(255,255,255,0.2)",
                                      borderRadius: 12,
                                      padding: 4,
                                      marginRight: 12,
                                    }}
                                  >
                                    <CheckIcon
                                      size={14}
                                      color="white"
                                      weight="bold"
                                    />
                                  </View>
                                  <Text
                                    style={{
                                      color: "white",
                                      fontSize: 15,
                                      fontFamily: "Urbanist-Medium",
                                      flex: 1,
                                    }}
                                  >
                                    {feature}
                                  </Text>
                                </View>
                              )
                            )}
                          </View>

                          {/* CTA Button */}
                          <View
                            style={{
                              backgroundColor: "white",
                              borderRadius: 16,
                              paddingVertical: 16,
                              marginTop: "auto",
                              alignItems: "center",
                            }}
                          >
                            <Text
                              style={{
                                color: pkg.bgColor,
                                fontFamily: "Urbanist-Bold",
                                fontSize: 16,
                              }}
                            >
                              Sélectionner
                            </Text>
                          </View>
                        </Animated.View>
                      </TouchableOpacity>
                    );
                  }}
                />

                {/* Pagination Dots */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    marginTop: 24,
                    gap: 8,
                  }}
                >
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
                        style={{
                          height: 8,
                          width: index === currentCardIndex ? 24 : 8,
                          borderRadius: 4,
                          backgroundColor:
                            index === currentCardIndex
                              ? tokens.colors.roogo.primary[500]
                              : "#E5E7EB",
                        }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Why Choose Us */}
              <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: "Urbanist-Bold",
                    color: tokens.colors.roogo.neutral[900],
                    marginBottom: 20,
                  }}
                >
                  Pourquoi nous choisir?
                </Text>
                <View style={{ gap: 16 }}>
                  {[
                    {
                      icon: CameraIcon,
                      title: "Photographes professionnels",
                      desc: "Équipe expérimentée en photographie immobilière avec équipement de pointe",
                      color: "#3B82F6",
                      bg: "#EFF6FF",
                    },
                    {
                      icon: LightningIcon,
                      title: "Livraison rapide",
                      desc: "Vos photos retouchées en 24-48h maximum pour une mise en ligne rapide",
                      color: "#A855F7",
                      bg: "#F3E8FF",
                    },
                    {
                      icon: SealCheckIcon,
                      title: "Qualité garantie",
                      desc: "Retouches professionnelles et révisions illimitées jusqu'à satisfaction",
                      color: "#10B981",
                      bg: "#ECFDF5",
                    },
                  ].map((item, idx) => (
                    <View
                      key={idx}
                      style={{
                        backgroundColor: "white",
                        borderRadius: 20,
                        padding: 20,
                        flexDirection: "row",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 2,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: item.bg,
                          borderRadius: 12,
                          padding: 12,
                          marginRight: 16,
                          height: 48,
                          width: 48,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <item.icon
                          size={24}
                          color={item.color}
                          weight="duotone"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: "Urbanist-Bold",
                            color: tokens.colors.roogo.neutral[900],
                            marginBottom: 4,
                          }}
                        >
                          {item.title}
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: "Urbanist-Regular",
                            color: tokens.colors.roogo.neutral[500],
                            lineHeight: 20,
                          }}
                        >
                          {item.desc}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* FAQ Section */}
              <View
                style={{
                  paddingHorizontal: 24,
                  paddingVertical: 32,
                  backgroundColor: "white",
                  borderTopLeftRadius: 32,
                  borderTopRightRadius: 32,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: "Urbanist-Bold",
                    color: tokens.colors.roogo.neutral[900],
                    marginBottom: 24,
                  }}
                >
                  Questions fréquentes
                </Text>

                <View style={{ gap: 16 }}>
                  {faqs.map((faq, idx) => (
                    <FAQItem key={idx} question={faq.q} answer={faq.a} />
                  ))}
                </View>
              </View>
            </>
          ) : (
            /* Request Form */
            <View style={{ paddingHorizontal: 24, paddingVertical: 8 }}>
              <TouchableOpacity
                onPress={() => setShowForm(false)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <ArrowLeftIcon
                  size={20}
                  color={tokens.colors.roogo.primary[500]}
                  weight="bold"
                />
                <Text
                  style={{
                    color: tokens.colors.roogo.primary[500],
                    fontFamily: "Urbanist-Bold",
                    fontSize: 16,
                    marginLeft: 8,
                  }}
                >
                  Retour aux forfaits
                </Text>
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 24,
                  fontFamily: "Urbanist-Bold",
                  color: tokens.colors.roogo.neutral[900],
                  marginBottom: 8,
                }}
              >
                Demande de service photo
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Urbanist-Regular",
                  color: tokens.colors.roogo.neutral[500],
                  marginBottom: 32,
                }}
              >
                Remplissez les informations pour votre propriété
              </Text>

              {/* Selected Package Info */}
              <View
                style={{
                  backgroundColor: "rgba(201, 106, 46, 0.08)",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 32,
                  borderWidth: 1,
                  borderColor: "rgba(201, 106, 46, 0.2)",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Urbanist-Medium",
                    color: tokens.colors.roogo.neutral[500],
                    marginBottom: 4,
                  }}
                >
                  Forfait sélectionné
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Urbanist-Bold",
                    color: tokens.colors.roogo.neutral[900],
                  }}
                >
                  {packages.find((pkg) => pkg.id === selectedPackage)?.name}
                  {" - "}
                  <Text style={{ color: tokens.colors.roogo.primary[500] }}>
                    {formatPrice(
                      packages
                        .find((pkg) => pkg.id === selectedPackage)
                        ?.price.replace(/\./g, "") || ""
                    )}{" "}
                    FCFA
                  </Text>
                </Text>
              </View>

              <View style={{ gap: 20 }}>
                <OutlinedField
                  label="Adresse de la propriété *"
                  value={formData.propertyAddress}
                  onChangeText={(v: string) =>
                    handleInputChange("propertyAddress", v)
                  }
                  placeholder="Ex: Rue 12.45, Secteur 15"
                />

                <OutlinedField
                  label="Quartier *"
                  value={formData.quartier}
                  onChangeText={(v: string) => handleInputChange("quartier", v)}
                  placeholder="Ex: Koulouba, Zone du bois"
                />

                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Urbanist-Bold",
                      color: tokens.colors.roogo.neutral[900],
                      marginBottom: 8,
                      marginLeft: 4,
                    }}
                  >
                    Ville *
                  </Text>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                  >
                    {cities.map((city) => (
                      <ChipSelectable
                        key={city}
                        label={city}
                        selected={formData.city === city}
                        onPress={() => handleInputChange("city", city)}
                      />
                    ))}
                  </View>
                </View>

                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Urbanist-Bold",
                      color: tokens.colors.roogo.neutral[900],
                      marginBottom: 8,
                      marginLeft: 4,
                    }}
                  >
                    Type de propriété *
                  </Text>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                  >
                    {propertyTypes.map((type) => (
                      <ChipSelectable
                        key={type.id}
                        label={type.label}
                        selected={formData.propertyType === type.id}
                        onPress={() =>
                          handleInputChange("propertyType", type.id)
                        }
                      />
                    ))}
                  </View>
                </View>

                <OutlinedField
                  label="Téléphone de contact *"
                  value={formData.contactPhone}
                  onChangeText={(v: string) =>
                    handleInputChange("contactPhone", v)
                  }
                  placeholder="Ex: +226 70 12 34 56"
                  keyboardType="phone-pad"
                />

                <OutlinedField
                  label="Date préférée (optionnel)"
                  value={formData.preferredDate}
                  onChangeText={(v: string) =>
                    handleInputChange("preferredDate", v)
                  }
                  placeholder="Ex: Lundi 25 Octobre"
                />

                <OutlinedField
                  label="Notes additionnelles (optionnel)"
                  value={formData.additionalNotes}
                  onChangeText={(v: string) =>
                    handleInputChange("additionalNotes", v)
                  }
                  placeholder="Informations supplémentaires..."
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={{ marginTop: 32 }}>
                <PrimaryButton
                  title="Payer et Envoyer"
                  onPress={handleSubmit}
                  loading={loading}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Payment Modal */}
      <PaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        amount={paymentAmount}
        description={paymentDescription}
        transactionType="photography"
      />
    </AgentOnly>
  );
}
