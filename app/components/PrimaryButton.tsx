import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  loading,
  disabled,
  ...touchableProps
}) => {
  const isDisabled = disabled || loading;

  if (isDisabled) {
    return (
      <TouchableOpacity
        {...touchableProps}
        disabled={true}
        style={[
          {
            height: 52,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#E5E7EB",
          },
          touchableProps.style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#9CA3AF" size="small" />
        ) : (
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#9CA3AF",
            }}
          >
            {title}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      {...touchableProps}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        {
          height: 52,
          borderRadius: 12,
          overflow: "hidden",
          shadowColor: "#3A8BFF",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        },
        touchableProps.style,
      ]}
    >
      <LinearGradient
        colors={["#3A8BFF", "#2C74E6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#FFFFFF",
            }}
          >
            {title}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};
