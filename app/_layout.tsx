import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import "../global.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "dm-sans": require("../assets/fonts/dm_sans.ttf"),
    garamond: require("../assets/fonts/garamond.ttf"),
    inter: require("../assets/fonts/inter.ttf"),
    oswald: require("../assets/fonts/oswald.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
