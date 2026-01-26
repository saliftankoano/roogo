import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { tokens } from "@/theme/tokens";

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
            height: 54,
            borderRadius: 100,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#F3F4F6",
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
              fontFamily: "Urbanist-Bold",
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
          height: 54,
          borderRadius: 100,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: tokens.colors.roogo.primary[500],
          shadowColor: tokens.colors.roogo.primary[500],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        },
        touchableProps.style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Urbanist-Bold",
            color: "#FFFFFF",
          }}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

