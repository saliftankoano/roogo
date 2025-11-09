import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface AuthPromptModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
}

export default function AuthPromptModal({
  visible,
  onClose,
  title,
  description,
}: AuthPromptModalProps) {
  const handleSignUp = () => {
    onClose();
    router.push("/(auth)/sign-up");
  };

  const handleSignIn = () => {
    onClose();
    router.push("/(auth)/sign-in");
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View className="flex-1 justify-center bg-black/50 px-6">
        <View className="bg-white rounded-3xl p-6">
          {/* Logo */}
          <View className="items-center mb-6">
            <Image
              source={require("../../assets/images/logo_160.png")}
              style={{ width: 80, height: 80 }}
              contentFit="contain"
            />
          </View>

          {/* Title */}
          <Text className="text-figma-grey-900 text-xl font-bold text-center mb-2 leading-[1.2] font-urbanist">
            {title}
          </Text>

          {/* Description */}
          {description && (
            <Text className="text-figma-grey-600 text-sm text-center mb-6 font-urbanist">
              {description}
            </Text>
          )}

          {/* Buttons */}
          <View className="space-y-3">
            {/* Sign Up Button */}
            <TouchableOpacity
              className="bg-figma-primary h-[50px] rounded-2xl items-center justify-center"
              onPress={handleSignUp}
            >
              <Text className="text-white text-base font-bold font-urbanist">
                S&apos;inscrire
              </Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              className="bg-white border-2 border-figma-primary h-[50px] rounded-2xl items-center justify-center"
              onPress={handleSignIn}
            >
              <Text className="text-figma-primary text-base font-bold font-urbanist">
                Se connecter
              </Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity className="mt-2" onPress={onClose}>
              <Text className="text-figma-grey-500 text-sm text-center font-urbanist">
                Annuler
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
