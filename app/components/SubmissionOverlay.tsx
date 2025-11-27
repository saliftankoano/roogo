import { BlurView } from "expo-blur";
import {
  Check,
  CloudUpload,
  Home,
  Image as ImageIcon,
} from "lucide-react-native";
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
          ])
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
          ])
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
        <View style={[styles.iconCircle, { backgroundColor: "#10B981" }]}>
          <Check size={48} color="white" strokeWidth={3} />
        </View>
      );
    }

    const IconComponent =
      status.includes("photo") || status.includes("Optimisation")
        ? ImageIcon
        : status.includes("Envoi") || status.includes("cloud")
          ? CloudUpload
          : Home;

    return (
      <View style={[styles.iconCircle, { backgroundColor: "#3B82F6" }]}>
        <IconComponent size={40} color="white" />
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
              {isSuccess ? "Annonce publiée !" : "Publication en cours"}
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
    padding: 32,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    width: "85%",
    maxWidth: 340,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  statusText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    height: 24,
  },
  progressBarContainer: {
    width: "100%",
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 16,
  },
  progressBar: {
    flex: 1,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 3,
  },
});
