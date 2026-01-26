import React, { useRef, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  Animated,
} from "react-native";
import { tokens } from "@/theme/tokens";

interface ChipSelectableProps {
  label: string;
  icon?: React.ReactNode | string;
  selected: boolean;
  onPress: () => void;
  compact?: boolean;
  style?: ViewStyle;
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export const ChipSelectable: React.FC<ChipSelectableProps> = ({
  label,
  icon,
  selected,
  onPress,
  compact = false,
  style,
}) => {
  const anim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: selected ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [selected, anim]);

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: false,
      speed: 20,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: false,
      speed: 20,
    }).start();
  };

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FFFFFF", tokens.colors.roogo.neutral[900]],
  });

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [tokens.colors.border, tokens.colors.roogo.neutral[900]],
  });

  const borderWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.5, 0],
  });

  const shadowOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.03, 0.2],
  });

  const elevation = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 6],
  });

  const textColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [tokens.colors.roogo.neutral[500], "#FFFFFF"],
  });

  return (
    <AnimatedTouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={1}
      style={[
        {
          backgroundColor,
          paddingHorizontal: compact ? 16 : 20,
          paddingVertical: compact ? 10 : 12,
          borderRadius: 100,
          borderWidth,
          borderColor,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: selected ? tokens.colors.roogo.neutral[900] : "#000",
          shadowOffset: { width: 0, height: selected ? 4 : 2 },
          shadowOpacity,
          shadowRadius: selected ? 8 : 4,
          elevation,
          marginRight: 8,
          marginBottom: 8,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      {icon && (
        <View style={{ marginRight: 8 }}>
          {typeof icon === "string" ? (
            <Text style={{ fontSize: compact ? 16 : 18 }}>{icon}</Text>
          ) : (
            icon
          )}
        </View>
      )}
      <Animated.Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        style={{
          fontSize: compact ? 14 : 15,
          fontFamily: "Urbanist-Bold",
          color: textColor,
        }}
      >
        {label}
      </Animated.Text>
    </AnimatedTouchableOpacity>
  );
};

