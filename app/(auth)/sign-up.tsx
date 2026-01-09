import { useSSO, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect } from "react";
import {
  Platform,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { startSSOFlow } = useSSO();
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();

  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingProvider, setLoadingProvider] = React.useState<string | null>(
    null
  );

  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  // After SSO completes and user is available, redirect to root
  // The root screen (index.tsx) will handle showing the user type selection
  useEffect(() => {
    if (isUserLoaded && user && !isLoading) {
      router.replace("/");
    }
  }, [isUserLoaded, user, isLoading, router]);

  async function handleOAuth(
    strategy: "oauth_google" | "oauth_facebook" | "oauth_apple"
  ) {
    try {
      setIsLoading(true);
      setLoadingProvider(strategy);

      const redirectUrl = AuthSession.makeRedirectUri({ scheme: "roogo" });
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl,
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        // The useEffect above will handle the redirect after user is loaded
      }
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      setLoadingProvider(null);
    }
  }

  return (
    <View className="bg-white flex-1">
      {/* Navigation Header */}
      <View className="flex-row items-center justify-between px-6 mt-16">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-6 items-center justify-start pt-10">
        {/* Logo */}
        <View className="items-center mb-6">
          <Image
            source={require("../../assets/images/logo_160.png")}
            style={{ width: 140, height: 140 }}
            contentFit="contain"
          />
        </View>

        {/* Title */}
        <Text className="text-figma-grey-900 text-[28px] font-bold text-center mb-3 leading-[1.2] font-urbanist">
          Créer un compte
        </Text>

        <Text className="text-figma-grey-500 text-base text-center mb-10 font-urbanist px-4">
          Inscrivez-vous rapidement avec votre compte social préféré
        </Text>

        {/* Social Login Buttons */}
        <View className="w-full space-y-4">
          <TouchableOpacity
            className="bg-white border-2 border-figma-grey-100 h-[56px] rounded-2xl flex-row items-center relative"
            onPress={() => handleOAuth("oauth_google")}
            disabled={isLoading}
          >
            {loadingProvider === "oauth_google" ? (
              <View className="w-full items-center justify-center">
                <ActivityIndicator size="small" color="#D17C4F" />
              </View>
            ) : (
              <>
                <View className="absolute left-6 h-full justify-center">
                  <Image
                    source={require("../../assets/images/socials/google.png")}
                    style={{ width: 24, height: 24 }}
                    contentFit="contain"
                  />
                </View>
                <View className="flex-1 items-center justify-center">
                  <Text
                    className="ml-0 text-figma-grey-900 text-base font-semibold font-urbanist"
                    style={{
                      includeFontPadding: false,
                      textAlignVertical: "center",
                    }}
                  >
                    Continuer avec Google
                  </Text>
                </View>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-[#1877F2] h-[56px] rounded-2xl flex-row items-center relative mt-3"
            onPress={() => handleOAuth("oauth_facebook")}
            disabled={isLoading}
          >
            {loadingProvider === "oauth_facebook" ? (
              <View className="w-full items-center justify-center">
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            ) : (
              <>
                <View className="absolute left-6 h-full justify-center">
                  <Image
                    source={require("../../assets/images/socials/fb.png")}
                    style={{ width: 24, height: 24 }}
                    contentFit="contain"
                  />
                </View>
                <View className="flex-1 items-center justify-center">
                  <Text
                    className="ml-0 text-white text-base font-semibold font-urbanist"
                    style={{
                      includeFontPadding: false,
                      textAlignVertical: "center",
                    }}
                  >
                    Continuer avec Facebook
                  </Text>
                </View>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-black h-[56px] rounded-2xl flex-row items-center relative mt-3"
            onPress={() => handleOAuth("oauth_apple")}
            disabled={isLoading}
          >
            {loadingProvider === "oauth_apple" ? (
              <View className="w-full items-center justify-center">
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            ) : (
              <>
                <View className="absolute left-6 h-full justify-center">
                  <Image
                    source={require("../../assets/images/socials/apple.png")}
                    style={{ width: 24, height: 24 }}
                    contentFit="contain"
                    tintColor="#FFFFFF"
                  />
                </View>
                <View className="flex-1 items-center justify-center">
                  <Text
                    className="ml-0 text-white text-base font-semibold font-urbanist"
                    style={{
                      includeFontPadding: false,
                      textAlignVertical: "center",
                    }}
                  >
                    Continuer avec Apple
                  </Text>
                </View>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text className="text-figma-grey-400 text-xs text-center mt-8 px-6 font-urbanist leading-5">
          En continuant, vous acceptez nos{" "}
          <Text className="text-figma-primary font-semibold">
            Conditions d&apos;utilisation
          </Text>{" "}
          et notre{" "}
          <Text className="text-figma-primary font-semibold">
            Politique de confidentialité
          </Text>
        </Text>

        {/* Sign In Link */}
        <View className="flex-row justify-center items-center mt-12">
          <Text className="text-figma-grey-500 text-base font-normal font-urbanist">
            Vous avez déjà un compte ?{" "}
          </Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity>
              <Text className="text-figma-primary text-base font-bold font-urbanist">
                Se connecter
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}
