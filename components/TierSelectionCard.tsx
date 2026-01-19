import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CheckIcon, FireIcon } from "phosphor-react-native";
import { tokens } from "../theme/tokens";
import { formatCurrency } from "../utils/formatting";

export interface Tier {
  id: string;
  name: string;
  photo_limit: number;
  slot_limit: number;
  video_included: boolean;
  open_house_limit: number;
  min_price: number;
  has_badge?: boolean;
}

interface TierSelectionCardProps {
  tier: Tier;
  selected: boolean;
  onSelect: (tierId: string) => void;
  calculatedPrice: number;
}

export const TierSelectionCard: React.FC<TierSelectionCardProps> = ({
  tier,
  selected,
  onSelect,
  calculatedPrice,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onSelect(tier.id)}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={styles.header}>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text style={styles.name}>{tier.name}</Text>
            {tier.id === "standard" && (
              <View style={styles.popularBadgeCompact}>
                <Text style={styles.popularText}>Populaire</Text>
                <FireIcon size={10} color="white" weight="fill" />
              </View>
            )}
          </View>
            <Text style={styles.price}>{formatCurrency(calculatedPrice)}</Text>
        </View>

        <View
          style={[styles.radioButton, selected && styles.radioButtonSelected]}
        >
          {selected && <CheckIcon size={14} weight="bold" color="white" />}
        </View>
      </View>

      <View style={styles.featuresGrid}>
        <FeatureItemCompact label={`${tier.photo_limit} Photos`} />
        <FeatureItemCompact label={`${tier.slot_limit} Candidats`} />
        <FeatureItemCompact
          label={`${tier.open_house_limit} Visite${tier.open_house_limit > 1 ? "s" : ""}`}
        />
        {tier.video_included && <FeatureItemCompact label="Vidéo" />}
        {tier.has_badge && <FeatureItemCompact label="Badge Premium" />}
      </View>
    </TouchableOpacity>
  );
};

const FeatureItemCompact = ({ label }: { label: string }) => (
  <View style={styles.featureItemCompact}>
    <CheckIcon
      size={12}
      color={tokens.colors.roogo.primary[500]}
      weight="bold"
    />
    <Text style={styles.featureLabelCompact}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: tokens.colors.roogo.neutral[400], // Darkened from 300 to 400
    marginBottom: 12,
  },
  cardSelected: {
    borderColor: tokens.colors.roogo.primary[500],
    backgroundColor: tokens.colors.roogo.primary[50],
    shadowColor: tokens.colors.roogo.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  popularBadgeCompact: {
    backgroundColor: tokens.colors.roogo.primary[500],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  popularText: {
    color: "white",
    fontSize: 9,
    fontFamily: "Urbanist-Bold",
    textTransform: "uppercase",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.neutral[900],
  },
  price: {
    fontSize: 18,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.primary[500],
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: tokens.colors.roogo.neutral[500], // Darkened from 400 to 500
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    backgroundColor: tokens.colors.roogo.primary[500],
    borderColor: tokens.colors.roogo.primary[500],
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  featureItemCompact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.05)", // Slightly darker background
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    margin: 4,
    minWidth: "45%",
    flexGrow: 1,
  },
  featureLabelCompact: {
    fontSize: 11,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.neutral[700], // Darkened from 600 to 700
  },
});
