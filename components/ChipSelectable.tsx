import React from "react";
import { Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { tokens } from "../theme/tokens";

interface ChipSelectableProps {
  label: string;
  icon?: React.ReactNode | string;
  selected: boolean;
  onPress: () => void;
  compact?: boolean;
  style?: ViewStyle;
}

export const ChipSelectable: React.FC<ChipSelectableProps> = ({
  label,
  icon,
  selected,
  onPress,
  compact = false,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        {
          backgroundColor: selected
            ? tokens.colors.roogo.neutral[900]
            : "#FFFFFF",
          paddingHorizontal: compact ? 16 : 20,
          paddingVertical: compact ? 10 : 12,
          borderRadius: 100,
          borderWidth: selected ? 0 : 1.5,
          borderColor: tokens.colors.roogo.neutral[200],
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: selected ? tokens.colors.roogo.neutral[900] : "#000",
          shadowOffset: { width: 0, height: selected ? 4 : 2 },
          shadowOpacity: selected ? 0.2 : 0.03,
          shadowRadius: selected ? 8 : 4,
          elevation: selected ? 6 : 2,
          marginRight: 8,
          marginBottom: 8,
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
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        style={{
          fontSize: compact ? 14 : 15,
          fontFamily: "Urbanist-Bold",
          color: selected ? "#FFFFFF" : tokens.colors.roogo.neutral[500],
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};
