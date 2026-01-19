/**
 * OrangeOTPInput Component
 * 
 * OTP input for Orange Money pre-authorization code.
 */

import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { tokens } from "../../theme/tokens";

interface OrangeOTPInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function OrangeOTPInput({ value, onChange }: OrangeOTPInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Code d&apos;autorisation (OTP)</Text>
      <TextInput
        style={styles.input}
        placeholder="Entrez le code à 6 chiffres"
        placeholderTextColor={tokens.colors.roogo.neutral[400]}
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
        maxLength={6}
      />
      <Text style={styles.ussdHelper}>
        Composez <Text style={styles.ussdCode}>*144*4*6#</Text> pour générer
        votre code (valable 15 min).
      </Text>
      <Text style={styles.sandboxHelper}>
        En test, utilisez n&apos;importe quel code à 6 chiffres (ex: 666666).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
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
    marginBottom: 8,
  },
  ussdHelper: {
    fontSize: 14,
    fontFamily: "Urbanist-Medium",
    color: tokens.colors.roogo.neutral[700],
    marginBottom: 4,
  },
  ussdCode: {
    color: tokens.colors.roogo.primary[500],
    fontFamily: "Urbanist-Bold",
  },
  sandboxHelper: {
    fontSize: 12,
    fontFamily: "Urbanist-Regular",
    fontStyle: "italic",
    color: tokens.colors.roogo.neutral[500],
  },
});

export default OrangeOTPInput;
