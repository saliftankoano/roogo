import * as ImagePicker from "expo-image-picker";
import { Camera, X } from "lucide-react-native";
import React from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

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
        style={{
          borderWidth: 2,
          borderStyle: "dashed",
          borderColor: error ? "#EF4444" : "#F59E0B",
          borderRadius: 12,
          padding: 24,
          alignItems: "center",
          backgroundColor: "#FFFBF0",
        }}
      >
        <Camera size={32} color="#F59E0B" />
        <Text
          style={{
            color: "#F59E0B",
            fontWeight: "600",
            marginTop: 8,
            fontSize: 14,
          }}
        >
          Ajouter des photos
        </Text>
        <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 4 }}>
          {photos.length}/{maxPhotos} photos • Min. {minPhotos}
        </Text>
      </TouchableOpacity>

      {error && (
        <Text
          style={{
            fontSize: 12,
            color: "#EF4444",
            marginTop: 6,
            fontWeight: "500",
          }}
        >
          {error}
        </Text>
      )}

      {/* Photo grid preview */}
      {photos.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: "#6B7280",
              marginBottom: 8,
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
                    borderRadius: 8,
                  }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => handleRemovePhoto(index)}
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    backgroundColor: "#EF4444",
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
                  }}
                >
                  <X size={14} color="white" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};
