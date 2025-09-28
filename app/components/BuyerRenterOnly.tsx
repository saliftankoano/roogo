import React from "react";
import { Text, View } from "react-native";
import { useUserType } from "../hooks/useUserType";

interface BuyerRenterOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function BuyerRenterOnly({
  children,
  fallback,
}: BuyerRenterOnlyProps) {
  const { isBuyerRenter } = useUserType();

  if (!isBuyerRenter) {
    return (
      fallback || (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-figma-grey-600 text-center font-urbanist">
            Cette fonctionnalité est réservée aux acheteurs et locataires
          </Text>
        </View>
      )
    );
  }

  return <>{children}</>;
}
