import { Check } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { tokens } from "../theme/tokens";

interface Step {
  id: number;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
}

const AnimatedStep: React.FC<{
  step: Step;
  isCompleted: boolean;
  isCurrent: boolean;
}> = ({ step, isCompleted, isCurrent }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isCurrent) {
      // Entrance animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }).start();

      // Continuous pulse animation for current step
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else if (isCompleted) {
      // Completion animation
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.15,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();

      pulseAnim.setValue(1);
    } else {
      scaleAnim.setValue(1);
      pulseAnim.setValue(1);
    }
  }, [isCurrent, isCompleted, scaleAnim, pulseAnim]);

  const animatedStyle = {
    transform: [{ scale: isCurrent ? pulseAnim : scaleAnim }],
  };

  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Animated.View style={animatedStyle}>
        {isCompleted ? (
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              overflow: "hidden",
              shadowColor: tokens.colors.roogo.success,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <View
              style={{
                width: "100%",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: tokens.colors.roogo.success,
              }}
            >
              <Check size={16} color="#FFFFFF" strokeWidth={3} />
            </View>
          </View>
        ) : isCurrent ? (
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              overflow: "hidden",
              shadowColor: tokens.colors.roogo.primary[500],
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <View
              style={{
                width: "100%",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: tokens.colors.roogo.primary[500],
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Urbanist-Bold",
                  color: "#FFFFFF",
                }}
              >
                {step.id}
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFFFFF",
              borderWidth: 2,
              borderColor: tokens.colors.roogo.neutral[200],
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Urbanist-SemiBold",
                color: tokens.colors.roogo.neutral[400],
              }}
            >
              {step.id}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Label */}
      <Text
        style={{
          fontSize: 11,
          fontFamily: isCurrent ? "Urbanist-Bold" : "Urbanist-Medium",
          marginTop: 6,
          textAlign: "center",
          color: isCurrent
            ? tokens.colors.roogo.primary[500]
            : isCompleted
              ? tokens.colors.roogo.success
              : tokens.colors.roogo.neutral[400],
        }}
      >
        {step.label}
      </Text>
    </View>
  );
};

const AnimatedConnectingLine: React.FC<{
  isCompleted: boolean;
}> = ({ isCompleted }) => {
  const progressAnim = useRef(new Animated.Value(isCompleted ? 1 : 0)).current;

  useEffect(() => {
    if (isCompleted) {
      // Smooth fill animation when step is completed
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false, // width animation requires non-native driver
      }).start();
    } else {
      // Reset if not completed
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isCompleted, progressAnim]);

  const animatedWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View
      style={{
        height: 2,
        flex: 0.8,
        marginHorizontal: 6,
        marginTop: -20,
        backgroundColor: tokens.colors.roogo.neutral[200],
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={{
          width: animatedWidth,
          height: "100%",
          backgroundColor: tokens.colors.roogo.success,
          borderRadius: 1,
        }}
      />
    </View>
  );
};

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  completedSteps,
}) => {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 10,
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* Step indicators */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isLineCompleted =
            completedSteps.includes(step.id) || currentStep > step.id;

          return (
            <React.Fragment key={step.id}>
              <AnimatedStep
                step={step}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
              />

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <AnimatedConnectingLine isCompleted={isLineCompleted} />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};
