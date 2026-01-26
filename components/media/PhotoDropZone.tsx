import * as ImagePicker from "expo-image-picker";
import { CameraIcon, XIcon } from "phosphor-react-native";
import React from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { tokens } from "@/theme/tokens";

interface Photo {
  uri: string;
  width: number;
  height: number;
}

interface PhotoDropZoneProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
  minPhotos?: number;
  maxPhotos?: number;
  error?: string;
}

export const PhotoDropZone: React.FC<PhotoDropZoneProps> = ({
  photos,
  onPhotosChange,
  minPhotos = 3,
  maxPhotos = 15,
  error,
}) => {
  const handleAddPhoto = async () => {
    try {
      // Check if we've reached the limit
      if (photos.length >= maxPhotos) {
        Alert.alert(
          "Limite atteinte",
          `Vous ne pouvez ajouter que ${maxPhotos} photos maximum`,
        );
        return;
      }

      // Request permissions
      const { status: mediaStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();

      if (mediaStatus !== "granted" && cameraStatus !== "granted") {
        Alert.alert(
          "Permissions requises",
          "Nous avons besoin d'accéder à votre galerie ou appareil photo pour ajouter des images.",
        );
        return;
      }

      // Show action sheet
      Alert.alert("Ajouter une photo", "Choisissez la source de la photo", [
        {
          text: "Appareil photo",
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [16, 9],
              quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
              const newPhoto = {
                uri: result.assets[0].uri,
                width: result.assets[0].width,
                height: result.assets[0].height,
              };
              onPhotosChange([...photos, newPhoto]);
            }
          },
        },
        {
          text: "Galerie",
          onPress: async () => {
            const remainingSlots = maxPhotos - photos.length;
            const result = await ImagePicker.launchImageLibraryAsync({
              quality: 0.8,
              allowsMultipleSelection: true,
              selectionLimit: Math.min(remainingSlots, 5),
            });

            if (!result.canceled && result.assets.length > 0) {
              const newPhotos = result.assets.map((asset) => ({
                uri: asset.uri,
                width: asset.width,
                height: asset.height,
              }));
              onPhotosChange([...photos, ...newPhotos]);
            }
          },
        },
        {
          text: "Annuler",
          style: "cancel",
        },
      ]);
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'ajouter la photo");
      console.error(error);
    }
  };

  const handleRemovePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  return (
    <View>
      {/* Drop zone button */}
      <TouchableOpacity
        onPress={handleAddPhoto}
        activeOpacity={0.8}
        style={{
          borderWidth: 2,
          borderStyle: "dashed",
          borderColor: error
            ? tokens.colors.roogo.error
            : tokens.colors.roogo.primary[500],
          borderRadius: 16,
          padding: 24,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: error
            ? "rgba(239, 68, 68, 0.05)"
            : "rgba(59, 130, 246, 0.05)",
          marginBottom: 16,
        }}
      >
        <CameraIcon
          size={32}
          color={
            error ? tokens.colors.roogo.error : tokens.colors.roogo.primary[500]
          }
          weight="fill"
        />
        <Text
          style={{
            marginTop: 12,
            fontSize: 16,
            fontFamily: "Urbanist-Bold",
            color: tokens.colors.roogo.neutral[900],
          }}
        >
          Ajouter des photos
        </Text>
        <Text
          style={{
            marginTop: 4,
            fontSize: 13,
            fontFamily: "Urbanist-Medium",
            color: tokens.colors.roogo.neutral[500],
            textAlign: "center",
          }}
        >
          Minimum {minPhotos} photos • Maximum {maxPhotos} photos
        </Text>
      </TouchableOpacity>

      {/* Error message */}
      {error && (
        <Text className="text-xs text-roogo-error mb-3 font-urbanist font-medium ml-1">
          {error}
        </Text>
      )}

      {/* Photos preview grid */}
      {photos.length > 0 && (
        <View className="flex-row flex-wrap gap-3">
          {photos.map((photo, index) => (
            <View key={index} style={{ position: "relative" }}>
              <Image
                source={{ uri: photo.uri }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 12,
                }}
              />
              <TouchableOpacity
                onPress={() => handleRemovePhoto(index)}
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: tokens.colors.roogo.error,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <XIcon size={12} color="white" weight="bold" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

