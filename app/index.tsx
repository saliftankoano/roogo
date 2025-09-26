import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
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
        <View className="title-containe z-20 mt-[-10px]">
          <Text className=" text-white text-5xl font-semibold text-left pl-6 leading-tightest font-urbanist">
            Trouvez le
          </Text>
          <Text className=" text-white text-5xl font-semibold text-left pl-6 mb-6 leading-tightest font-urbanist">
            logement parfait
          </Text>
        </View>
        <View className="login-signup-container w-screen z-20 flex-row gap-4 px-4 items-center justify-center">
          <TouchableOpacity className="login-container w-[20%] bg-[#55A6E5] rounded-full px-5 py-4 flex-1 justify-center items-center shadow-lg shadow-black/30 active:opacity-80">
            <Text className=" text-white text-2xl text-left leading-tight font-urbanist">
              Se connecter
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="signup-container w-[20%] bg-transparent border-2 border-white/80 rounded-full px-5 py-4 flex-1 justify-center items-center shadow-lg shadow-black/20 active:opacity-80">
            <Text className=" text-white text-2xl text-left leading-tight font-urbanist">
              S&apos;inscrire
            </Text>
          </TouchableOpacity>
        </View>
        <View className="z-20 mt-8 items-center">
          <Text className="text-white/80 font-urbanist">
            Autres façons de se connecter
          </Text>
          <View className="flex-row items-center justify-center gap-5 mt-3">
            <TouchableOpacity
              accessibilityLabel="Continuer avec Google"
              className="h-14 w-14 rounded-full border border-white/40 items-center justify-center active:opacity-80"
            >
              <AntDesign name="google" size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel="Continuer avec Facebook"
              className="h-14 w-14 rounded-full border border-white/40 items-center justify-center active:opacity-80"
            >
              <FontAwesome name="facebook" size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel="Continuer avec Apple"
              className="h-14 w-14 rounded-full border border-white/40 items-center justify-center active:opacity-80"
            >
              <AntDesign name="apple" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
        <View className="absolute inset-0 bg-black/40 z-10" />
      </View>
    </View>
  );
}
