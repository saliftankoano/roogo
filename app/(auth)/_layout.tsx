import { useAuth } from "@clerk/clerk-expo";
import { Stack, router } from "expo-router";
import { useEffect } from "react";

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/");
    }
  }, [isSignedIn, isLoaded]);

  // Show the auth screens while not signed in or still loading
  return <Stack screenOptions={{ headerShown: false }} />;
}
