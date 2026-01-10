import { useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  BedIcon,
  CameraIcon,
  CarIcon,
  CaretLeftIcon,
  CoinsIcon,
  HeartIcon,
  MapPinIcon,
  RulerIcon,
  ShareNetworkIcon,
  ShieldCheckIcon,
  ShowerIcon,
  SunIcon,
  SwimmingPoolIcon,
  TelevisionIcon,
  TreeIcon,
  WarningCircleIcon,
  WifiHighIcon,
  LockIcon,
  XIcon,
  CheckCircleIcon,
} from "phosphor-react-native";
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AgentCard from "../../../components/AgentCard";
import AuthPromptModal from "../../../components/AuthPromptModal";
import ContactSheet from "../../../components/ContactSheet";
import PhotoGallery from "../../../components/PhotoGallery";
import { PrimaryButton } from "../../../components/PrimaryButton";
import type { Property } from "../../../constants/properties";
import { properties } from "../../../constants/properties";
import {
  fetchPropertyById,
  incrementPropertyViews,
} from "../../../services/propertyFetchService";
import { tokens } from "../../../theme/tokens";
import { formatPrice } from "../../../utils/formatting";
import { cn } from "../../../lib/utils";
import { getInterdictionByLabel } from "../../../utils/interdictions";
import { SlotMeter } from "../../../components/SlotMeter";
import {
  submitApplication,
  bookOpenHouseSlot,
} from "../../../services/applicationService";
import { OpenHousePickerModal } from "../../../components/OpenHousePickerModal";
import { PaymentModal } from "../../../components/PaymentModal";

// --- Lock Confirmation Modal ---
interface LockModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fee: number;
}

