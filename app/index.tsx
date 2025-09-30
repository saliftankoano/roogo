import { useAuth, useClerk, useSSO } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const { signOut } = useClerk();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  // Debug authentication state
  useEffect(() => {
    console.log("Auth state:", { isSignedIn, isLoaded });
  }, [isSignedIn, isLoaded]);

  const { startSSOFlow } = useSSO();

  // Handle redirect with a delay to avoid conflicts
  useEffect(() => {
    if (isSignedIn && isLoaded) {
      console.log("User is signed in, preparing redirect...");
      setShouldRedirect(true);
      // Use a small delay to ensure the redirect works properly
      setTimeout(() => {
        router.replace("/");
      }, 100);
    }
  }, [isSignedIn, isLoaded]);

  // Show loading while checking authentication status
  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-600">Chargement...</Text>
      </View>
    );
  }

  // Redirect to home if user is already signed in
  if (shouldRedirect) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-600">
          Redirection vers l&apos;accueil...
        </Text>
      </View>
    );
  }

  console.log("User is not signed in, showing login screen");

  // Debug function to clear session
  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <View className="w-screen h-screen mt-0 mb-0">
      <StatusBar barStyle="light-content" />

      {/* Top 60% - Background Image */}
      <View className="flex-1 justify-center items-center h-[60%]">
        <Image
          source={require("../assets/images/white_villa_bg.jpg")}
          style={{
            width: "150%",
            height: "100%",
            position: "absolute",
            left: -100,
          }}
          contentFit="cover"
        />

        {/* Dark overlay on image */}
        <View className="absolute inset-0 bg-black/40" />
      </View>
      {/* Bottom 40% - Dark background */}
      <View className="h-[40%] bg-[#FFCB99]/95">
        {/* Title Section */}
        <View className="title-container z-20 mt-[-10px]">
          <Text className=" text-white text-5xl font-semibold text-left pl-6 leading-tightest font-urbanist">
            Trouvez le
          </Text>
          <Text className=" text-white text-5xl font-semibold text-left pl-6 mb-6 leading-tightest font-urbanist">
            logement parfait
          </Text>
        </View>
        {/* Login/Signup Buttons */}
        <View className="login-signup-container w-screen z-20 flex-row gap-4 px-4 items-center justify-center">
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity className="login-container w-[20%] bg-[#55A6E5] rounded-full px-5 py-4 flex-1 justify-center items-center shadow-lg shadow-black/30 active:opacity-80">
              <Text className=" text-white text-2xl text-left leading-tight font-urbanist">
                Se connecter
              </Text>
            </TouchableOpacity>
          </Link>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity className="signup-container w-[20%] bg-transparent border-2 border-white/80 rounded-full px-5 py-4 flex-1 justify-center items-center shadow-lg shadow-black/20 active:opacity-80">
              <Text className=" text-white text-2xl text-left leading-tight font-urbanist">
                S&apos;inscrire
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
        {/* Debug Button */}
        <View className="z-20 mt-4 items-center">
          <TouchableOpacity
            onPress={handleSignOut}
            className="bg-red-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">Debug: Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View className="absolute inset-0 bg-black/40 z-10" />
      </View>
    </View>
  );
}
