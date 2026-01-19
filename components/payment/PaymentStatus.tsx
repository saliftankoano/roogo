/**
 * PaymentStatus Component
 * 
 * Shows loading/success/error states during payment processing.
 */

import React, { useEffect, useRef } from "react";
import { View, Text, ActivityIndicator, Animated, StyleSheet } from "react-native";
import { CheckCircleIcon, XCircleIcon, ClockIcon } from "phosphor-react-native";
import { tokens } from "../../theme/tokens";
import type { PaymentPollingStatus } from "../../hooks/usePaymentPolling";

interface PaymentStatusProps {
  status: PaymentPollingStatus;
  message: string;
}

export function PaymentStatus({ status, message }: PaymentStatusProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === "success" || status === "failed" || status === "error") {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [status, scaleAnim, opacityAnim]);

  const renderIcon = () => {
    switch (status) {
      case "success":
        return (
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            }}
          >
            <CheckCircleIcon
              size={80}
              weight="fill"
              color={tokens.colors.roogo.success}
            />
          </Animated.View>
        );
      case "failed":
      case "error":
        return (
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            }}
          >
            <XCircleIcon
              size={80}
              weight="fill"
              color={tokens.colors.roogo.error}
            />
          </Animated.View>
        );
      case "timeout":
        return (
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            }}
          >
            <ClockIcon
              size={80}
              weight="fill"
              color={tokens.colors.roogo.warning}
            />
          </Animated.View>
        );
      default:
        return (
          <ActivityIndicator
            size="large"
            color={tokens.colors.roogo.primary[500]}
          />
        );
    }
  };

  const getMessageStyle = () => {
    switch (status) {
      case "success":
        return { color: tokens.colors.roogo.success, fontSize: 20 };
      case "failed":
      case "error":
        return { color: tokens.colors.roogo.error };
      case "timeout":
        return { color: tokens.colors.roogo.warning };
      default:
        return {};
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>{renderIcon()}</View>

      <Text style={[styles.message, getMessageStyle()]}>{message}</Text>

      {status === "polling" && (
        <Text style={styles.subtext}>Ne fermez pas cette fenêtre</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 40,
  },
  iconContainer: {
    marginBottom: 16,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    fontSize: 16,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.neutral[900],
    textAlign: "center",
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    fontFamily: "Urbanist-Regular",
    color: tokens.colors.roogo.neutral[500],
    textAlign: "center",
  },
});

export default PaymentStatus;
