import { useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect } from "react";
import { Platform, Text, View } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { isLoaded } = useAuth();

  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  // Handle redirect with a delay to avoid conflicts
  useEffect(() => {
    if (isLoaded) {
      // Always redirect to tabs (allows guest browsing)
      console.log("Redirecting to tabs...");
      setTimeout(() => {
        router.replace("/(tabs)/(home)");
      }, 100);
    }
  }, [isLoaded]);

  // Show loading while checking authentication status
  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-600">Chargement...</Text>
      </View>
    );
  }

  // This screen should not be visible - redirect happens in useEffect
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-lg text-gray-600">Redirection...</Text>
    </View>
  );
}
