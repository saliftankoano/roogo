import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  LayoutAnimation,
} from "react-native";
import {
  XIcon,
  VideoCameraIcon,
  UsersIcon,
  CameraIcon,
  CubeIcon,
  CheckCircleIcon,
  LightningIcon,
} from "phosphor-react-native";
import { tokens } from "../theme/tokens";
import { PrimaryButton } from "./PrimaryButton";

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: any;
}

const ADD_ONS: AddOn[] = [
  {
    id: "video",
    name: "Vidéo Professionnelle",
    description: "Une vidéo immersive pour booster vos visites de 40%.",
    price: 10000,
    icon: VideoCameraIcon,
  },
  {
    id: "extra_slots",
    name: "+25 Candidats",
    description:
      "Augmentez vos chances de trouver le bon locataire rapidement.",
    price: 7500,
    icon: UsersIcon,
  },
  {
    id: "3d_env",
    name: "Environnement 3D",
    description: "Une visite virtuelle 3D pour une immersion totale.",
    price: 25000,
    icon: CubeIcon,
  },
  {
    id: "extra_photos",
    name: "Pack +5 Photos Pro",
    description: "Capturez chaque détail important de votre propriété.",
    price: 10000,
    icon: CameraIcon,
  },
  {
    id: "boost",
    name: "Boost 'A la Une'",
    description: "Votre annonce en tête de liste pendant 7 jours.",
    price: 7000,
    icon: LightningIcon,
  },
];

interface UpsellModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedAddOns: string[]) => void;
  currentTierId?: string;
}

export const UpsellModal: React.FC<UpsellModalProps> = ({
  visible,
  onClose,
  onConfirm,
  currentTierId,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleAddOn = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const totalPrice = selectedIds.reduce((sum, id) => {
    const addOn = ADD_ONS.find((a) => a.id === id);
    return sum + (addOn?.price || 0);
  }, 0);

  // Filter out video if it's already in Standard or Premium
  const filteredAddOns = ADD_ONS.filter((addon) => {
    if (
      addon.id === "video" &&
      (currentTierId === "standard" || currentTierId === "premium")
    ) {
      return false;
    }
    return true;
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Booster votre annonce ?</Text>
              <Text style={styles.subtitle}>
                Options recommandées pour une clôture rapide
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <XIcon size={24} color={tokens.colors.roogo.neutral[900]} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
          >
            {filteredAddOns.map((addon) => {
              const isSelected = selectedIds.includes(addon.id);
              const Icon = addon.icon;

              return (
                <TouchableOpacity
                  key={addon.id}
                  activeOpacity={0.7}
                  onPress={() => toggleAddOn(addon.id)}
                  style={[
                    styles.addOnCard,
                    isSelected && styles.addOnCardSelected,
                  ]}
                >
                  <View style={styles.iconContainer}>
                    <Icon
                      size={24}
                      color={
                        isSelected
                          ? tokens.colors.roogo.primary[500]
                          : tokens.colors.roogo.neutral[500]
                      }
                      weight={isSelected ? "fill" : "regular"}
                    />
                  </View>

                  <View style={styles.content}>
                    <Text style={styles.addOnName}>{addon.name}</Text>
                    <Text style={styles.addOnDesc}>{addon.description}</Text>
                    <Text style={styles.addOnPrice}>
                      + {formatPrice(addon.price)} XOF
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                    ]}
                  >
                    {isSelected && (
                      <CheckCircleIcon
                        size={20}
                        color={tokens.colors.roogo.primary[500]}
                        weight="fill"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            {selectedIds.length > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Options:</Text>
                <Text style={styles.totalValue}>
                  + {formatPrice(totalPrice)} XOF
                </Text>
              </View>
            )}
            <PrimaryButton
              title={
                selectedIds.length > 0
                  ? "Continuer avec les options"
                  : "Continuer sans options"
              }
              onPress={() => onConfirm(selectedIds)}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: "85%",
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.roogo.neutral[100],
  },
  title: {
    fontSize: 22,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.neutral[900],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Urbanist-Medium",
    color: tokens.colors.roogo.neutral[500],
  },
  closeButton: {
    padding: 4,
  },
  scrollArea: {
    padding: 24,
  },
  addOnCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: tokens.colors.roogo.neutral[400], // Darkened from 300 to 400
    marginBottom: 16,
    backgroundColor: "white",
  },
  addOnCardSelected: {
    borderColor: tokens.colors.roogo.primary[500],
    backgroundColor: tokens.colors.roogo.primary[50],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: tokens.colors.roogo.neutral[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  addOnName: {
    fontSize: 16,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.neutral[900],
    marginBottom: 2,
  },
  addOnDesc: {
    fontSize: 12,
    fontFamily: "Urbanist-Medium",
    color: tokens.colors.roogo.neutral[500],
    marginBottom: 6,
  },
  addOnPrice: {
    fontSize: 14,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.primary[500],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: tokens.colors.roogo.neutral[200],
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  checkboxSelected: {
    borderColor: "transparent",
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.roogo.neutral[100],
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.neutral[500],
  },
  totalValue: {
    fontSize: 18,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.primary[500],
  },
});
