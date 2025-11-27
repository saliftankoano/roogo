import { useSignIn, useSSO, useUser } from "@clerk/clerk-expo";
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
import UserTypeSelection from "../components/UserTypeSelection";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const { user } = useUser();
  const router = useRouter();
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  // Watch for user object availability after sign-in
  useEffect(() => {
    if (user && isLoaded) {
      // If user doesn't have a userType, show selection modal
      if (!user.unsafeMetadata?.userType) {
        setShowUserTypeSelection(true);
      } else {
        // User has a type, redirect to home
        router.replace("/(tabs)/(home)");
      }
    }
  }, [user, isLoaded, router]);

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        console.log("Sign in successful");
        // Navigation will be handled by useEffect when user object updates
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const handlePostSignInUserTypeSelection = async (
    selectedUserType: string
  ) => {
    try {
      if (user) {
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            userType: selectedUserType,
          },
        });
        // Reload user to get updated metadata
        await user.reload();
      }
      setShowUserTypeSelection(false);
      router.replace("/(tabs)/(home)");
    } catch (error) {
      console.error("Error updating user type:", error);
      throw error;
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
        console.log("OAuth sign in successful");
        // Navigation will be handled by useEffect when user object updates
      }
    } catch (e) {
      console.error(e);
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
          Connectez vous à votre compte
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

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={onSignInPress}
            className="bg-figma-primary mt-[20px] h-[58px] rounded-full items-center justify-center"
          >
            <Text className="text-white text-base font-bold tracking-[0.2px] font-urbanist">
              Se connecter
            </Text>
          </TouchableOpacity>

          {/* Forgot Password */}
          <TouchableOpacity className="mt-[20px]">
            <Text className="text-figma-primary text-base font-semibold text-center tracking-[0.2px] font-urbanist">
              Mot de passe oublié ?
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

        {/* Sign Up Link */}
        <View className="flex-row justify-center items-center mt-8">
          <Text className="text-figma-grey-500 text-sm font-normal tracking-[0.2px] font-urbanist">
            Vous n&apos;avez pas de compte ?{" "}
          </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text className="text-figma-primary text-sm font-semibold tracking-[0.2px] font-urbanist">
                S&apos;inscrire
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      {/* User Type Selection Modal */}
      <UserTypeSelection
        visible={showUserTypeSelection}
        onSelectUserType={handlePostSignInUserTypeSelection}
      />
    </View>
  );
}
