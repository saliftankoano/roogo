import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { tokens } from "../theme/tokens";

interface SlotMeterProps {
  slotsFilled: number;
  slotLimit: number;
}

export const SlotMeter: React.FC<SlotMeterProps> = ({
  slotsFilled,
  slotLimit,
}) => {
  const percentage = Math.min((slotsFilled / slotLimit) * 100, 100);

  let urgencyColor: string = tokens.colors.roogo.primary[500]; // Default
  let urgencyText = "Places encore disponibles";
  let urgencySubtext = "";

  if (percentage >= 100) {
    urgencyColor = tokens.colors.roogo.neutral[500];
    urgencyText = "Applications fermées";
  } else if (percentage >= 90) {
    urgencyColor = tokens.colors.roogo.error;
    urgencyText = "Presque complet !";
    const left = slotLimit - slotsFilled;
    urgencySubtext = `Plus que ${left} ${left > 1 ? "places" : "place"} !`;
  } else if (percentage >= 75) {
    urgencyColor = "#F59E0B"; // Orange-500
    urgencyText = "Se remplit vite !";
  } else if (percentage >= 50) {
    urgencyText = "Déjà à moitié plein";
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.urgencyText, { color: urgencyColor }]}>
          {urgencyText}
        </Text>
        <Text style={styles.slotsCount}>
          {slotsFilled}/{slotLimit} slots
        </Text>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${percentage}%`, backgroundColor: urgencyColor },
          ]}
        />
      </View>

      {urgencySubtext ? (
        <Text style={[styles.subtext, { color: urgencyColor }]}>
          {urgencySubtext}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  urgencyText: {
    fontSize: 14,
    fontFamily: "Urbanist-Bold",
  },
  slotsCount: {
    fontSize: 13,
    fontFamily: "Urbanist-Medium",
    color: tokens.colors.roogo.neutral[500],
  },
  track: {
    height: 8,
    backgroundColor: tokens.colors.roogo.neutral[100],
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
  },
  subtext: {
    fontSize: 12,
    fontFamily: "Urbanist-Bold",
    marginTop: 4,
    textAlign: "right",
  },
});
