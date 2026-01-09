import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useUserType } from "../hooks/useUserType";
import { tokens } from "../theme/tokens";

interface AgentOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AgentOnly({ children, fallback }: AgentOnlyProps) {
  const { isOwner, isAgent, isLoaded } = useUserType();

  // Show loading indicator while auth state is loading
  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator
          size="large"
          color={tokens.colors.roogo.primary[500]}
        />
      </View>
    );
  }

  if (!isOwner && !isAgent) {
    return (
      fallback || (
        <View className="flex-1 items-center justify-center p-6 bg-white">
          <Text className="text-figma-grey-600 text-center font-urbanist">
            Cette fonctionnalité est réservée aux agents et propriétaires
          </Text>
        </View>
      )
    );
  }

  // Wrap children in a View with background to prevent any blank flash
  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>{children}</View>
  );
}
