import { Redirect } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import { View, ActivityIndicator, Text } from "react-native";

// This route handles the OAuth callback deep link
// When OAuth completes, the browser redirects to roogo://oauth-native-callback
// expo-router intercepts this and renders this screen

// Complete any pending auth session
WebBrowser.maybeCompleteAuthSession();

export default function OAuthCallbackScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  // Show loading while Clerk processes the OAuth callback
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" }}>
        <ActivityIndicator size="large" color="#C96A2E" />
        <Text style={{ marginTop: 16, color: "#666", fontFamily: "urbanist" }}>
          Connexion en cours...
        </Text>
      </View>
    );
  }

  // If signed in with userType, go directly to tabs (skip index.tsx)
  if (isSignedIn && user?.publicMetadata?.userType) {
    return <Redirect href="/(tabs)/(home)" />;
  }

  // Otherwise go to root for onboarding/user type selection
  return <Redirect href="/" />;
}
