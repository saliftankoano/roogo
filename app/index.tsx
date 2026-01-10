import { useAuth, useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState, useRef } from "react";
import {
  Platform,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserType } from "../hooks/useUserType";
import { Button } from "../components/ui/Button";
import { MaterialIcons } from "@expo/vector-icons";
import { updateClerkMetadata } from "../services/userService";

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get("window");

export default function OnboardingScreen() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { userType, isLoaded: isTypeLoaded } = useUserType();
  const { user } = useUser();

  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  // Auth Status Check Logic
  useEffect(() => {
    if (isLoaded && isTypeLoaded) {
      if (isSignedIn) {
        if (userType) {
          // User is fully signed in and has a type -> Go Home
          console.log("Redirecting to tabs...");
          router.replace("/(tabs)/(home)");
        } else {
          // User is signed in but has NO type (new signup) -> Show Selection (Step 2)
          if (step !== 2 && step !== 3) {
            setStep(2);
          }
        }
      } else {
        // Not signed in -> Stay on Step 1 (Welcome)
        if (step !== 1) {
          setStep(1);
        }
      }
    }
  }, [isLoaded, isTypeLoaded, isSignedIn, userType, step]);

  const transitionTo = (nextStep: number) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setStep(nextStep);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleSelectUserType = async (type: string) => {
    if (type === "agent") {
      transitionTo(3); // Go to agent info step
    } else {
      // For non-agents, complete onboarding immediately
      await completeOnboarding(type);
    }
  };

  const completeOnboarding = async (
    type: string,
    agentData?: { companyName?: string; facebookUrl?: string }
  ) => {
    if (!user) return;

    try {
      setIsSubmitting(true);

      const token = await getToken();
      if (!token) {
        throw new Error("No auth token available");
      }

      // Securely update metadata via backend API
      const metadata: any = { userType: type };
      if (type === "agent" && agentData) {
        if (agentData.companyName) metadata.companyName = agentData.companyName;
        if (agentData.facebookUrl) metadata.facebookUrl = agentData.facebookUrl;
      }

      const success = await updateClerkMetadata(token, metadata);
      
      if (success) {
        // Reload user to get updated publicMetadata
        await user.reload();
        router.replace("/(tabs)/(home)");
      } else {
        throw new Error("Failed to update metadata via API");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setIsSubmitting(false);
    }
  };

  const handleAgentSubmit = async () => {
    await completeOnboarding("agent", { companyName, facebookUrl });
  };

  // Show loading while checking authentication status
  if (!isLoaded || !isTypeLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-600 font-urbanist">
          Chargement...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {step === 1 ? (
          <View className="flex-1 bg-[#80B3E6]">
            {/* Immersive Background Image */}
            <Image
              source={require("../assets/images/homes/white_villa.jpg")}
              style={{
                width: width,
                height: height * 0.7,
                position: "absolute",
                top: 0,
              }}
              resizeMode="cover"
            />

            {/* Bottom Sheet Content */}
            <View className="absolute bottom-0 w-full bg-white rounded-t-[32px] px-8 pt-12 pb-24 shadow-2xl">
              <Text className="text-[32px] font-black text-center mb-4 text-figma-grey-900 leading-[1.1] font-urbanist">
                Trouvez votre maison idéale avec Roogo! 🏠
              </Text>
              <Text className="text-figma-grey-500 text-center mb-8 font-medium leading-relaxed font-urbanist text-base">
                L&apos;expérience immobilière la plus immersive et sécurisée au
                Burkina Faso. 🌍
              </Text>

              <View className="w-full space-y-4">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-[50%] mx-auto bg-figma-primary h-[64px] rounded-2xl shadow-xl shadow-figma-primary/20"
                  onPress={() => router.push("/(auth)/sign-up")}
                >
                  C&apos;est parti !
                </Button>

                <TouchableOpacity
                  onPress={() => router.push("/(auth)/sign-in")}
                  className="items-center py-4"
                >
                  <Text className="text-figma-grey-500 font-medium font-urbanist">
                    Déjà un compte ?{" "}
                    <Text className="text-figma-primary font-bold">
                      Se connecter
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : step === 2 ? (
          <SafeAreaView className="flex-1 px-8 pt-20">
            {/* Step 2: User Type Selection */}
            <View className="mb-12">
              <Text className="text-3xl font-black text-figma-grey-900 font-urbanist mb-3">
                Choisissez votre profil
              </Text>
              <Text className="text-figma-grey-500 font-medium font-urbanist text-lg">
                Comment souhaitez-vous utiliser Roogo ?
              </Text>
            </View>

            <View className="space-y-10">
              <TouchableOpacity
                onPress={() => handleSelectUserType("renter")}
                activeOpacity={0.7}
                className="bg-figma-grey-50 p-6 rounded-[32px] border-2 border-transparent active:border-figma-primary/30 flex-row items-center"
              >
                <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center shadow-sm mr-5">
                  <MaterialIcons name="search" size={32} color="#FF6B35" />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-figma-grey-900 font-urbanist">
                    Locataire
                  </Text>
                  <Text className="text-figma-grey-500 font-medium font-urbanist">
                    Je cherche un logement
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#D1D1D1" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSelectUserType("owner")}
                activeOpacity={0.7}
                className="bg-figma-grey-50 mt-4 p-6 rounded-[32px] border-2 border-transparent active:border-figma-primary/30 flex-row items-center"
              >
                <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center shadow-sm mr-5">
                  <MaterialIcons name="home-work" size={32} color="#FF6B35" />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-figma-grey-900 font-urbanist">
                    Propriétaire
                  </Text>
                  <Text className="text-figma-grey-500 font-medium font-urbanist">
                    Je veux louer mon bien
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#D1D1D1" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSelectUserType("agent")}
                activeOpacity={0.7}
                className="bg-figma-grey-50 mt-4 p-6 rounded-[32px] border-2 border-transparent active:border-figma-primary/30 flex-row items-center"
              >
                <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center shadow-sm mr-5">
                  <MaterialIcons
                    name="business-center"
                    size={32}
                    color="#FF6B35"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-figma-grey-900 font-urbanist">
                    Agent Immobilier
                  </Text>
                  <Text className="text-figma-grey-500 font-medium font-urbanist">
                    Je suis un professionnel
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#D1D1D1" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        ) : (
          <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              className="flex-1"
            >
              <ScrollView
                className="flex-1"
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                  paddingHorizontal: 24,
                  paddingBottom: 40,
                }}
              >
                {/* Step 3: Agent Info */}
                <View className="mt-6 mb-10">
                  <TouchableOpacity
                    onPress={() => transitionTo(2)}
                    className="mb-6 w-12 h-12 bg-figma-grey-50 rounded-2xl items-center justify-center"
                  >
                    <MaterialIcons
                      name="arrow-back"
                      size={24}
                      color="#1A1A1A"
                    />
                  </TouchableOpacity>
                  <Text className="text-3xl font-black text-figma-grey-900 font-urbanist mb-2">
                    Informations professionnelles
                  </Text>
                  <Text className="text-figma-grey-500 font-medium font-urbanist text-lg">
                    Aidez-nous à mieux vous connaître
                  </Text>
                </View>

                <View className="space-y-5">
                  {/* Company Name */}
                  <View>
                    <Text className="text-figma-grey-700 font-semibold font-urbanist mb-2 ml-1">
                      Nom de l&apos;entreprise{" "}
                      <Text className="text-red-500">*</Text>
                    </Text>
                    <View className="bg-figma-grey-50 h-[56px] rounded-2xl px-5 flex-row items-center">
                      <MaterialIcons
                        name="business"
                        size={22}
                        color="#9E9E9E"
                      />
                      <TextInput
                        className="flex-1 ml-3 text-figma-grey-900 text-base font-semibold font-urbanist"
                        placeholder="Ex: Immobilière Ouaga"
                        placeholderTextColor="#9E9E9E"
                        value={companyName}
                        onChangeText={setCompanyName}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>

                  {/* Facebook URL */}
                  <View>
                    <Text className="text-figma-grey-700 font-semibold font-urbanist mb-2 ml-1">
                      Page Facebook (optionnel)
                    </Text>
                    <View className="bg-figma-grey-50 h-[56px] rounded-2xl px-5 flex-row items-center">
                      <MaterialIcons
                        name="facebook"
                        size={22}
                        color="#1877F2"
                      />
                      <TextInput
                        className="flex-1 ml-3 text-figma-grey-900 text-base font-semibold font-urbanist"
                        placeholder="https://facebook.com/votre-page"
                        placeholderTextColor="#9E9E9E"
                        value={facebookUrl}
                        onChangeText={setFacebookUrl}
                        autoCapitalize="none"
                        keyboardType="url"
                      />
                    </View>
                  </View>
                </View>

                <View className="mt-10">
                  <Button
                    variant="primary"
                    size="lg"
                    className={`w-full bg-figma-primary h-[56px] rounded-2xl ${
                      !companyName ? "opacity-50" : ""
                    }`}
                    onPress={handleAgentSubmit}
                    disabled={isSubmitting || !companyName}
                  >
                    {isSubmitting
                      ? "Création du compte..."
                      : "Terminer l'inscription"}
                  </Button>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        )}
      </Animated.View>
    </View>
  );
}
