import {
  WarningCircleIcon,
  CheckCircleIcon,
  PhoneIcon,
} from "phosphor-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { submitLead, type LeadData } from "../api/leads";
import type { Property } from "../constants/properties";

interface LeadFormProps {
  property: Property;
  isOnline: boolean;
  onSuccess: () => void;
  onWhatsApp: () => void;
}

interface LeadFormData {
  name: string;
  phone: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
}

const LeadForm: React.FC<LeadFormProps> = ({
  property,
  isOnline,
  onSuccess,
  onWhatsApp,
}) => {
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    phone: "",
    email: "",
    message: `Bonjour, je suis intéressé(e) par la propriété "${property.title}" située à ${property.location}. Prix: ${property.price} CFA${property.period ? `/${property.period}` : ""}. ${property.bedrooms} chambre(s), ${property.bathrooms} salle(s) de bain, ${property.area} m². Référence: #${property.id}. Merci de me recontacter.`,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // Focus management refs
  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const messageInputRef = useRef<TextInput>(null);

  // Phone number validation (simple)
  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\s/g, "");
    return cleaned.length >= 8;
  };

  // Email validation
  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Le téléphone est requis";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Format de téléphone invalide";
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit lead form
  const handleSubmitLead = async () => {
    if (!validateForm()) return;
    if (!isOnline) {
      Alert.alert(
        "Connexion requise",
        "Veuillez vérifier votre connexion internet."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const phoneNumber = formData.phone.replace(/\s/g, "");

      const leadData: LeadData = {
        listingId: property.id,
        name: formData.name.trim(),
        phone: phoneNumber,
        email: formData.email.trim() || undefined,
        message: formData.message.trim(),
        property: {
          title: property.title,
          location: property.location,
          price: property.price,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          area: property.area,
        },
      };

      // Call the mock API
      const result = await submitLead(leadData);
      console.log("Lead submission result:", result);
      setSubmitStatus("success");
      onSuccess();
    } catch (error) {
      console.error("Lead submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.name.trim() &&
    validatePhone(formData.phone) &&
    (!formData.email || validateEmail(formData.email));

  if (submitStatus === "success") {
    return (
      <View className="px-6 pb-8">
        <View className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <View className="flex-row items-center">
            <CheckCircleIcon size={20} color="#059669" />
            <Text className="text-green-800 font-medium ml-2">
              Demande envoyée avec succès !
            </Text>
          </View>
          <Text className="text-green-700 text-sm mt-1">
            Votre demande a été transmise à l&apos;agent. Il vous recontactera
            bientôt.
          </Text>
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              onPress={onWhatsApp}
              className="bg-green-500 px-4 py-2 rounded-lg flex-1"
            >
              <Text className="text-white font-medium text-center">
                Ouvrir WhatsApp
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSuccess}
              className="bg-gray-500 px-4 py-2 rounded-lg flex-1"
            >
              <Text className="text-white font-medium text-center">Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (submitStatus === "error") {
    return (
      <View className="px-6 pb-8">
        <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <View className="flex-row items-center">
            <WarningCircleIcon size={20} color="#DC2626" />
            <Text className="text-red-800 font-medium ml-2">
              Erreur lors de l&apos;envoi
            </Text>
          </View>
          <Text className="text-red-700 text-sm mt-1">
            Une erreur s&apos;est produite. Veuillez réessayer.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="px-6">
      {!isOnline && (
        <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <View className="flex-row items-center">
            <WarningCircleIcon size={20} color="#DC2626" />
            <Text className="text-red-800 font-medium ml-2">
              Connexion requise
            </Text>
          </View>
          <Text className="text-red-700 text-sm mt-1">
            Veuillez vérifier votre connexion internet pour envoyer votre
            demande.
          </Text>
        </View>
      )}

      {/* Name Field */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-800 mb-2">
          Nom complet *
        </Text>
        <TextInput
          ref={nameInputRef}
          value={formData.name}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, name: text }))
          }
          placeholder="Entrez votre nom complet"
          className="border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50"
          autoCapitalize="words"
          returnKeyType="next"
          accessibilityLabel="Nom"
        />
        {errors.name && (
          <Text className="text-red-500 text-sm mt-1 font-medium">
            {errors.name}
          </Text>
        )}
      </View>

      {/* Phone Field */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-800 mb-2">
          Numéro de téléphone *
        </Text>
        <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
          <PhoneIcon size={20} color="#6B7280" />
          <TextInput
            value={formData.phone}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, phone: text }))
            }
            placeholder="Ex: +226 70 12 34 56"
            className="flex-1 text-base"
            keyboardType="phone-pad"
            returnKeyType="next"
            accessibilityLabel="Téléphone"
          />
        </View>
        {errors.phone && (
          <Text className="text-red-500 text-sm mt-1 font-medium">
            {errors.phone}
          </Text>
        )}
      </View>

      {/* Email Field */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-800 mb-2">
          Adresse email (optionnel)
        </Text>
        <TextInput
          ref={emailInputRef}
          value={formData.email}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, email: text }))
          }
          placeholder="votre@email.com"
          className="border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50"
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
          onSubmitEditing={() => messageInputRef.current?.focus()}
          accessibilityLabel="Email"
        />
        {errors.email && (
          <Text className="text-red-500 text-sm mt-1 font-medium">
            {errors.email}
          </Text>
        )}
      </View>

      {/* Message Field */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-800 mb-1">
          Votre message
        </Text>
        <TextInput
          ref={messageInputRef}
          value={formData.message}
          onChangeText={(text) =>
            setFormData((prev) => ({
              ...prev,
              message: text,
            }))
          }
          placeholder="Décrivez votre intérêt pour cette propriété..."
          className="border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          accessibilityLabel="Message"
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmitLead}
        disabled={!isFormValid || isSubmitting || !isOnline}
        className={`py-3 rounded-xl ${
          isFormValid && !isSubmitting && isOnline
            ? "bg-blue-500"
            : "bg-gray-300"
        }`}
        accessibilityLabel="Envoyer la demande"
        accessibilityRole="button"
        activeOpacity={0.8}
      >
        <View className="flex-row items-center justify-center">
          {isSubmitting ? (
            <>
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white font-semibold ml-2">
                Envoi en cours...
              </Text>
            </>
          ) : (
            <Text className="text-white font-semibold text-base">
              Envoyer la demande
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default LeadForm;
