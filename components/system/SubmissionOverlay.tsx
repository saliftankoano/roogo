import { tokens } from "@/theme/tokens";
import { BlurView } from "expo-blur";
import { CheckIcon, CloudArrowUpIcon, HouseIcon, ImageIcon } from "phosphor-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

interface SubmissionOverlayProps {
  visible: boolean;
  status: string;
  isSuccess?: boolean;
}

export const SubmissionOverlay: React.FC<SubmissionOverlayProps> = ({
  visible,
  status,
  isSuccess = false,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const iconScale = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset values
      if (!isSuccess) {
        iconScale.setValue(1);
      }

      // Entrance
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation for icon
      if (!isSuccess) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(iconScale, {
              toValue: 1.1,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(iconScale, {
              toValue: 1,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ).start();

        // Indeterminate progress bar
        Animated.loop(
          Animated.sequence([
            Animated.timing(progressAnim, {
              toValue: 1,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(progressAnim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      }
    } else {
      // Exit
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        scale.setValue(0.8);
        progressAnim.setValue(0);
      });
    }
  }, [visible, isSuccess, opacity, scale, iconScale, progressAnim]);

  // Handle Success Pop
  useEffect(() => {
    if (isSuccess && visible) {
      iconScale.stopAnimation();
      progressAnim.stopAnimation();

      iconScale.setValue(0.5);
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  }, [isSuccess, visible, iconScale, progressAnim]);

  if (!visible) return null;

  const getIcon = () => {
    if (isSuccess) {
      return (
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: tokens.colors.roogo.success,
              shadowColor: tokens.colors.roogo.success,
            },
          ]}
        >
          <CheckIcon size={48} color="white" weight="bold" />
        </View>
      );
    }

    const IconComponent =
      status.includes("photo") || status.includes("Optimisation")
        ? ImageIcon
        : status.includes("Envoi") || status.includes("cloud")
          ? CloudArrowUpIcon
          : HouseIcon;

    return (
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: tokens.colors.roogo.primary[500] },
        ]}
      >
        <IconComponent size={40} color="white" weight="regular" />
      </View>
    );
  };

  const translateX = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200], // Move across the container width
  });

  return (
    <View style={styles.absoluteContainer} pointerEvents="none">
      <Animated.View style={[styles.absoluteContainer, { opacity }]}>
        <BlurView intensity={80} tint="light" style={styles.blurContainer}>
          <Animated.View
            style={[styles.contentContainer, { transform: [{ scale }] }]}
          >
            <Animated.View
              style={[
                styles.iconContainer,
                { transform: [{ scale: iconScale }] },
              ]}
            >
              {getIcon()}
            </Animated.View>

            <Text style={styles.title}>
              {isSuccess ? "Annonce soumise !" : "Soumission en cours"}
            </Text>

            <Text style={styles.statusText}>{status}</Text>

            {!isSuccess && (
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: "50%", // Shorter bar moving across
                        transform: [{ translateX }],
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </Animated.View>
        </BlurView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  absoluteContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  blurContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  contentContainer: {
    backgroundColor: "white",
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 26,
    width: 300,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 12,
  },
  iconContainer: {
    marginBottom: 18,
  },
  iconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.neutral[900],
    marginBottom: 8,
  },
  statusText: {
    fontSize: 13,
    fontFamily: "Urbanist-Medium",
    color: tokens.colors.roogo.neutral[500],
    textAlign: "center",
    marginBottom: 18,
  },
  progressBarContainer: {
    width: "100%",
    marginTop: 6,
  },
  progressBar: {
    height: 8,
    width: "100%",
    backgroundColor: tokens.colors.roogo.neutral[100],
    borderRadius: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: tokens.colors.roogo.primary[500],
    borderRadius: 8,
    opacity: 0.9,
  },
});

