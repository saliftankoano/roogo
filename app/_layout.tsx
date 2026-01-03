import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { useFonts } from "expo-font";
import { Slot, SplashScreen } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import "../global.css";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "dm-sans": require("../assets/fonts/dm_sans.ttf"),
    garamond: require("../assets/fonts/garamond.ttf"),
    inter: require("../assets/fonts/inter.ttf"),
    oswald: require("../assets/fonts/oswald.ttf"),
    urbanist: require("../assets/fonts/urbanist.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Don't render anything until fonts are loaded
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <SafeAreaProvider>
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
