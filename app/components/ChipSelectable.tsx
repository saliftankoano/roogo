import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ChipSelectableProps {
  label: string;
  icon?: string;
  selected: boolean;
  onPress: () => void;
  compact?: boolean;
}

export const ChipSelectable: React.FC<ChipSelectableProps> = ({
  label,
  icon,
  selected,
  onPress,
  compact = false,
}) => {
  if (selected) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={{
          shadowColor: "#3A8BFF",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <LinearGradient
          colors={["#3A8BFF", "#2C74E6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: compact ? 12 : 16,
            paddingVertical: compact ? 8 : 10,
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 12,
          }}
        >
          {icon && (
            <Text
              style={{
                fontSize: compact ? 14 : 16,
                marginRight: compact ? 5 : 6,
              }}
            >
              {icon}
            </Text>
          )}
          <Text
            style={{
              fontSize: compact ? 13 : 14,
              fontWeight: "600",
              color: "#FFFFFF",
            }}
          >
            {label}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        backgroundColor: "#FFFFFF",
        paddingHorizontal: compact ? 12 : 16,
        paddingVertical: compact ? 8 : 10,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      {icon && (
        <Text
          style={{ fontSize: compact ? 14 : 16, marginRight: compact ? 5 : 6 }}
        >
          {icon}
        </Text>
      )}
      <Text
        style={{
          fontSize: compact ? 13 : 14,
          fontWeight: "500",
          color: "#6B7280",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};
