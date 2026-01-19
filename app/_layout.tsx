import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { useFonts } from "expo-font";
import { Slot, SplashScreen } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { PostHogProvider } from "posthog-react-native";

import "../global.css";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Handle notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
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

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
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
  }, [isSignedIn, getToken]);

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

  // Show loading indicator while fonts load
  if (!fontsLoaded && !fontError) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#C96A2E" />
      </View>
    );
  }

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <PostHogProvider
        apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY}
        options={{
          host: "https://us.i.posthog.com",
          enableSessionReplay: true,
          sessionReplayConfig: {
            maskAllTextInputs: true,
            maskAllImages: false,
            captureLog: true,
            captureNetworkTelemetry: true,
            throttleDelayMs: 1000,
          },
        }}
      >
        <PushNotificationHandler />
        <SafeAreaProvider>
          <View style={{ flex: 1 }}>
            <Slot />
          </View>
        </SafeAreaProvider>
      </PostHogProvider>
    </ClerkProvider>
  );
}
