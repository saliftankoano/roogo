/**
 * ProviderSelector Component
 * 
 * Payment provider selection cards with animations.
 */

import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, Animated, StyleSheet } from "react-native";
import { tokens } from "../../theme/tokens";
import type { PaymentProvider } from "../../services/paymentService";

interface ProviderConfig {
  id: PaymentProvider;
  name: string;
  themeColor: string;
  lightColor: string;
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: "ORANGE_MONEY",
    name: "Orange Money",
    themeColor: "#FF7900",
    lightColor: "#FFF4E6",
  },
  {
    id: "MOOV_MONEY",
    name: "Moov Money",
    themeColor: "#0066B2",
    lightColor: "#E6F0FF",
  },
];

interface ProviderCardProps {
  provider: ProviderConfig;
  isSelected: boolean;
  onSelect: (id: PaymentProvider) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ProviderCard({ provider, isSelected, onSelect }: ProviderCardProps) {
  const anim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: isSelected ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isSelected, anim]);

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [tokens.colors.border, provider.themeColor],
  });

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", provider.lightColor],
  });

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  return (
    <AnimatedPressable
      style={[
        styles.card,
        {
          borderColor,
          backgroundColor,
          transform: [{ scale }],
        },
      ]}
      onPress={() => onSelect(provider.id)}
    >
      <View style={styles.cardContent}>
        <View
          style={[styles.providerIcon, { backgroundColor: provider.themeColor }]}
        />
        <Text style={styles.providerName}>{provider.name}</Text>
      </View>
    </AnimatedPressable>
  );
}

interface ProviderSelectorProps {
  selected: PaymentProvider | null;
  onSelect: (provider: PaymentProvider) => void;
}

export function ProviderSelector({ selected, onSelect }: ProviderSelectorProps) {
  return (
    <View>
      <Text style={styles.label}>Choisir l&apos;opérateur</Text>
      <View style={styles.container}>
        {PROVIDERS.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            isSelected={selected === provider.id}
            onSelect={onSelect}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.neutral[900],
    marginBottom: 12,
  },
  container: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  providerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  providerName: {
    fontSize: 14,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.neutral[900],
  },
});

export default ProviderSelector;
