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
import { submitLead, type LeadData } from "@/api/leads";
import type { Property } from "@/constants/properties";

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
        "Veuillez vérifier votre connexion internet.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const phoneNumber = formData.phone.replace(/\s/g, "");

      const leadData: LeadData = {
        listingId: Number(property.id),
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

      const result = await submitLead(leadData);

      if (result.success) {
        setSubmitStatus("success");
        Alert.alert(
          "Message envoyé !",
          "Votre demande a été transmise. L'agent vous contactera rapidement.",
          [{ text: "OK", onPress: onSuccess }],
        );
      } else {
        setSubmitStatus("error");
        Alert.alert(
          "Erreur",
          "Impossible d'envoyer la demande. Réessayez ou contactez-nous sur WhatsApp.",
        );
      }
    } catch (error) {
      console.error("Error submitting lead:", error);
      setSubmitStatus("error");
      Alert.alert(
        "Erreur",
        "Impossible d'envoyer la demande. Réessayez ou contactez-nous sur WhatsApp.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof LeadFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <View className="px-6">
      {/* Form fields */}
      <View className="space-y-4">
        {/* Name */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Nom complet *
          </Text>
          <TextInput
            ref={nameInputRef}
            value={formData.name}
            onChangeText={(v) => updateField("name", v)}
            placeholder="Votre nom"
            className={`bg-gray-50 border rounded-xl px-4 py-3 text-base ${
              errors.name ? "border-red-500" : "border-gray-200"
            }`}
            returnKeyType="next"
            onSubmitEditing={() => emailInputRef.current?.focus()}
          />
          {errors.name && (
            <Text className="text-xs text-red-500 mt-1">{errors.name}</Text>
          )}
        </View>

        {/* Phone */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Téléphone *
          </Text>
          <View
            className={`flex-row items-center bg-gray-50 border rounded-xl px-4 ${
              errors.phone ? "border-red-500" : "border-gray-200"
            }`}
          >
            <PhoneIcon size={18} color="#6B7280" />
            <TextInput
              value={formData.phone}
              onChangeText={(v) => updateField("phone", v)}
              placeholder="Ex: 70 12 34 56"
              className="flex-1 py-3 px-3 text-base"
              keyboardType="phone-pad"
              returnKeyType="next"
              onSubmitEditing={() => emailInputRef.current?.focus()}
            />
          </View>
          {errors.phone && (
            <Text className="text-xs text-red-500 mt-1">{errors.phone}</Text>
          )}
        </View>

        {/* Email (optional) */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Email (optionnel)
          </Text>
          <TextInput
            ref={emailInputRef}
            value={formData.email}
            onChangeText={(v) => updateField("email", v)}
            placeholder="Votre email"
            className={`bg-gray-50 border rounded-xl px-4 py-3 text-base ${
              errors.email ? "border-red-500" : "border-gray-200"
            }`}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => messageInputRef.current?.focus()}
          />
          {errors.email && (
            <Text className="text-xs text-red-500 mt-1">{errors.email}</Text>
          )}
        </View>

        {/* Message */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Message *
          </Text>
          <TextInput
            ref={messageInputRef}
            value={formData.message}
            onChangeText={(v) => updateField("message", v)}
            placeholder="Votre message..."
            multiline
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base min-h-[120px]"
            textAlignVertical="top"
          />
        </View>
      </View>

      {/* Online status */}
      {!isOnline && (
        <View className="flex-row items-center bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6">
          <WarningCircleIcon size={20} color="#F59E0B" weight="fill" />
          <Text className="text-sm text-yellow-800 ml-3 flex-1">
            Vous semblez hors ligne. Vérifiez votre connexion avant d&apos;envoyer.
          </Text>
        </View>
      )}

      {/* Buttons */}
      <View className="mt-8 space-y-3">
        <TouchableOpacity
          onPress={handleSubmitLead}
          disabled={isSubmitting}
          className={`h-[54px] rounded-2xl items-center justify-center ${
            isSubmitting ? "bg-gray-200" : "bg-black"
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#000000" />
          ) : submitStatus === "success" ? (
            <View className="flex-row items-center">
              <CheckCircleIcon size={18} color="white" weight="fill" />
              <Text className="text-white font-bold text-base ml-2">
                Envoyé
              </Text>
            </View>
          ) : (
            <Text className="text-white font-bold text-base">
              Envoyer la demande
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onWhatsApp}
          className="h-[54px] rounded-2xl items-center justify-center bg-green-600"
        >
          <Text className="text-white font-bold text-base">
            Contacter sur WhatsApp
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LeadForm;

