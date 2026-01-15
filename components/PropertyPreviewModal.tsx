import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-expo";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import {
  XIcon,
  BedIcon,
  ShowerIcon,
  RulerIcon,
  CarIcon,
  MapPinIcon,
  CreditCardIcon,
  LightningIcon,
  CameraIcon,
  TagIcon,
  WifiHighIcon,
  SwimmingPoolIcon,
  SunIcon,
  ShieldCheckIcon,
  TelevisionIcon,
  TreeIcon,
  WarningCircleIcon,
  CoinsIcon,
} from "phosphor-react-native";
import { tokens } from "../theme/tokens";
import { formatPrice } from "../utils/formatting";
import type { Property } from "../constants/properties";
import { fetchPropertyTransactions } from "../services/propertyFetchService";
import { getInterdictionByLabel } from "../utils/interdictions";

interface PropertyPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  property: Property | null;
}

export default function PropertyPreviewModal({
  visible,
  onClose,
  property,
}: PropertyPreviewModalProps) {
  const { getToken } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const lastFetchedUuid = React.useRef<string | null>(null);

  const loadTransactions = useCallback(async () => {
    if (
      !property?.uuid ||
      (visible && lastFetchedUuid.current === property.uuid)
    ) {
      return;
    }

    setLoading(true);
    lastFetchedUuid.current = property.uuid;

    try {
      const token = await getToken();
      if (!token) {
        console.error("No token available for fetchPropertyTransactions");
        setLoading(false);
        return;
      }

      const data = await fetchPropertyTransactions(property.uuid, token);

      // Filter out failed transactions to show only successful or pending ones
      const relevantTransactions = data.filter(
        (tx: any) => tx.status === "completed" || tx.status === "pending"
      );

      setTransactions(relevantTransactions);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [property, getToken, visible]);

  useEffect(() => {
    if (!visible) {
      lastFetchedUuid.current = null;
      return;
    }

    if (property?.uuid) {
      loadTransactions();
    }
  }, [visible, property?.uuid, loadTransactions]);

  if (!property) return null;

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "listing_submission":
        return "Publication de l'annonce";
      case "photography":
        return "Service Photo Pro";
      case "boost":
        return "Boost (À la une)";
      case "property_lock":
        return "Réservation Early Bird";
      default:
        return type;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "listing_submission":
        return <TagIcon size={18} color={tokens.colors.roogo.primary[500]} />;
      case "photography":
        return (
          <CameraIcon size={18} color={tokens.colors.roogo.primary[500]} />
        );
      case "boost":
        return (
          <LightningIcon
            size={18}
            color={tokens.colors.roogo.primary[500]}
            weight="fill"
          />
        );
      case "property_lock":
        return (
          <CreditCardIcon size={18} color={tokens.colors.roogo.primary[500]} />
        );
      default:
        return <TagIcon size={18} color={tokens.colors.roogo.primary[500]} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return tokens.colors.roogo.success;
      case "pending":
        return tokens.colors.roogo.warning;
      case "failed":
        return tokens.colors.roogo.error;
      default:
        return tokens.colors.roogo.neutral[500];
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Payé";
      case "pending":
        return "En attente";
      case "failed":
        return "Échoué";
      default:
        return status;
    }
  };

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
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-roogo-neutral-50">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-roogo-neutral-100">
          <Text className="text-xl font-urbanist-bold text-roogo-neutral-900">
            Aperçu de l&apos;annonce
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="p-2 bg-roogo-neutral-100 rounded-full"
          >
            <XIcon
              size={20}
              color={tokens.colors.roogo.neutral[900]}
              weight="bold"
            />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Property Quick View */}
          <View className="p-6">
            <View className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-roogo-neutral-100 mb-6">
              <Image
                source={property.image}
                className="w-full h-48"
                resizeMode="cover"
              />
              <View className="p-5">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 mr-2">
                    <Text className="text-xl font-urbanist-bold text-roogo-neutral-900">
                      {property.title}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <MapPinIcon
                        size={14}
                        color={tokens.colors.roogo.neutral[500]}
                      />
                      <Text className="ml-1 text-roogo-neutral-500 text-sm font-urbanist-medium">
                        {property.location}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-lg font-urbanist-bold text-roogo-primary-500">
                    {formatPrice(property.price)}
                    <Text className="text-xs font-urbanist-medium text-roogo-neutral-500">
                      {property.period ? `/${property.period}` : ""}
                    </Text>
                  </Text>
                </View>

                <View className="flex-row justify-between mt-4">
                  <FeatureItem
                    icon={BedIcon}
                    value={property.bedrooms}
                    label="Lits"
                  />
                  <FeatureItem
                    icon={ShowerIcon}
                    value={property.bathrooms}
                    label="Bains"
                  />
                  <FeatureItem
                    icon={RulerIcon}
                    value={property.area}
                    label="m²"
                  />
                  <FeatureItem
                    icon={CarIcon}
                    value={property.parking}
                    label="Pkg"
                  />
                </View>
              </View>
            </View>

            {/* Listing Status Section */}
            <View className="bg-white rounded-3xl p-6 shadow-sm border border-roogo-neutral-100 mb-6">
              <Text className="text-lg font-urbanist-bold text-roogo-neutral-900 mb-4">
                Statut de la publication
              </Text>

              <View className="flex-row items-center justify-between bg-roogo-neutral-50 p-4 rounded-2xl mb-4">
                <View className="flex-row items-center">
                  <View
                    className={`w-3 h-3 rounded-full mr-3 ${
                      property.status === "en_ligne"
                        ? "bg-roogo-success"
                        : property.status === "en_attente"
                          ? "bg-roogo-warning"
                          : "bg-roogo-neutral-400"
                    }`}
                  />
                  <Text className="font-urbanist-bold text-roogo-neutral-900">
                    {property.status === "en_ligne"
                      ? "En ligne"
                      : property.status === "en_attente"
                        ? "En attente de validation"
                        : property.status}
                  </Text>
                </View>
                {property.published_at && (
                  <Text className="text-xs text-roogo-neutral-500 font-urbanist-medium">
                    Depuis le{" "}
                    {new Date(property.published_at).toLocaleDateString()}
                  </Text>
                )}
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1 bg-roogo-primary-50 p-4 rounded-2xl">
                  <Text className="text-roogo-primary-600 font-urbanist-bold text-lg">
                    {property.slots_filled || 0}
                  </Text>
                  <Text className="text-roogo-primary-400 text-[10px] font-urbanist-bold uppercase">
                    Candidatures
                  </Text>
                </View>
                <View className="flex-1 bg-roogo-neutral-50 p-4 rounded-2xl">
                  <Text className="text-roogo-neutral-900 font-urbanist-bold text-lg">
                    {property.isSponsored ? "Oui" : "Non"}
                  </Text>
                  <Text className="text-roogo-neutral-500 text-[10px] font-urbanist-bold uppercase">
                    Boosté (À la une)
                  </Text>
                </View>
              </View>
            </View>

            {/* Description Section */}
            {property.description && (
              <View className="bg-white rounded-3xl p-6 shadow-sm border border-roogo-neutral-100 mb-6">
                <Text className="text-lg font-urbanist-bold text-roogo-neutral-900 mb-3">
                  Description
                </Text>
                <Text className="text-roogo-neutral-500 font-urbanist leading-6">
                  {property.description}
                </Text>
              </View>
            )}

            {/* Amenities Section */}
            {property.amenities && property.amenities.length > 0 && (
              <View className="bg-white rounded-3xl p-6 shadow-sm border border-roogo-neutral-100 mb-6">
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
            )}

            {/* Conditions Section */}
            {(property.deposit ||
              (property.prohibitions && property.prohibitions.length > 0)) && (
              <View className="bg-white rounded-3xl p-6 shadow-sm border border-roogo-neutral-100 mb-6">
                <Text className="text-lg font-urbanist-bold text-roogo-neutral-900 mb-4">
                  Conditions de location
                </Text>

                {property.deposit && (
                  <View className="flex-row items-center mb-4 bg-roogo-warning/10 p-4 rounded-2xl">
                    <View className="bg-roogo-warning/20 p-2 rounded-full mr-3">
                      <CoinsIcon
                        size={20}
                        color={tokens.colors.roogo.warning}
                      />
                    </View>
                    <View>
                      <Text className="text-roogo-neutral-900 font-urbanist-bold">
                        Caution : {property.deposit} mois
                      </Text>
                      <Text className="text-roogo-neutral-600 font-urbanist-medium text-xs mt-1">
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
                          <Text className="ml-2 text-roogo-error font-urbanist-medium text-[10px] uppercase">
                            {config?.label || prohibition}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {/* Payments & Purchases Section */}
            <View className="bg-white rounded-3xl p-6 shadow-sm border border-roogo-neutral-100 mb-8">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-urbanist-bold text-roogo-neutral-900">
                  Mes Achats & Paiements
                </Text>
                <CreditCardIcon
                  size={20}
                  color={tokens.colors.roogo.neutral[400]}
                />
              </View>

              {loading ? (
                <View className="py-8 items-center">
                  <ActivityIndicator color={tokens.colors.roogo.primary[500]} />
                </View>
              ) : transactions.length === 0 ? (
                <View className="py-8 items-center bg-roogo-neutral-50 rounded-2xl border border-dashed border-roogo-neutral-200">
                  <Text className="text-roogo-neutral-400 font-urbanist-medium">
                    Aucun historique de paiement
                  </Text>
                </View>
              ) : (
                <View className="gap-3">
                  {transactions.map((tx) => (
                    <View
                      key={tx.id}
                      className="flex-row items-center p-4 bg-roogo-neutral-50 rounded-2xl border border-roogo-neutral-100"
                    >
                      <View className="bg-white p-2.5 rounded-xl mr-4 shadow-sm">
                        {getTransactionIcon(tx.type)}
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-roogo-neutral-900 font-urbanist-bold text-sm"
                          numberOfLines={1}
                        >
                          {getTransactionTypeLabel(tx.type)}
                        </Text>
                        <Text className="text-roogo-neutral-500 text-xs font-urbanist-medium mt-0.5">
                          {new Date(tx.created_at).toLocaleDateString()} •{" "}
                          {tx.provider}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-roogo-neutral-900 font-urbanist-bold text-sm">
                          {formatPrice(tx.amount)}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <View
                            className="w-1.5 h-1.5 rounded-full mr-1.5"
                            style={{
                              backgroundColor: getStatusColor(tx.status),
                            }}
                          />
                          <Text
                            className="text-[10px] font-urbanist-bold uppercase"
                            style={{ color: getStatusColor(tx.status) }}
                          >
                            {getStatusLabel(tx.status)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const FeatureItem = ({
  icon: Icon,
  value,
  label,
}: {
  icon: any;
  value: any;
  label: string;
}) => (
  <View className="items-center">
    <Icon size={20} color={tokens.colors.roogo.neutral[400]} />
    <Text className="text-roogo-neutral-900 font-urbanist-bold text-sm mt-1">
      {value || 0}
    </Text>
    <Text className="text-roogo-neutral-500 text-[10px] font-urbanist-medium uppercase tracking-tighter">
      {label}
    </Text>
  </View>
);
