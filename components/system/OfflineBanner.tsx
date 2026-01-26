/**
 * OfflineBanner Component
 *
 * Displays a banner when the device is offline.
 * Shows at the top of the screen with animation.
 */

import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet, TouchableOpacity } from "react-native";
import { WifiSlashIcon, ArrowClockwiseIcon } from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tokens } from "@/theme/tokens";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

interface OfflineBannerProps {
  /** Custom message to display */
  message?: string;
  /** Whether to show even when online (for testing) */
  forceShow?: boolean;
}

export function OfflineBanner({
  message = "Vous êtes hors ligne. Affichage des données en cache.",
  forceShow = false,
}: OfflineBannerProps) {
  const insets = useSafeAreaInsets();
  const { isConnected, isChecking, refresh } = useNetworkStatus();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const isVisible = forceShow || (!isConnected && !isChecking);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : -100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible, slideAnim]);

  // Don't render at all if connected (saves resources)
  if (isConnected && !forceShow) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      pointerEvents={isVisible ? "auto" : "none"}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <WifiSlashIcon size={20} color="#FFFFFF" weight="bold" />
        </View>

        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={refresh}
          activeOpacity={0.7}
        >
          <ArrowClockwiseIcon size={18} color="#FFFFFF" weight="bold" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

/**
 * Compact version for inline use
 */
export function OfflineIndicator() {
  const { isConnected, isChecking } = useNetworkStatus();

  if (isConnected || isChecking) {
    return null;
  }

  return (
    <View style={styles.indicator}>
      <WifiSlashIcon size={14} color={tokens.colors.roogo.warning} weight="bold" />
      <Text style={styles.indicatorText}>Hors ligne</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: tokens.colors.roogo.neutral[900],
    zIndex: 1000,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Urbanist-Medium",
    color: "#FFFFFF",
    lineHeight: 18,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  indicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${tokens.colors.roogo.warning}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  indicatorText: {
    fontSize: 12,
    fontFamily: "Urbanist-SemiBold",
    color: tokens.colors.roogo.warning,
  },
});

export default OfflineBanner;

