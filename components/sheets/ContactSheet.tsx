import { PaperPlaneTiltIcon, XIcon } from "phosphor-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Keyboard,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import type { Property } from "@/constants/properties";
import LeadForm from "@/components/forms/LeadForm";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";

interface ContactSheetProps {
  visible: boolean;
  onClose: () => void;
  property: Property;
}

type FormStep = "options" | "lead-form";

const ContactSheet: React.FC<ContactSheetProps> = ({
  visible,
  onClose,
  property,
}) => {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const bottomInset = Math.max(insets.bottom, 16);
  const optionsSheetHeight = Math.max(320, Math.min(windowHeight * 0.25, 420));
  const leadFormSheetHeight = Math.min(windowHeight * 0.7, windowHeight);
  const [currentStep, setCurrentStep] = useState<FormStep>("options");
  const [isOnline, setIsOnline] = useState(true);

  // Check connectivity
  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        // Simple connectivity check
        await fetch("https://www.google.com", {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-cache",
        });
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };

    if (visible) {
      checkConnectivity();
    }
  }, [visible]);

  // Handle back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (visible) {
          if (currentStep === "lead-form") {
            setCurrentStep("options");
            return true;
          }
          onClose();
          return true;
        }
        return false;
      },
    );

    return () => backHandler.remove();
  }, [visible, currentStep, onClose]);

  // Analytics logging
  const logAnalytics = useCallback(
    (event: string, data?: any) => {
      console.log(`[Analytics] ${event}:`, { listingId: property.id, ...data });
    },
    [property.id],
  );

  // Open WhatsApp
  const handleWhatsApp = () => {
    logAnalytics("whatsapp_clicked");

    if (!property.agent?.phone) {
      Alert.alert(
        "Erreur",
        "Numéro de téléphone de l&apos;agent non disponible.",
      );
      return;
    }

    // Clean phone number for WhatsApp
    let phoneNumber = property.agent.phone.replace(/\s/g, "");
    if (!phoneNumber.startsWith("+")) {
      phoneNumber = `+${phoneNumber}`;
    }

    const message = `Bonjour, je suis intéressé(e) par la propriété "${property.title}" située à ${property.location}. Prix: ${property.price} CFA${property.period ? `/${property.period}` : ""}. ${property.bedrooms} chambre(s), ${property.bathrooms} salle(s) de bain, ${property.area} m². Référence: #${property.id}. Merci de me recontacter.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert("Erreur", "Impossible d&apos;ouvrir WhatsApp.");
    });
  };

  const isOwner = property.agent?.user_type === "owner";

  // Reset when opening
  useEffect(() => {
    if (visible) {
      if (isOwner) {
        setCurrentStep("lead-form");
      } else {
        setCurrentStep("options");
      }
      logAnalytics("contact_sheet_opened");
    }
  }, [visible, logAnalytics, isOwner]);

  const handleClose = () => {
    if (!isOwner) {
      setCurrentStep("options");
    }
    onClose();
  };

  const handleLeadFormOpen = () => {
    setCurrentStep("lead-form");
    logAnalytics("lead_form_opened");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      transparent={true}
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
        activeOpacity={1}
        onPress={() => {
          Keyboard.dismiss();
          handleClose();
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "white",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            width: "100%",
            minHeight:
              currentStep === "options"
                ? optionsSheetHeight
                : leadFormSheetHeight,
            maxHeight: leadFormSheetHeight,
          }}
          activeOpacity={1}
          onPress={() => Keyboard.dismiss()}
        >
          <SafeAreaView
            className="flex-1"
            edges={["bottom", "left", "right"]}
            style={{
              paddingBottom:
                currentStep === "lead-form"
                  ? bottomInset
                  : Math.max(bottomInset - 8, 12),
            }}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              className="flex-1"
            >
              {/* Drag Handle */}
              <View className="flex-row justify-center pt-2 pb-1">
                <View className="w-10 h-1 bg-gray-300 rounded-full" />
              </View>

              {/* Header */}
              <View className="px-6 py-3">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-2xl font-bold text-gray-900">
                    {currentStep === "options"
                      ? "Contacter l'agent"
                      : isOwner
                        ? "Envoyer un message"
                        : "Envoyer une demande"}
                  </Text>
                  <TouchableOpacity
                    onPress={handleClose}
                    className="p-2 rounded-full bg-gray-100"
                    accessibilityLabel="Fermer"
                    accessibilityRole="button"
                  >
                    <XIcon size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                {currentStep === "options" && (
                  <Text className="text-sm text-gray-600">
                    Choisissez votre méthode de contact préférée
                  </Text>
                )}
              </View>

              {currentStep === "options" ? (
                <View
                  className="px-6"
                  style={{ paddingBottom: Math.max(bottomInset - 4, 16) }}
                >
                  {/* Lead Form Option */}
                  <TouchableOpacity
                    onPress={handleLeadFormOpen}
                    className="bg-white rounded-xl p-4 mb-3 active:bg-gray-50"
                    accessibilityLabel="Envoyer une demande"
                    accessibilityRole="button"
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center">
                      <View className="bg-blue-500 p-3 rounded-lg mr-4">
                        <PaperPlaneTiltIcon size={20} color="white" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900 mb-0.5">
                          Envoyer une demande
                        </Text>
                        <Text className="text-sm text-gray-600">
                          Formulaire de contact détaillé
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* WhatsApp Option */}
                  <TouchableOpacity
                    onPress={handleWhatsApp}
                    className="bg-white rounded-xl p-4 active:bg-gray-50"
                    accessibilityLabel="Discuter sur WhatsApp"
                    accessibilityRole="button"
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center">
                      <View className="bg-green-500 p-3 rounded-lg mr-4">
                        <WhatsAppIcon size={24} color="white" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900 mb-0.5">
                          Discuter sur WhatsApp
                        </Text>
                        <Text className="text-sm text-gray-600">
                          Conversation WhatsApp instantanée
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="flex-1">
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{
                      paddingTop: 4,
                      paddingBottom: bottomInset + 24,
                    }}
                    style={{ flex: 1 }}
                  >
                    <LeadForm
                      property={property}
                      isOnline={isOnline}
                      onSuccess={handleClose}
                      onWhatsApp={handleWhatsApp}
                    />
                  </ScrollView>
                </View>
              )}
            </KeyboardAvoidingView>
          </SafeAreaView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default ContactSheet;

