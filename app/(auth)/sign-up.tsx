import { useAuth, useSignUp, useSSO, useUser } from "@clerk/clerk-expo";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as AuthSession from "expo-auth-session";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import UserTypeSelection from "../components/UserTypeSelection";

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startSSOFlow } = useSSO();
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sex, setSex] = useState("");
  const [showSexPicker, setShowSexPicker] = useState(false);
  const [userType, setUserType] = useState("");
  const [showUserTypePicker, setShowUserTypePicker] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  // Helper function to format date
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Sync user data to private metadata via backend
  const syncToPrivateMetadata = async (data: {
    userType?: string;
    sex?: string;
    dateOfBirth?: string;
  }) => {
    try {
      const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL;
      if (!apiBaseUrl) {
        return;
      }

      const token = await getToken();
      if (!token) {
        return;
      }

      const url = `${apiBaseUrl.replace(/\/$/, "")}/api/clerk/users/me/metadata`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          privateMetadata: data,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.warn("Failed to sync private metadata:", text);
      }
    } catch (error) {
      console.error("Error syncing private metadata:", error);
    }
  };

  // Handle date picker change
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  // Handle sex selection
  const selectSex = (selectedSex: string) => {
    setSex(selectedSex);
    setShowSexPicker(false);
  };

  // Handle user type selection
  const selectUserType = (selectedUserType: string) => {
    setUserType(selectedUserType);
    setShowUserTypePicker(false);
  };

  // Handle post-SSO user type selection
  const handlePostSSOUserTypeSelection = async (selectedUserType: string) => {
    try {
      if (user) {
        // Update user metadata with the selected user type
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            userType: selectedUserType,
          },
        });
      }

      // Mirror into private metadata via backend
      await syncToPrivateMetadata({ userType: selectedUserType });

      // Close the modal and proceed to main app
      setShowUserTypeSelection(false);
      router.replace("/");
    } catch (error) {
      console.error("Error updating user type:", error);
      // Re-throw to let the component handle the error
      throw error;
    }
  };

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      await signUp.create({
        emailAddress,
        password,
        firstName,
        lastName,
        unsafeMetadata: {
          userType,
        },
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
        // Mirror all user data into private metadata via backend
        await syncToPrivateMetadata({
          userType,
          sex,
          dateOfBirth: formatDate(dateOfBirth),
        });
        router.replace("/(tabs)/(home)");
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
        // Show user type selection after successful SSO
        setShowUserTypeSelection(true);
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        className="bg-white flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
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
              <View className="bg-figma-grey-50 h-[50px] rounded-2xl px-5 flex-row items-center">
                <View className="mr-3">
                  <MaterialIcons name="email" size={20} color="#9E9E9E" />
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
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      className="bg-white flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Navigation Header */}
        <View className="flex-row items-center justify-between px-6 mt-16">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View className="flex-1 px-6 pb-12">
          {/* Logo */}
          <View className="items-center mb-3">
            <Image
              source={require("../../assets/images/logo_160.png")}
              style={{ width: 160, height: 160 }}
              contentFit="contain"
            />
          </View>

          {/* Title */}
          <Text className="text-figma-grey-900 text-[24px] font-bold text-center mb-6 leading-[1.2] font-urbanist">
            Créer un nouveau compte
          </Text>

          {/* Form */}
          <View className="space-y-2 mb-4">
            {/* First Name Input */}
            <View className="bg-figma-grey-50 h-[50px] rounded-2xl px-5 flex-row items-center">
              <View className="mr-3">
                <MaterialIcons name="person" size={20} color="#9E9E9E" />
              </View>
              <TextInput
                className="flex-1 text-black text-md font-semibold tracking-[0.2px] font-urbanist"
                placeholder="Prénom"
                placeholderTextColor="#9E9E9E"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                autoCorrect={false}
                spellCheck={false}
              />
            </View>

            {/* Last Name Input */}
            <View className="bg-figma-grey-50 h-[60px] mt-[10px] rounded-2xl px-5 flex-row items-center">
              <View className="mr-3">
                <MaterialIcons
                  name="family-restroom"
                  size={20}
                  color="#9E9E9E"
                />
              </View>
              <TextInput
                className="flex-1 text-black text-md font-semibold tracking-[0.2px] font-urbanist"
                placeholder="Nom de famille"
                placeholderTextColor="#9E9E9E"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                autoCorrect={false}
                spellCheck={false}
              />
            </View>

            {/* User Type Input */}
            <TouchableOpacity
              className="bg-figma-grey-50 h-[50px] mt-[10px] rounded-2xl px-5 flex-row items-center"
              onPress={() => setShowUserTypePicker(!showUserTypePicker)}
            >
              <View className="mr-3">
                <MaterialIcons name="business" size={20} color="#9E9E9E" />
              </View>
              <Text className="flex-1 text-black text-md font-semibold tracking-[0.2px] font-urbanist">
                {userType || "Type d'utilisateur"}
              </Text>
              <MaterialIcons
                name={
                  showUserTypePicker
                    ? "keyboard-arrow-up"
                    : "keyboard-arrow-down"
                }
                size={20}
                color="#9E9E9E"
              />
            </TouchableOpacity>

            {/* Date and Sex Row */}
            <View className="flex-row gap-3 mt-[10px]">
              {/* Date of Birth Input */}
              <TouchableOpacity
                className="bg-figma-grey-50 h-[50px] flex-1 rounded-2xl px-4 flex-row items-center"
                onPress={() => setShowDatePicker(true)}
              >
                <View className="mr-2">
                  <MaterialIcons name="cake" size={18} color="#9E9E9E" />
                </View>
                <Text className="flex-1 text-black text-sm font-semibold tracking-[0.2px] font-urbanist">
                  {formatDate(dateOfBirth)}
                </Text>
                <MaterialIcons
                  name="calendar-today"
                  size={18}
                  color="#9E9E9E"
                />
              </TouchableOpacity>

              {/* Sex Input */}
              <TouchableOpacity
                className="bg-figma-grey-50 h-[50px] flex-1 rounded-2xl px-4 flex-row items-center"
                onPress={() => setShowSexPicker(!showSexPicker)}
              >
                <View className="mr-2">
                  <MaterialIcons
                    name="person-outline"
                    size={18}
                    color="#9E9E9E"
                  />
                </View>
                <Text className="flex-1 text-black text-sm font-semibold tracking-[0.2px] font-urbanist">
                  {sex || "Sexe"}
                </Text>
                <MaterialIcons
                  name={
                    showSexPicker ? "keyboard-arrow-up" : "keyboard-arrow-down"
                  }
                  size={18}
                  color="#9E9E9E"
                />
              </TouchableOpacity>
            </View>

            <Modal
              visible={showDatePicker}
              transparent={true}
              animationType="slide"
            >
              <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-3xl p-6">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-bold text-figma-grey-900 font-urbanist">
                      Sélectionner la date
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      className="p-2"
                    >
                      <MaterialIcons name="close" size={24} color="#9E9E9E" />
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={dateOfBirth}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                    style={{ alignSelf: "center" }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    className="bg-figma-primary h-[50px] rounded-2xl items-center justify-center mt-4"
                  >
                    <Text className="text-white text-base font-bold font-urbanist">
                      Confirmer
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal
              visible={showSexPicker}
              transparent={true}
              animationType="slide"
            >
              <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-3xl p-6">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-bold text-figma-grey-900 font-urbanist">
                      Sélectionner le sexe
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowSexPicker(false)}
                      className="p-2"
                    >
                      <MaterialIcons name="close" size={24} color="#9E9E9E" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    className="bg-figma-grey-50 h-[60px] rounded-2xl px-5 flex-row items-center mb-3"
                    onPress={() => selectSex("Masculin")}
                  >
                    <View className="mr-3">
                      <MaterialIcons name="male" size={24} color="#9E9E9E" />
                    </View>
                    <Text className="text-black text-lg font-semibold tracking-[0.2px] font-urbanist">
                      Masculin
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-figma-grey-50 h-[60px] rounded-2xl px-5 flex-row items-center"
                    onPress={() => selectSex("Féminin")}
                  >
                    <View className="mr-3">
                      <MaterialIcons name="female" size={24} color="#9E9E9E" />
                    </View>
                    <Text className="text-black text-lg font-semibold tracking-[0.2px] font-urbanist">
                      Féminin
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal
              visible={showUserTypePicker}
              transparent={true}
              animationType="slide"
            >
              <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-3xl p-6">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-bold text-figma-grey-900 font-urbanist">
                      Sélectionner le type d&apos;utilisateur
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowUserTypePicker(false)}
                      className="p-2"
                    >
                      <MaterialIcons name="close" size={24} color="#9E9E9E" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    className="bg-figma-grey-50 h-[60px] rounded-2xl px-5 flex-row items-center mb-3"
                    onPress={() => selectUserType("agent")}
                  >
                    <View className="mr-3">
                      <MaterialIcons
                        name="business"
                        size={24}
                        color="#9E9E9E"
                      />
                    </View>
                    <Text className="text-black text-lg font-semibold tracking-[0.2px] font-urbanist">
                      Agent immobilier
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-figma-grey-50 h-[60px] rounded-2xl px-5 flex-row items-center"
                    onPress={() => selectUserType("regular")}
                  >
                    <View className="mr-3">
                      <MaterialIcons name="home" size={24} color="#9E9E9E" />
                    </View>
                    <Text className="text-black text-lg font-semibold tracking-[0.2px] font-urbanist">
                      Acheteur/Locataire
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* Email Input */}
            <View className="bg-figma-grey-50 h-[50px] mt-[10px] rounded-2xl px-5 flex-row items-center">
              <View className="mr-3">
                <MaterialIcons name="email" size={20} color="#9E9E9E" />
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
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 50, animated: true });
                  }, 100);
                }}
              />
            </View>

            {/* Password Input */}
            <View className="bg-figma-grey-50 h-[60px] mt-[10px] rounded-2xl px-5 flex-row items-center">
              <View className="mr-3">
                <MaterialIcons name="lock" size={20} color="#9E9E9E" />
              </View>
              <TextInput
                className="flex-1 text-black text-md font-semibold tracking-[0.2px] font-urbanist"
                placeholder="Mot de passe"
                placeholderTextColor="#9E9E9E"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 200, animated: true });
                  }, 100);
                }}
              />
              <TouchableOpacity
                className="ml-3"
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <MaterialIcons
                    name="visibility-off"
                    size={20}
                    color="#9E9E9E"
                  />
                ) : (
                  <MaterialIcons name="visibility" size={20} color="#9E9E9E" />
                )}
              </TouchableOpacity>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={onSignUpPress}
              className="bg-figma-primary mt-[8px] h-[50px] rounded-full items-center justify-center"
            >
              <Text className="text-white text-base font-bold tracking-[0.2px] font-urbanist">
                S&apos;inscrire
              </Text>
            </TouchableOpacity>
          </View>

          {/* Social Login Section */}
          <View className="space-y-3">
            {/* Divider */}
            <View className="flex-row items-center">
              <View className="flex-1 h-px bg-figma-border" />
              <Text className="mx-4 text-figma-grey-600 text-lg font-semibold tracking-[0.2px] font-urbanist">
                ou continuer avec
              </Text>
              <View className="flex-1 h-px bg-figma-border" />
            </View>

            {/* Social Buttons */}
            <View className="flex-row justify-center gap-5 mt-[10px]">
              <TouchableOpacity
                className="bg-white border border-figma-border w-[87px] h-[50px] rounded-2xl items-center justify-center"
                onPress={() => handleOAuth("oauth_google")}
              >
                <Image
                  source={require("../../assets/images/socials/google.png")}
                  style={{ width: 24, height: 24 }}
                  contentFit="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-white border border-figma-border w-[88px] h-[50px] rounded-2xl items-center justify-center"
                onPress={() => handleOAuth("oauth_facebook")}
              >
                <Image
                  source={require("../../assets/images/socials/fb.png")}
                  style={{ width: 24, height: 24 }}
                  contentFit="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-white border border-figma-border w-[88px] h-[50px] rounded-2xl items-center justify-center"
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

        {/* Post-SSO User Type Selection Modal */}
        <UserTypeSelection
          visible={showUserTypeSelection}
          onSelectUserType={handlePostSSOUserTypeSelection}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
