import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { useFonts } from "expo-font";
import { Slot, SplashScreen } from "expo-router";
import { useEffect } from "react";
import { View, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

import "../global.css";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Handle notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function PushNotificationHandler() {
  const { isSignedIn, getToken } = useAuth();

  useEffect(() => {
    async function registerForPushNotificationsAsync() {
      if (!Device.isDevice) {
        console.log("Must use physical device for Push Notifications");
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      
      if (!projectId) {
        console.warn(
          "Push Notifications: EAS Project ID not found in app.json. " +
          "Please run 'eas project:init' or add 'extra.eas.projectId' to your app.json."
        );
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
        .data;
      console.log("Expo Push Token:", token);

      // Register token with backend if signed in
      if (isSignedIn) {
        try {
          const clerkToken = await getToken();
          const API_URL = process.env.EXPO_PUBLIC_API_URL;
          
          await fetch(`${API_URL}/api/push-tokens`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${clerkToken}`,
            },
            body: JSON.stringify({
              expoPushToken: token,
              platform: Platform.OS,
            }),
          });
        } catch (error) {
          console.error("Failed to register push token with backend:", error);
        }
      }
    }

    registerForPushNotificationsAsync();
  }, [isSignedIn]);

  return null;
}

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
      <PushNotificationHandler />
      <SafeAreaProvider>
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
