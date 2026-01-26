import { EnvelopeIcon, PhoneIcon, XIcon } from "phosphor-react-native";
import React from "react";
import {
  Alert,
  Linking,
  Modal,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tokens } from "@/theme/tokens";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";

interface SupportSheetProps {
  visible: boolean;
  onClose: () => void;
}

const SupportSheet: React.FC<SupportSheetProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const bottomInset = Math.max(insets.bottom, 16);
  const sheetHeight = Math.max(380, Math.min(windowHeight * 0.45, 450));

  const handlePhoneCall = (number: string) => {
    const url = `tel:${number.replace(/\s/g, "")}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Erreur", "Impossible de passer l'appel.");
    });
  };

  const handleWhatsApp = (number: string) => {
    const phoneNumber = number.replace(/\s/g, "").replace(/\+/g, "");
    const message = "Bonjour Roogo, j'ai besoin d'assistance.";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Erreur", "Impossible d'ouvrir WhatsApp.");
    });
  };

  const handleEmail = () => {
    const url = "mailto:support@roogobf.com";
    Linking.openURL(url).catch(() => {
      Alert.alert("Erreur", "Impossible d'ouvrir l'application d'email.");
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "white",
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            width: "100%",
            minHeight: sheetHeight,
            paddingBottom: bottomInset,
          }}
          activeOpacity={1}
        >
          {/* Drag Handle */}
          <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 8 }}>
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: tokens.colors.roogo.neutral[200],
                borderRadius: 2,
              }}
            />
          </View>

          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 24,
              paddingVertical: 16,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 24,
                  fontFamily: "Urbanist-Bold",
                  color: tokens.colors.roogo.neutral[900],
                }}
              >
                Aide & Support
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Urbanist-Medium",
                  color: tokens.colors.roogo.neutral[500],
                  marginTop: 2,
                }}
              >
                Comment pouvons-nous vous aider ?
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: tokens.colors.roogo.neutral[100],
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <XIcon size={20} color={tokens.colors.roogo.neutral[500]} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={{ paddingHorizontal: 24, gap: 12, marginTop: 12 }}>
            {/* Moov Option */}
            <TouchableOpacity
              onPress={() => handlePhoneCall("+22653111119")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: tokens.colors.roogo.neutral[50],
                padding: 16,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: tokens.colors.roogo.neutral[100],
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: "#0066B2", // Moov Blue
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <PhoneIcon size={24} color="white" weight="bold" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Urbanist-Bold",
                    color: tokens.colors.roogo.neutral[900],
                  }}
                >
                  Appeler Moov
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Urbanist-Medium",
                    color: tokens.colors.roogo.neutral[500],
                  }}
                >
                  +226 53 11 11 19
                </Text>
              </View>
            </TouchableOpacity>

            {/* Orange WhatsApp Option */}
            <TouchableOpacity
              onPress={() => handleWhatsApp("+22667006116")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: tokens.colors.roogo.neutral[50],
                padding: 16,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: tokens.colors.roogo.neutral[100],
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: "#25D366", // WhatsApp Green
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <WhatsAppIcon size={28} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Urbanist-Bold",
                    color: tokens.colors.roogo.neutral[900],
                  }}
                >
                  WhatsApp Orange
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Urbanist-Medium",
                    color: tokens.colors.roogo.neutral[500],
                  }}
                >
                  +226 67 00 61 16
                </Text>
              </View>
            </TouchableOpacity>

            {/* Email Option */}
            <TouchableOpacity
              onPress={handleEmail}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: tokens.colors.roogo.neutral[50],
                padding: 16,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: tokens.colors.roogo.neutral[100],
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: tokens.colors.roogo.primary[500],
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <EnvelopeIcon size={24} color="white" weight="bold" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Urbanist-Bold",
                    color: tokens.colors.roogo.neutral[900],
                  }}
                >
                  Email Support
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Urbanist-Medium",
                    color: tokens.colors.roogo.neutral[500],
                  }}
                >
                  support@roogobf.com
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default SupportSheet;

