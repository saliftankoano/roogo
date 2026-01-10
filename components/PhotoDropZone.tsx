import * as ImagePicker from "expo-image-picker";
import { CameraIcon, XIcon } from "phosphor-react-native";
import React from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { tokens } from "../theme/tokens";

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
          `Vous ne pouvez ajouter que ${maxPhotos} photos maximum`
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
          "Nous avons besoin d'accéder à votre galerie ou appareil photo pour ajouter des images."
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
          padding: 32,
          alignItems: "center",
          backgroundColor: tokens.colors.roogo.secondary[100],
        }}
      >
        <View
          style={{
            backgroundColor: "#FFFFFF",
            padding: 12,
            borderRadius: 50,
            marginBottom: 12,
          }}
        >
          <CameraIcon size={32} color={tokens.colors.roogo.primary[500]} />
        </View>
        <Text
          style={{
            color: tokens.colors.roogo.primary[500],
            fontWeight: "700",
            fontSize: 15,
            fontFamily: "Urbanist-Bold",
          }}
        >
          Ajouter des photos
        </Text>
        <Text
          style={{
            color: tokens.colors.roogo.neutral[500],
            fontSize: 13,
            marginTop: 4,
            fontFamily: "Urbanist-Medium",
          }}
        >
          {photos.length}/{maxPhotos} photos • Min. {minPhotos}
        </Text>
      </TouchableOpacity>

      {error && (
        <Text
          style={{
            fontSize: 12,
            color: tokens.colors.roogo.error,
            marginTop: 6,
            fontWeight: "500",
            fontFamily: "Urbanist-Medium",
          }}
        >
          {error}
        </Text>
      )}

      {/* Photo grid preview */}
      {photos.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: tokens.colors.roogo.neutral[700],
              marginBottom: 10,
              fontFamily: "Urbanist-SemiBold",
            }}
          >
            Photos ajoutées ({photos.length})
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {photos.map((photo, index) => (
              <View key={index} style={{ position: "relative" }}>
                <Image
                  source={{ uri: photo.uri }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 12,
                  }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => handleRemovePhoto(index)}
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    backgroundColor: tokens.colors.roogo.error,
                    borderRadius: 12,
                    width: 24,
                    height: 24,
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 4,
                    borderWidth: 2,
                    borderColor: "#FFFFFF",
                  }}
                >
                  <XIcon size={12} color="white" weight="bold" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};
