import React, { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
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
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CameraIcon,
  CheckIcon,
  LightningIcon,
  SealCheckIcon,
  CaretDownIcon,
  ArrowLeftIcon,
  CubeIcon,
  VideoCameraIcon,
  MapPinIcon,
  PlusIcon,
  UsersIcon,
  RocketIcon,
  CalendarIcon,
} from "phosphor-react-native";
import { useUser } from "@clerk/clerk-expo";
import AgentOnly from "../../components/AgentOnly";
import { tokens } from "../../theme/tokens";
import { formatPrice } from "../../utils/formatting";
import { OutlinedField } from "../../components/OutlinedField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { PaymentModal } from "../../components/PaymentModal";
import { fetchUserProperties } from "../../services/propertyFetchService";
import type { Property } from "../../constants/properties";

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
  price: number;
  features: string[];
  color: string;
  bgColor: string;
  icon: any;
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
  const { user } = useUser();
  const [userProperties, setUserProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );
  const [loadingProperties, setLoadingProperties] = useState(false);
  const hasLoadedOnce = useRef(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const [formData, setFormData] = useState({
    contactPhone: user?.primaryPhoneNumber?.toString() || "",
    preferredDate: "",
    additionalNotes: "",
  });

  // Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDescription, setPaymentDescription] = useState("");

  const packages: Package[] = [
    {
      id: "boost",
      name: "Boost 'A la Une'",
      price: 7000,
      color: "#F59E0B",
      bgColor: "#F59E0B",
      icon: RocketIcon,
      features: [
        "En tête de liste",
        "Pendant 7 jours",
        "Badge 'A la Une'",
        "Visibilité maximale",
      ],
    },
    {
      id: "extra_slots",
      name: "+25 Candidats",
      price: 7500,
      color: tokens.colors.roogo.primary[500],
      bgColor: tokens.colors.roogo.primary[500],
      icon: UsersIcon,
      features: [
        "25 slots supplémentaires",
        "Plus de choix",
        "Clôture rapide",
        "Activation instantanée",
      ],
    },
    {
      id: "extra_photos",
      name: "Pack +5 Photos Pro",
      price: 10000,
      color: tokens.colors.roogo.accent[500],
      bgColor: "#3FA6D9",
      icon: CameraIcon,
      features: [
        "5 photos professionnelles",
        "Retouche premium",
        "Livraison en 24h",
        "Mise à jour automatique",
      ],
    },
    {
      id: "video",
      name: "Vidéo Pro",
      price: 10000,
      color: "#8B5CF6",
      bgColor: "#8B5CF6",
      icon: VideoCameraIcon,
      features: [
        "Vidéo immersive (1-2 min)",
        "Montage professionnel",
        "Musique libre de droits",
        "Format RS (9:16) inclus",
      ],
    },
    {
      id: "3d_env",
      name: "Environnement 3D",
      price: 25000,
      color: tokens.colors.roogo.primary[700],
      bgColor: "#5A321A",
      icon: CubeIcon,
      features: [
        "Visite virtuelle 3D",
        "Immersion totale",
        "Plan de masse 3D",
        "Lien partageable",
      ],
    },
    {
      id: "open_house",
      name: "+1 Session Visite",
      price: 3000,
      color: "#10B981",
      bgColor: "#10B981",
      icon: CalendarIcon,
      features: [
        "1h de visite groupée",
        "Staff Roogo inclus",
        "Logistique gérée",
        "Rapport de visite",
      ],
    },
  ];

  const loadProperties = useCallback(async () => {
    if (!user?.id) return;
    try {
      // Only show loading on first load
      if (!hasLoadedOnce.current) {
        setLoadingProperties(true);
      }
      const props = await fetchUserProperties(user.id);
      setUserProperties(props);
      hasLoadedOnce.current = true;
    } catch (error) {
      console.error("Error loading user properties:", error);
    } finally {
      setLoadingProperties(false);
    }
  }, [user?.id]);

  // Use useFocusEffect to reload when tab is focused
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        loadProperties();
      }
    }, [user?.id, loadProperties])
  );

  const handlePackageSelect = (packageId: string) => {
    if (!selectedPropertyId) {
      Alert.alert(
        "Sélection requise",
        "Veuillez d'abord sélectionner une propriété à améliorer."
      );
      return;
    }
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
      `Votre demande pour le service ${selectedPkg?.name} a été envoyée. Nous vous contacterons bientôt.`
    );

    // Reset form
    setFormData({
      contactPhone: user?.primaryPhoneNumber?.toString() || "",
      preferredDate: "",
      additionalNotes: "",
    });
    setSelectedPackage(null);
    setShowForm(false);
    setSelectedPropertyId(null);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.contactPhone) {
      Alert.alert("Erreur", "Veuillez remplir votre numéro de contact");
      return;
    }

    const selectedPkg = packages.find((pkg) => pkg.id === selectedPackage);
    if (!selectedPkg) return;

    // Prepare Payment
    setPaymentAmount(selectedPkg.price);
    setPaymentDescription(
      `${selectedPkg.name.replace(/[^a-zA-Z0-9\s]/g, "")} - Prop ${selectedPropertyId?.substring(0, 8)}`
    );
    setShowPaymentModal(true);
  };

  const faqs = [
    {
      q: "Comment fonctionne l'amélioration d'annonce ?",
      a: "Une fois le paiement effectué, les services digitaux (Boost, Slots) sont activés instantanément. Pour les interventions techniques (Photo, Vidéo, 3D), notre équipe vous contacte pour planifier une séance.",
    },
    {
      q: "Le Boost 'A la Une' dure combien de temps ?",
      a: "L'option Boost place votre annonce en tête des résultats de recherche pendant 7 jours consécutifs, avec un badge distinctif pour attirer l'œil.",
    },
    {
      q: "Combien de temps dure une séance photo/vidéo ?",
      a: "Une séance dure généralement entre 45 minutes et 1h30, selon l'option choisie et la taille de la propriété.",
    },
    {
      q: "Quand mon annonce sera-t-elle mise à jour ?",
      a: "Pour les séances photo/vidéo, vos nouveaux visuels sont traités et ajoutés à votre annonce sous 24h à 48h.",
    },
  ];

  const selectedProperty = userProperties.find(
    (p) => p.uuid === selectedPropertyId
  );

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
                <LightningIcon
                  size={32}
                  color={tokens.colors.roogo.primary[500]}
                  weight="duotone"
                />
              </View>
              <Text
                style={{
                  fontSize: 28,
                  fontFamily: "Urbanist-Bold",
                  color: tokens.colors.roogo.neutral[900],
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                Améliorations & Boosts
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
                Boostez la visibilité de vos biens avec nos options premium
              </Text>
            </View>
          </View>

          {!showForm ? (
            <>
              {/* Property Selection */}
              <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Urbanist-Bold",
                    color: tokens.colors.roogo.neutral[900],
                    marginBottom: 16,
                  }}
                >
                  1. Sélectionnez une propriété
                </Text>

                {loadingProperties && !hasLoadedOnce.current ? (
                  <ActivityIndicator
                    color={tokens.colors.roogo.primary[500]}
                    style={{ marginVertical: 20 }}
                  />
                ) : userProperties.length === 0 ? (
                  <View
                    style={{
                      backgroundColor: "white",
                      borderRadius: 24,
                      padding: 24,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: tokens.colors.roogo.neutral[200],
                      borderStyle: "dashed",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: tokens.colors.roogo.neutral[50],
                        padding: 16,
                        borderRadius: 50,
                        marginBottom: 16,
                      }}
                    >
                      <PlusIcon
                        size={24}
                        color={tokens.colors.roogo.neutral[400]}
                      />
                    </View>
                    <Text
                      style={{
                        fontFamily: "Urbanist-Bold",
                        color: tokens.colors.roogo.neutral[900],
                        fontSize: 16,
                        marginBottom: 4,
                      }}
                    >
                      Aucune annonce active
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Urbanist-Medium",
                        color: tokens.colors.roogo.neutral[500],
                        fontSize: 14,
                        textAlign: "center",
                        marginBottom: 20,
                      }}
                    >
                      Vous devez avoir une annonce publiée pour commander une
                      amélioration.
                    </Text>
                    <TouchableOpacity
                      style={{
                        backgroundColor: tokens.colors.roogo.primary[500],
                        paddingHorizontal: 24,
                        paddingVertical: 12,
                        borderRadius: 16,
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontFamily: "Urbanist-Bold",
                        }}
                      >
                        Publier une annonce
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginHorizontal: -24 }}
                    contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
                  >
                    {userProperties.map((prop) => (
                      <TouchableOpacity
                        key={prop.uuid}
                        onPress={() => setSelectedPropertyId(prop.uuid!)}
                        style={{
                          width: 160,
                          backgroundColor: "white",
                          borderRadius: 20,
                          padding: 12,
                          borderWidth: 2,
                          borderColor:
                            selectedPropertyId === prop.uuid
                              ? tokens.colors.roogo.primary[500]
                              : "transparent",
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.05,
                          shadowRadius: 8,
                          elevation: 2,
                        }}
                      >
                        <Image
                          source={
                            prop.image ||
                            require("../../assets/images/white_villa.jpg")
                          }
                          style={{
                            width: "100%",
                            height: 100,
                            borderRadius: 14,
                            marginBottom: 8,
                          }}
                        />
                        <Text
                          numberOfLines={1}
                          style={{
                            fontFamily: "Urbanist-Bold",
                            fontSize: 14,
                            color: tokens.colors.roogo.neutral[900],
                          }}
                        >
                          {prop.title}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: 4,
                          }}
                        >
                          <MapPinIcon
                            size={10}
                            color={tokens.colors.roogo.neutral[400]}
                          />
                          <Text
                            numberOfLines={1}
                            style={{
                              fontFamily: "Urbanist-Medium",
                              fontSize: 10,
                              color: tokens.colors.roogo.neutral[400],
                              marginLeft: 2,
                              flex: 1,
                            }}
                          >
                            {prop.location}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              {userProperties.length > 0 && (
                <>
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: "Urbanist-Bold",
                      color: tokens.colors.roogo.neutral[900],
                      marginBottom: 16,
                      marginHorizontal: 24,
                    }}
                  >
                    2. Choisissez un pack
                  </Text>

                  {/* Swipeable Cards */}
                  <View style={{ marginBottom: 24 }}>
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
                                style={{
                                  alignItems: "center",
                                  marginBottom: 16,
                                }}
                              >
                                <View
                                  style={{
                                    backgroundColor: "rgba(255,255,255,0.2)",
                                    borderRadius: 50,
                                    padding: 12,
                                  }}
                                >
                                  <pkg.icon
                                    size={ICON_SIZE}
                                    color="white"
                                    weight="fill"
                                  />
                                </View>
                              </View>

                              {/* Price */}
                              <View
                                style={{
                                  alignItems: "center",
                                  marginBottom: 20,
                                }}
                              >
                                <Text
                                  style={{
                                    color: "white",
                                    fontSize: 36,
                                    fontFamily: "Urbanist-Bold",
                                    marginBottom: 4,
                                  }}
                                >
                                  {formatPrice(pkg.price)} FCFA
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
                                          backgroundColor:
                                            "rgba(255,255,255,0.2)",
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
                                  Commander
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
                </>
              )}

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
                      desc: "Vos photos retouchées en 72h pour une mise en ligne rapide",
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
                Commander l&apos;amélioration
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Urbanist-Regular",
                  color: tokens.colors.roogo.neutral[500],
                  marginBottom: 32,
                }}
              >
                Propriété:{" "}
                <Text style={{ color: tokens.colors.roogo.neutral[900] }}>
                  {selectedProperty?.title}
                </Text>
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
                  Pack sélectionné
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
                      packages.find((pkg) => pkg.id === selectedPackage)
                        ?.price || 0
                    )}{" "}
                    FCFA
                  </Text>
                </Text>
              </View>

              <View style={{ gap: 20 }}>
                <OutlinedField
                  label="Numéro de contact *"
                  value={formData.contactPhone}
                  onChangeText={(v: string) =>
                    handleInputChange("contactPhone", v)
                  }
                  placeholder="Ex: +226 70 12 34 56"
                  keyboardType="phone-pad"
                />

                {(selectedPackage === "extra_photos" ||
                  selectedPackage === "video" ||
                  selectedPackage === "3d_env") && (
                  <OutlinedField
                    label="Date souhaitée pour la séance (optionnel)"
                    value={formData.preferredDate}
                    onChangeText={(v: string) =>
                      handleInputChange("preferredDate", v)
                    }
                    placeholder="Ex: Lundi prochain matin"
                  />
                )}

                <OutlinedField
                  label={
                    selectedPackage === "boost" ||
                    selectedPackage === "extra_slots"
                      ? "Notes additionnelles (optionnel)"
                      : "Notes pour l'équipe (optionnel)"
                  }
                  value={formData.additionalNotes}
                  onChangeText={(v: string) =>
                    handleInputChange("additionalNotes", v)
                  }
                  placeholder={
                    selectedPackage === "boost" ||
                    selectedPackage === "extra_slots"
                      ? "Précisez vos besoins particuliers..."
                      : "Ex: Code portail, meilleur moment de la journée..."
                  }
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={{ marginTop: 32 }}>
                <PrimaryButton
                  title="Confirmer et Payer"
                  onPress={handleSubmit}
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
        propertyId={selectedPropertyId || undefined}
      />
    </AgentOnly>
  );
}
