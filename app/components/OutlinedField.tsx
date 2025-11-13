import React, { useState } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface OutlinedFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  required?: boolean;
}

export const OutlinedField: React.FC<OutlinedFieldProps> = ({
  label,
  error,
  required,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#374151",
            marginBottom: 8,
          }}
        >
          {label}
          {required && (
            <Text style={{ color: "#EF4444", fontWeight: "600" }}> *</Text>
          )}
        </Text>
      )}
      <TextInput
        {...textInputProps}
        style={[
          {
            height: 48,
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 14,
            fontSize: 15,
            fontWeight: "500",
            color: "#111827",
            backgroundColor: "#FFFFFF",
            borderColor: error ? "#EF4444" : isFocused ? "#3A8BFF" : "#E5E7EB",
          },
          textInputProps.style,
        ]}
        placeholderTextColor="#9CA3AF"
        onFocus={(e) => {
          setIsFocused(true);
          textInputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          textInputProps.onBlur?.(e);
        }}
      />
      {error && (
        <Text
          style={{
            fontSize: 12,
            color: "#EF4444",
            marginTop: 4,
            fontWeight: "500",
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};
