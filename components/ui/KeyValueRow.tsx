import React from "react";
import { Text, View } from "react-native";

interface KeyValueRowProps {
  label: string;
  value: string;
  showDivider?: boolean;
}

export const KeyValueRow: React.FC<KeyValueRowProps> = ({
  label,
  value,
  showDivider = true,
}) => {
  return (
    <View>
      <View className="flex-row justify-between items-center py-3">
        <Text className="text-[14px] font-medium text-[#6A6A6A]">{label}</Text>
        <Text className="text-[14px] font-semibold text-[#111111] flex-1 text-right ml-4">
          {value}
        </Text>
      </View>
      {showDivider && <View className="h-[1px] bg-roogo-neutral-400" />}
    </View>
  );
};

