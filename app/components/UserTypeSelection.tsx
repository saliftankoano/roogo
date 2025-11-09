import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface UserTypeSelectionProps {
  visible: boolean;
  onSelectUserType: (userType: string) => void;
}

export default function UserTypeSelection({
  visible,
  onSelectUserType,
}: UserTypeSelectionProps) {
  const [selectedUserType, setSelectedUserType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View className="flex-1 justify-center bg-black/50 px-6">
        <View className="bg-white rounded-3xl p-6">
          {/* Header */}
          <View className="items-center mb-6">
            <Image
              source={require("../../assets/images/logo_160.png")}
              style={{ width: 80, height: 80 }}
              contentFit="contain"
            />
            <Text className="text-figma-grey-900 text-xl font-bold text-center mt-4 leading-[1.2] font-urbanist">
              Choisissez votre profil
            </Text>
            <Text className="text-figma-grey-600 text-sm text-center mt-2 font-urbanist">
              Comment souhaitez-vous utiliser Roogo ?
            </Text>
          </View>

          {/* User Type Options */}
          <View className="space-y-6">
            {/* Owner Option */}
            <TouchableOpacity
              className={`border-2 rounded-2xl p-5 mb-4 ${
                selectedUserType === "owner"
                  ? "border-figma-primary bg-figma-primary/10"
                  : "border-figma-border bg-white"
              }`}
              onPress={() => setSelectedUserType("owner")}
            >
              <View className="flex-row items-center">
                <View className="mr-4">
                  <MaterialIcons
                    name="home-work"
                    size={32}
                    color={selectedUserType === "owner" ? "#FF6B35" : "#9E9E9E"}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-figma-grey-900 font-urbanist">
                    Propriétaire
                  </Text>
                  <Text className="text-sm text-figma-grey-600 font-urbanist mt-1">
                    Je veux louer mon bien
                  </Text>
                </View>
                {selectedUserType === "owner" && (
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color="#FF6B35"
                  />
                )}
              </View>
            </TouchableOpacity>

            {/* Renter Option */}
            <TouchableOpacity
              className={`border-2 rounded-2xl p-5 ${
                selectedUserType === "renter"
                  ? "border-figma-primary bg-figma-primary/10"
                  : "border-figma-border bg-white"
              }`}
              onPress={() => setSelectedUserType("renter")}
            >
              <View className="flex-row items-center">
                <View className="mr-4">
                  <MaterialIcons
                    name="search"
                    size={32}
                    color={
                      selectedUserType === "renter" ? "#FF6B35" : "#9E9E9E"
                    }
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-figma-grey-900 font-urbanist">
                    Locataire
                  </Text>
                  <Text className="text-sm text-figma-grey-600 font-urbanist mt-1">
                    Je cherche un logement
                  </Text>
                </View>
                {selectedUserType === "renter" && (
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color="#FF6B35"
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            className={`mt-6 h-[50px] rounded-2xl items-center justify-center ${
              selectedUserType && !isLoading
                ? "bg-figma-primary"
                : "bg-figma-grey-300"
            }`}
            disabled={!selectedUserType || isLoading}
            onPress={async () => {
              if (selectedUserType && !isLoading) {
                setIsLoading(true);
                try {
                  await onSelectUserType(selectedUserType);
                } catch (error) {
                  console.error("Error selecting user type:", error);
                } finally {
                  setIsLoading(false);
                }
              }
            }}
          >
            <Text
              className={`text-base font-bold font-urbanist ${
                selectedUserType && !isLoading
                  ? "text-white"
                  : "text-figma-grey-500"
              }`}
            >
              {isLoading ? "Chargement..." : "Continuer"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
