import { useSignUp, useSSO } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

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

  if (pendingVerification) {
    return (
      <View className="bg-white flex-1">
        {/* Navigation Header */}
        <View className="flex-row items-center justify-between px-6 mt-16">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View className="flex-1 px-6 pb-12">
          {/* Logo */}
          <View className="items-center mb-8">
            <Image
              source={require("../../assets/images/logo_160.png")}
              style={{ width: 160, height: 160 }}
              contentFit="contain"
            />
          </View>

          {/* Title */}
          <Text className="text-figma-grey-900 text-[24px] font-bold text-center mb-8 leading-[1.2] font-urbanist">
            Vérifiez votre e-mail
          </Text>

          {/* Verification Code Input */}
          <View className="space-y-5 mb-8">
            <View className="bg-figma-grey-50 h-[60px] rounded-2xl px-5 flex-row items-center">
              <View className="mr-3">
                <Image
                  source={require("../../assets/images/email.png")}
                  style={{ width: 20, height: 20 }}
                  contentFit="contain"
                />
              </View>
              <TextInput
                className="flex-1 text-black text-md font-semibold tracking-[0.2px] font-urbanist"
                placeholder="Code de vérification"
                placeholderTextColor="#9E9E9E"
                value={code}
                onChangeText={setCode}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                keyboardType="number-pad"
              />
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              onPress={onVerifyPress}
              className="bg-figma-primary mt-[20px] h-[58px] rounded-full items-center justify-center"
            >
              <Text className="text-white text-base font-bold tracking-[0.2px] font-urbanist">
                Vérifier
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
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
      <View className="flex-1 px-6 pb-12">
        {/* Logo */}
        <View className="items-center mb-8">
          <Image
            source={require("../../assets/images/logo_160.png")}
            style={{ width: 160, height: 160 }}
            contentFit="contain"
          />
        </View>

        {/* Title */}
        <Text className="text-figma-grey-900 text-[24px] font-bold text-center mb-8 leading-[1.2] font-urbanist">
          Créer un nouveau compte
        </Text>

        {/* Form */}
        <View className="space-y-5 mb-8">
          {/* Email Input */}
          <View className="bg-figma-grey-50 h-[60px] rounded-2xl px-5 flex-row items-center">
            <View className="mr-3">
              <Image
                source={require("../../assets/images/email.png")}
                style={{ width: 20, height: 20 }}
                contentFit="contain"
              />
            </View>
            <TextInput
              className="flex-1 text-black text-md font-semibold tracking-[0.2px] font-urbanist"
              placeholder="E-mail"
              placeholderTextColor="#9E9E9E"
              value={emailAddress}
              onChangeText={setEmailAddress}
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              keyboardType="email-address"
            />
          </View>

          {/* Password Input */}
          <View className="bg-figma-grey-50 h-[60px] mt-[20px] rounded-2xl px-5 flex-row items-center">
            <View className="mr-3">
              <Image
                source={require("../../assets/images/Lock.png")}
                style={{ width: 20, height: 20 }}
                contentFit="contain"
              />
            </View>
            <TextInput
              className="flex-1 text-black text-md font-semibold tracking-[0.2px] font-urbanist"
              placeholder="Mot de passe"
              placeholderTextColor="#9E9E9E"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity className="ml-3">
              <Image
                source={require("../../assets/images/eye.png")}
                style={{ width: 20, height: 20 }}
                contentFit="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={onSignUpPress}
            className="bg-figma-primary mt-[20px] h-[58px] rounded-full items-center justify-center"
          >
            <Text className="text-white text-base font-bold tracking-[0.2px] font-urbanist">
              S&apos;inscrire
            </Text>
          </TouchableOpacity>
        </View>

        {/* Social Login Section */}
        <View className="space-y-5">
          {/* Divider */}
          <View className="flex-row items-center">
            <View className="flex-1 h-px bg-figma-border" />
            <Text className="mx-4 text-figma-grey-600 text-lg font-semibold tracking-[0.2px] font-urbanist">
              ou continuer avec
            </Text>
            <View className="flex-1 h-px bg-figma-border" />
          </View>

          {/* Social Buttons */}
          <View className="flex-row justify-center gap-5 mt-[20px]">
            <TouchableOpacity
              className="bg-white border border-figma-border w-[87px] h-[60px] rounded-2xl items-center justify-center"
              onPress={() => handleOAuth("oauth_google")}
            >
              <Image
                source={require("../../assets/images/socials/google.png")}
                style={{ width: 24, height: 24 }}
                contentFit="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white border border-figma-border w-[88px] h-[60px] rounded-2xl items-center justify-center"
              onPress={() => handleOAuth("oauth_facebook")}
            >
              <Image
                source={require("../../assets/images/socials/fb.png")}
                style={{ width: 24, height: 24 }}
                contentFit="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white border border-figma-border w-[88px] h-[60px] rounded-2xl items-center justify-center"
              onPress={() => handleOAuth("oauth_apple")}
            >
              <Image
                source={require("../../assets/images/socials/apple.png")}
                style={{ width: 24, height: 24 }}
                contentFit="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign In Link */}
        <View className="flex-row justify-center items-center mt-8">
          <Text className="text-figma-grey-500 text-sm font-normal tracking-[0.2px] font-urbanist">
            Vous avez déjà un compte ?{" "}
          </Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity>
              <Text className="text-figma-primary text-sm font-semibold tracking-[0.2px] font-urbanist">
                Se connecter
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}
