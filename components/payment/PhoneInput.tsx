/**
 * PhoneInput Component
 * 
 * Phone number input with Burkina Faso formatting.
 */

import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { tokens } from "../../theme/tokens";
import type { PaymentProvider } from "../../services/paymentService";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  provider: PaymentProvider | null;
}

/**
 * Format phone number for Burkina Faso (8 digits in groups of 2)
 */
function formatPhoneNumber(text: string): string {
  // Remove all non-numeric characters
  const cleaned = text.replace(/[^0-9]/g, "");
  // Limit to 8 digits (Burkina Faso phone numbers)
  const limited = cleaned.slice(0, 8);
  // Format in groups of 2 digits: "70 12 34 56"
  return limited.match(/.{1,2}/g)?.join(" ") || limited;
}

/**
 * Get placeholder text based on provider
 */
function getPlaceholder(provider: PaymentProvider | null): string {
  switch (provider) {
    case "ORANGE_MONEY":
      return "Ex: 07 34 56 78 (test)";
    case "MOOV_MONEY":
      return "Ex: 02 34 56 78 (test)";
    default:
      return "Ex: 70 12 34 56";
  }
}

/**
 * Get helper text based on provider
 */
function getHelperText(provider: PaymentProvider | null): string {
  switch (provider) {
    case "ORANGE_MONEY":
      return "Test: 07 34 56 78 (succès)";
    case "MOOV_MONEY":
      return "Test: 02 34 56 78 (succès)";
    default:
      return "Sélectionnez un opérateur pour voir les numéros de test";
  }
}

export function PhoneInput({ value, onChange, provider }: PhoneInputProps) {
  const handleChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    onChange(formatted);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Numéro de téléphone</Text>
      <TextInput
        style={styles.input}
        placeholder={getPlaceholder(provider)}
        placeholderTextColor={tokens.colors.roogo.neutral[400]}
        value={value}
        onChangeText={handleChange}
        keyboardType="phone-pad"
        maxLength={11} // 8 digits + 3 spaces
      />
      <Text style={styles.helperText}>{getHelperText(provider)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.neutral[900],
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: "Urbanist-Regular",
    color: tokens.colors.roogo.neutral[900],
  },
  helperText: {
    fontSize: 12,
    fontFamily: "Urbanist-Regular",
    color: tokens.colors.roogo.neutral[500],
    marginTop: 8,
  },
});

export default PhoneInput;