const LockModal: React.FC<LockModalProps> = ({
  visible,
  onClose,
  onConfirm,
  fee,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-end">
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="flex-1"
        />
        <View className="bg-white rounded-t-[40px] px-8 pt-10 pb-12 shadow-2xl">
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute right-6 top-6 bg-roogo-neutral-100 p-2 rounded-full z-10"
          >
            <XIcon
              size={20}
              color={tokens.colors.roogo.neutral[500]}
              weight="bold"
            />
          </TouchableOpacity>

          <View className="items-center mb-8">
            <View className="bg-roogo-primary-50 w-20 h-20 rounded-full items-center justify-center mb-6 overflow-hidden">
              <LinearGradient
                colors={[tokens.colors.roogo.primary[50], "#FFF"]}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
              <LockIcon
                size={40}
                color={tokens.colors.roogo.primary[500]}
                weight="fill"
              />
            </View>

            <Text className="text-3xl font-urbanist-bold text-roogo-neutral-900 text-center mb-2 px-2">
              Réserver en Exclusivité
            </Text>
            <Text className="text-roogo-neutral-500 font-urbanist-medium text-center px-4 leading-6">
              Soyez le premier à sécuriser ce bien avant tout le monde. Une
              opportunité unique pour cette perle rare.
            </Text>
          </View>

          <View className="bg-roogo-neutral-50 rounded-[32px] p-6 mb-10 border border-roogo-neutral-100">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-roogo-neutral-900 font-urbanist-bold text-lg">
                  Frais Early Bird
                </Text>
                <Text className="text-roogo-neutral-400 font-urbanist-medium text-xs">
                  Priorité exclusive 48h
                </Text>
              </View>
              <Text className="text-roogo-primary-500 font-urbanist-bold text-2xl">
                {formatPrice(fee)} XOF
              </Text>
            </View>

            <View className="h-[1px] bg-roogo-neutral-200 mb-4" />

            <View className="flex-row items-start">
              <View className="bg-roogo-primary-500/10 p-1.5 rounded-full mr-3 mt-0.5">
                <ShieldCheckIcon
                  size={14}
                  color={tokens.colors.roogo.primary[500]}
                  weight="bold"
                />
              </View>
              <Text className="flex-1 text-[11px] text-roogo-neutral-500 font-urbanist-medium leading-4">
                Ces frais sécurisent le retrait immédiat de l&apos;annonce pour
                vous. Le loyer sera réglé séparément au propriétaire.
              </Text>
            </View>
          </View>

          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-roogo-neutral-100 py-5 rounded-2xl items-center"
            >
              <Text className="text-roogo-neutral-600 font-urbanist-bold text-base">
                Annuler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.9}
              className="flex-[2] bg-roogo-primary-500 py-5 rounded-2xl items-center shadow-lg shadow-roogo-primary-500/40"
            >
              <Text className="text-white font-urbanist-bold text-base">
                Payer {formatPrice(fee)} XOF
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- Early Bird Banner ---
const EarlyBirdBanner = ({
  timeLeft,
  fee,
}: {
  timeLeft: string;
  fee: number;
}) => {
  return (
    <View className="bg-roogo-primary-50 border border-roogo-primary-100 rounded-[24px] p-5 mb-8">
      <View className="flex-row items-center mb-3">
        <View className="bg-roogo-primary-500/10 p-2 rounded-full mr-3">
          <LockIcon
            size={20}
            color={tokens.colors.roogo.primary[500]}
            weight="fill"
          />
        </View>
        <Text className="text-lg font-urbanist-bold text-roogo-primary-600">
          Accès Exclusif Early Bird
        </Text>
      </View>

      <View className="h-[1px] bg-roogo-primary-100/50 mb-4" />

      <Text className="text-roogo-neutral-600 font-urbanist text-sm mb-4 leading-5">
        Réserver ce bien avant l&apos;ouverture des candidatures gratuites.
        Cette opportunité expire dans :
      </Text>

      <View className="bg-white/80 py-3 rounded-2xl items-center mb-4">
        <Text className="text-2xl font-urbanist-bold text-roogo-primary-500 tracking-wider">
          ⏱️ {timeLeft}
        </Text>
      </View>

      <Text className="text-xs text-roogo-primary-400 font-urbanist-medium text-center italic">
        Seulement {formatPrice(fee)} XOF pour sécuriser votre priorité.
      </Text>
    </View>
  );
};

export default function PropertyDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isContactSheetVisible, setIsContactSheetVisible] = useState(false);
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);
  const [authPromptVisible, setAuthPromptVisible] = useState(false);
  const { user } = useUser();
  const isAuthenticated = !!user;

  const [property, setProperty] = useState<Property | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // --- Early Bird Logic ---
  const [isLockModalVisible, setIsLockModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const earlyBirdWindow = useMemo(() => {
    if (!property?.published_at) return null;
    const publishedDate = new Date(property.published_at);
    const endDate = new Date(publishedDate.getTime() + 48 * 60 * 60 * 1000);
    return endDate;
  }, [property?.published_at]);

  const isEarlyBirdActive = useMemo(() => {
    if (!earlyBirdWindow || property?.status !== "en_ligne") return false;
    return new Date() < earlyBirdWindow;
  }, [earlyBirdWindow, property?.status]);

  const lockFee = useMemo(() => {
    if (!property?.price) return 10000;
    const rent = Number(property.price);
    return Math.max(rent * 0.1, 10000);
  }, [property?.price]);

  useEffect(() => {
    if (!earlyBirdWindow || !isEarlyBirdActive) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = earlyBirdWindow.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft("Terminé");
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [earlyBirdWindow, isEarlyBirdActive]);

  const handleLockPress = () => {
    if (!isAuthenticated) {
      setAuthPromptVisible(true);
      return;
    }
    setIsLockModalVisible(true);
  };

  const onLockConfirm = () => {
    setIsLockModalVisible(false);
    setIsPaymentModalVisible(true);
  };

  const onLockSuccess = () => {
    setIsPaymentModalVisible(false);
    // Optimistically update property status or fetch again
    if (property) {
      setProperty({ ...property, status: "locked", is_locked: true });
    }
    Alert.alert(
      "🎉 Réservé !",
      "Félicitations, vous avez verrouillé ce bien. Le propriétaire vous contactera sous peu pour la signature du bail.",
      [{ text: "Super", onPress: () => {} }]
    );
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      setAuthPromptVisible(true);
      return;
    }

    if (!property?.uuid || !user?.id) return;

    setIsApplying(true);
    try {
      const result = await submitApplication(property.uuid, user.id);
      if (result.success) {
        setHasApplied(true);
        Alert.alert(
          "C'est fait !",
          "Votre candidature a été envoyée avec succès. Voulez-vous maintenant choisir une date de visite ?",
          [
            { text: "Plus tard", style: "cancel" },
            { text: "Voir les dates", onPress: () => setShowPicker(true) },
          ]
        );
        // Optionally refresh property to update slots_filled
        if (property.slots_filled !== undefined) {
          setProperty({ ...property, slots_filled: property.slots_filled + 1 });
        }
      } else {
        Alert.alert("Oups", result.error || "Une erreur est survenue.");
      }
    } catch (error) {
      console.error("Error applying:", error);
      Alert.alert("Erreur", "Impossible d'envoyer votre candidature.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleBookSlot = async (slotId: string) => {
    if (!user?.id) return;
    const result = await bookOpenHouseSlot(slotId, user.id);
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -4,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bounceAnim]);

  // Track if we've already incremented views for this property
  const hasIncrementedViews = useRef(false);

  useEffect(() => {
    const loadProperty = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      const propertyId = Array.isArray(id) ? id[0] : id;
      const isUUID = propertyId.includes("-");

      try {
        setLoading(true);
        if (isUUID) {
          const fetchedProperty = await fetchPropertyById(propertyId);
          setProperty(fetchedProperty || undefined);

          // Increment views if this is a real property and user is not the owner
          if (fetchedProperty?.uuid && !hasIncrementedViews.current) {
            const userEmail = user?.primaryEmailAddress?.emailAddress;
            const isOwner =
              userEmail && fetchedProperty.agent?.email === userEmail;

            if (!isOwner) {
              hasIncrementedViews.current = true;
              incrementPropertyViews(fetchedProperty.uuid);
            }
          }
        } else {
          const numericId = parseInt(propertyId, 10);
          if (!Number.isNaN(numericId)) {
            const mockProperty = properties.find(
              (item) => item.id === numericId
            );
            setProperty(mockProperty);
          }
        }
      } catch (error) {
        console.error("Error loading property:", error);
        const numericId = parseInt(propertyId, 10);
        if (!Number.isNaN(numericId)) {
          const mockProperty = properties.find((item) => item.id === numericId);
          setProperty(mockProperty);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [id, user?.primaryEmailAddress?.emailAddress]);

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator
          size="large"
          color={tokens.colors.roogo.primary[500]}
        />
      </View>
    );
  }

  if (!property) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-lg font-urbanist-bold text-roogo-neutral-900 text-center mb-4">
          Propriété introuvable.
        </Text>
        <PrimaryButton
          title="Retour à l'accueil"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes("wifi") || lower.includes("internet"))
      return WifiHighIcon;
    if (lower.includes("piscine")) return SwimmingPoolIcon;
    if (lower.includes("solaire") || lower.includes("panneau")) return SunIcon;
    if (lower.includes("sécurité") || lower.includes("gardien"))
      return ShieldCheckIcon;
    if (lower.includes("cinéma") || lower.includes("tv")) return TelevisionIcon;
    if (lower.includes("jardin") || lower.includes("parc")) return TreeIcon;
    return WarningCircleIcon;
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: property.agent ? 0 : 120 }}
        bounces={false}
      >
        {/* Immersive Header Image */}
        <View className="h-[420px] relative w-full">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              setGalleryInitialIndex(0);
              setIsGalleryVisible(true);
            }}
            className="w-full h-full"
          >
            <Image
              source={property.image}
              className="w-full h-full"
              resizeMode="cover"
            />
            <LinearGradient
              colors={["rgba(0,0,0,0.6)", "transparent", "rgba(0,0,0,0.3)"]}
              style={{ position: "absolute", inset: 0 }}
            />
          </TouchableOpacity>

          {/* Status Badge */}
          {(property.status === "locked" ||
            property.status === "finalized") && (
            <View className="absolute top-28 left-6 z-10">
              <View
                className={cn(
                  "px-4 py-2 rounded-2xl flex-row items-center backdrop-blur-md shadow-lg",
                  property.status === "locked"
                    ? "bg-roogo-primary-500/90"
                    : "bg-green-600/90"
                )}
              >
                {property.status === "locked" ? (
                  <LockIcon size={16} color="white" weight="fill" />
                ) : (
                  <CheckCircleIcon size={16} color="white" weight="fill" />
                )}
                <Text className="ml-2 text-white font-urbanist-bold text-sm uppercase tracking-widest">
                  {property.status === "locked" ? "Réservé" : "Loué"}
                </Text>
              </View>
            </View>
          )}

          {/* Header Actions */}
          <SafeAreaView className="absolute top-0 left-0 right-0 flex-row justify-between items-center px-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center backdrop-blur-md"
            >
              <CaretLeftIcon size={24} color="#FFFFFF" weight="bold" />
            </TouchableOpacity>

            <View className="flex-row gap-3">
              <TouchableOpacity className="w-10 h-10 rounded-full bg-white/20 items-center justify-center backdrop-blur-md">
                <ShareNetworkIcon size={20} color="#FFFFFF" weight="bold" />
              </TouchableOpacity>
              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-white/20 items-center justify-center backdrop-blur-md"
                onPress={() => {
                  if (!isAuthenticated) setAuthPromptVisible(true);
                }}
              >
                <HeartIcon size={20} color="#FFFFFF" weight="bold" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Photo Counter Badge - Explicit Button with Icon Bounce Animation */}
          <View
            style={{
              position: "absolute",
              bottom: 48,
              right: 24,
              zIndex: 10,
              alignItems: "flex-end",
              gap: 8,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setGalleryInitialIndex(0);
                setIsGalleryVisible(true);
              }}
              className="bg-black/70 px-4 py-2.5 rounded-full flex-row items-center backdrop-blur-md border border-white/20 shadow-lg shadow-black/20"
            >
              <Animated.View
                style={{ transform: [{ translateY: bounceAnim }] }}
              >
                <CameraIcon size={16} color="white" weight="fill" />
              </Animated.View>
              <Text className="ml-2 text-white text-sm font-urbanist-bold">
                Voir les photos ({property.images ? property.images.length : 1})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content - Overlapping Sheet */}
        <View className="-mt-8 bg-white rounded-t-[32px] px-6 pt-8 min-h-screen shadow-lg shadow-black/10">
          {/* Header Info */}
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1 mr-4">
              <Text className="text-2xl font-urbanist-bold text-roogo-neutral-900 mb-1 leading-tight">
                {property.propertyType === "Villa"
                  ? "Villa de Luxe"
                  : property.address}
              </Text>
              <View className="flex-row items-center">
                <MapPinIcon
                  size={16}
                  color={tokens.colors.roogo.neutral[500]}
                  weight="fill"
                />
                <Text className="ml-1 text-roogo-neutral-500 font-urbanist-medium text-sm">
                  {property.address}
                </Text>
              </View>
            </View>
            <View>
              <Text className="text-xl font-urbanist-bold text-roogo-primary-500">
                {formatPrice(property.price)}
              </Text>
              <Text className="text-xs text-roogo-neutral-500 font-urbanist text-right">
                {property.period || "par mois"}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View className="h-[1px] bg-roogo-neutral-100 my-6" />

          {/* Early Bird Banner vs Slot Meter */}
          {isEarlyBirdActive && timeLeft ? (
            <EarlyBirdBanner timeLeft={timeLeft} fee={lockFee} />
          ) : property.slot_limit && property.status === "en_ligne" ? (
            <SlotMeter
              slotsFilled={property.slots_filled || 0}
              slotLimit={property.slot_limit}
            />
          ) : null}

          {/* Key Features Row */}
          <View className="flex-row justify-between mb-8">
            <FeatureItem
              icon={BedIcon}
              value={property.bedrooms}
              label="Chambres"
            />
            <FeatureItem
              icon={ShowerIcon}
              value={property.bathrooms}
              label="Douches"
            />
            <FeatureItem icon={RulerIcon} value={property.area} label="m²" />
            <FeatureItem
              icon={CarIcon}
              value={property.parking}
              label="Parking"
            />
          </View>

          {/* Description */}
          <View className="mb-8">
            <Text className="text-lg font-urbanist-bold text-roogo-neutral-900 mb-3">
              Description
            </Text>
            <Text className="text-roogo-neutral-500 font-urbanist leading-6">
              {property.description}
            </Text>
          </View>

          {/* Amenities */}
          <View className="mb-8">
            <Text className="text-lg font-urbanist-bold text-roogo-neutral-900 mb-4">
              Équipements
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {property.amenities.map((amenity, idx) => {
                const Icon = getAmenityIcon(amenity);
                return (
                  <View
                    key={idx}
                    className="bg-roogo-neutral-100 px-4 py-3 rounded-2xl flex-row items-center"
                  >
                    <Icon
                      size={18}
                      color={tokens.colors.roogo.neutral[900]}
                      weight="duotone"
                    />
                    <Text className="ml-2 text-roogo-neutral-900 font-urbanist-medium text-sm">
                      {amenity}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Rental Conditions (Caution & Interdictions) */}
          {(property.deposit ||
            (property.prohibitions && property.prohibitions.length > 0)) && (
            <View className="mb-8">
              <Text className="text-lg font-urbanist-bold text-roogo-neutral-900 mb-4">
                Conditions
              </Text>

              {property.deposit && (
                <View className="flex-row items-center mb-4 bg-roogo-warning/10 p-4 rounded-2xl">
                  <View className="bg-roogo-warning/20 p-2 rounded-full mr-3">
                    <CoinsIcon size={20} color={tokens.colors.roogo.warning} />
                  </View>
                  <View>
                    <Text className="text-roogo-neutral-900 font-urbanist-bold">
                      Caution : {property.deposit} mois
                    </Text>
                    <Text className="text-roogo-neutral-600 font-urbanist-medium text-sm mt-1">
                      Total:{" "}
                      {formatPrice(
                        String(Number(property.price) * property.deposit)
                      )}{" "}
                      CFA
                    </Text>
                  </View>
                </View>
              )}

              {property.prohibitions && property.prohibitions.length > 0 && (
                <View className="flex-row flex-wrap gap-2">
                  {property.prohibitions.map((prohibition, idx) => {
                    const config = getInterdictionByLabel(prohibition);
                    const Icon = config?.icon || WarningCircleIcon;
                    return (
                      <View
                        key={idx}
                        className="flex-row items-center border border-roogo-error/20 bg-roogo-error/5 px-3 py-2 rounded-xl"
                      >
                        <Icon
                          size={14}
                          color={tokens.colors.roogo.error}
                          weight="fill"
                        />
                        <Text className="ml-2 text-roogo-error font-urbanist-medium text-xs">
                          {config?.label || prohibition}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* Agent Card (Inline if agent exists) */}
          {property.agent && (
            <View className="mb-8">
              <AgentCard
                agent={property.agent}
                onContactPress={() => setIsContactSheetVisible(true)}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Contact Footer */}
      <View className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-white border-t border-roogo-neutral-100">
        {property.status === "locked" ? (
          <View className="flex-row gap-3">
            <View className="flex-1">
              <PrimaryButton title="Ce bien est réservé" disabled={true} />
            </View>
          </View>
        ) : isEarlyBirdActive ? (
          <View className="flex-row gap-3">
            {!property.agent && (
              <TouchableOpacity
                onPress={() => setIsContactSheetVisible(true)}
                className="flex-1 bg-roogo-neutral-100 py-4 rounded-2xl items-center justify-center"
              >
                <Text className="text-roogo-neutral-900 font-urbanist-bold text-base">
                  Contacter
                </Text>
              </TouchableOpacity>
            )}
            <View className="flex-[2]">
              <PrimaryButton
                title={`🔒 Réserver - ${formatPrice(lockFee)} XOF`}
                onPress={handleLockPress}
              />
            </View>
          </View>
        ) : (
          <View>
            <View className="flex-row gap-3 mb-3">
              {!property.agent && (
                <TouchableOpacity
                  onPress={() => setIsContactSheetVisible(true)}
                  className="flex-1 bg-roogo-neutral-100 py-4 rounded-2xl items-center justify-center"
                >
                  <Text className="text-roogo-neutral-900 font-urbanist-bold text-base">
                    Contacter
                  </Text>
                </TouchableOpacity>
              )}
              <View className="flex-[2]">
                <PrimaryButton
                  title={
                    hasApplied
                      ? "Réserver une visite"
                      : (property.slots_filled ?? 0) >=
                          (property.slot_limit ?? 1)
                        ? "Plus de places"
                        : "Postuler gratuitement"
                  }
                  onPress={hasApplied ? () => setShowPicker(true) : handleApply}
                  loading={isApplying}
                  disabled={
                    !hasApplied &&
                    (property.slots_filled ?? 0) >= (property.slot_limit ?? 1)
                  }
                />
              </View>
            </View>
            {/* Show disabled Early Bird button if expired to show it was an option */}
            {!isEarlyBirdActive &&
              property.published_at &&
              property.status === "en_ligne" && (
                <TouchableOpacity
                  disabled={true}
                  className="w-full bg-roogo-neutral-100 py-3 rounded-2xl items-center opacity-60 flex-row justify-center gap-2"
                >
                  <LockIcon
                    size={16}
                    color={tokens.colors.roogo.neutral[400]}
                  />
                  <Text className="text-roogo-neutral-400 font-urbanist-bold text-sm">
                    Early Bird terminé
                  </Text>
                </TouchableOpacity>
              )}
          </View>
        )}
      </View>

      {/* Modals */}
      <LockModal
        visible={isLockModalVisible}
        onClose={() => setIsLockModalVisible(false)}
        onConfirm={onLockConfirm}
        fee={lockFee}
      />

      <PaymentModal
        visible={isPaymentModalVisible}
        onClose={() => setIsPaymentModalVisible(false)}
        onSuccess={onLockSuccess}
        amount={lockFee}
        description={`Réservation Early Bird: ${property.address}`}
        transactionType="property_lock"
        propertyId={property.uuid}
      />
      <ContactSheet
        visible={isContactSheetVisible}
        onClose={() => setIsContactSheetVisible(false)}
        property={property}
      />

      <PhotoGallery
        visible={isGalleryVisible}
        images={property.images || [property.image]}
        initialIndex={galleryInitialIndex}
        onClose={() => setIsGalleryVisible(false)}
      />

      <AuthPromptModal
        visible={authPromptVisible}
        onClose={() => setAuthPromptVisible(false)}
        title="Enregistrez vos favoris"
        description="Connectez-vous pour sauvegarder vos propriétés favorites"
      />

      <OpenHousePickerModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        propertyId={property.uuid || ""}
        availableSlots={(property.openHouseSlots || []) as any}
        onBook={handleBookSlot}
      />
    </View>
  );
}

const FeatureItem = ({
  icon: Icon,
  value,
  label,
}: {
  icon: any;
  value?: number | string;
  label: string;
}) => (
  <View className="items-center bg-roogo-neutral-100/50 p-3 rounded-2xl w-[22%]">
    <View className="bg-white p-2 rounded-full shadow-sm shadow-black/5 mb-2">
      <Icon size={20} color={tokens.colors.roogo.primary[500]} weight="fill" />
    </View>
    <Text className="text-roogo-neutral-900 font-urbanist-bold text-base">
      {value || 0}
    </Text>
    <Text className="text-roogo-neutral-500 font-urbanist text-[10px] uppercase tracking-wider">
      {label}
    </Text>
  </View>
);
