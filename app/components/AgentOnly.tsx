import React from "react";
import { Text, View } from "react-native";
import { useUserType } from "../hooks/useUserType";

interface AgentOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AgentOnly({ children, fallback }: AgentOnlyProps) {
  const { isOwner } = useUserType();

  if (!isOwner) {
    return (
      fallback || (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-figma-grey-600 text-center font-urbanist">
            Cette fonctionnalité est réservée aux propriétaires
          </Text>
        </View>
      )
    );
  }

  return <>{children}</>;
}
