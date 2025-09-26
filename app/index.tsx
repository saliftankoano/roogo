import { useSSO } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";
import { Image } from "expo-image";
import { Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect } from "react";
import {
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const { startSSOFlow } = useSSO();

  async function handleOAuth(
    strategy: "oauth_google" | "oauth_facebook" | "oauth_apple"
  ) {
    try {
      const redirectUrl = AuthSession.makeRedirectUri({ scheme: "roogo" });
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl,
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (e) {
      console.error(e);
    }
  }
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
        {/* Socials Buttons (Google, Facebook, Apple) */}
        <View className="z-20 mt-8 items-center">
          <Text className="text-white/80 font-urbanist text-xl">
            Autres façons de se connecter
          </Text>
          <View className="flex-row items-center justify-center gap-5 mt-5">
            <TouchableOpacity
              accessibilityLabel="Continuer avec Google"
              className="h-[60px] w-[60px] bg-white rounded-full border border-white/40 items-center justify-center active:opacity-80"
              onPress={() => handleOAuth("oauth_google")}
            >
              <Image
                source={require("../assets/images/socials/google.png")}
                style={{ width: 24, height: 24 }}
                contentFit="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel="Continuer avec Facebook"
              className="h-[60px] w-[60px] bg-white rounded-full border border-white/40 items-center justify-center active:opacity-80"
              onPress={() => handleOAuth("oauth_facebook")}
            >
              <Image
                source={require("../assets/images/socials/fb.png")}
                style={{ width: 24, height: 24 }}
                contentFit="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel="Continuer avec Apple"
              className="h-[60px] w-[60px] rounded-full bg-white border border-white/40 items-center justify-center active:opacity-80"
              onPress={() => handleOAuth("oauth_apple")}
            >
              <Image
                source={require("../assets/images/socials/apple.png")}
                style={{ width: 24, height: 24 }}
                contentFit="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
        <View className="absolute inset-0 bg-black/40 z-10" />
      </View>
    </View>
  );
}
