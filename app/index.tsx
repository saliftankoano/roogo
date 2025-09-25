import React from "react";
import { Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function SplashScreen() {
  return (
    <SafeAreaView className="flex-1 w-full h-full items-center justify-center">
      <View className="w-full h-full items-center justify-center">
        <Image
          source={require("../assets/images/icon.png")}
          className="object-cover w-[90%] h-[90%]"
        />
      </View>
    </SafeAreaView>
  );
}
