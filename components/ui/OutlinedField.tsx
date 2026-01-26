import React, { useState } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";
import { tokens } from "@/theme/tokens";

interface OutlinedFieldProps extends TextInputProps {
  label?: string;
  labelIcon?: React.ReactNode;
  error?: string;
  required?: boolean;
}

export const OutlinedField: React.FC<OutlinedFieldProps> = ({
  label,
  labelIcon,
  error,
  required,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-5">
      {label && (
        <View className="flex-row items-center mb-2">
          {labelIcon && <View className="mr-2">{labelIcon}</View>}
          <Text className="text-sm font-bold text-roogo-neutral-900 font-urbanist">
            {label}
            {required && <Text className="text-roogo-error"> *</Text>}
          </Text>
        </View>
      )}
      <View
        style={{
          shadowColor: isFocused ? tokens.colors.roogo.primary[500] : "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isFocused ? 0.1 : 0.03,
          shadowRadius: 8,
          elevation: isFocused ? 4 : 2,
        }}
      >
        <TextInput
          {...textInputProps}
          style={[
            {
              height: 56,
              borderWidth: 1.5,
              borderRadius: 16,
              paddingHorizontal: 18,
              fontSize: 16,
              fontFamily: "Urbanist-SemiBold",
              color: tokens.colors.roogo.neutral[900],
              backgroundColor: "#FFFFFF",
              borderColor: error
                ? tokens.colors.roogo.error
                : isFocused
                  ? tokens.colors.roogo.primary[500]
                  : tokens.colors.roogo.neutral[200],
            },
            textInputProps.style,
          ]}
          placeholderTextColor={tokens.colors.roogo.neutral[400]}
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
        />
      </View>
      {error && (
        <Text className="text-xs text-roogo-error mt-1.5 font-urbanist font-medium ml-1">
          {error}
        </Text>
      )}
    </View>
  );
};

