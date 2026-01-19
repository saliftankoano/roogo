import { useUser, useAuth } from "@clerk/clerk-expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import AgentOnly from "../../components/AgentOnly";
import { SubmissionOverlay } from "../../components/SubmissionOverlay";
import {
  listingSchema,
  type ListingDraft,
  TIERS,
} from "../../forms/listingSchema";
import { submitProperty } from "../../services/propertyService";
import { ListingStep1Screen } from "../../screens/ListingStep1Screen";
import { ListingStep2Screen } from "../../screens/ListingStep2Screen";
import { ListingStep3Screen } from "../../screens/ListingStep3Screen";
import { PaymentModal } from "../../components/PaymentModal";
import { UpsellModal } from "../../components/UpsellModal";

export default function AddPropertyScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState("");
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Upsell state
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const calculateAddOnTotal = () => {
    const prices: Record<string, number> = {
      video: 10000,
      extra_slots: 7500,
      "3d_env": 25000,
      extra_photos: 10000,
      boost: 7000,
      open_house: 3000,
    };
    return selectedAddOns.reduce((sum, id) => sum + (prices[id] || 0), 0);
  };

  const calculateTierPrice = () => {
    if (!formData.tier_id) return 0;
    const tier = TIERS.find((t) => t.id === formData.tier_id);
    if (!tier) return 0;

    const rent = formData.prixMensuel || 0;
    const baseFee = tier.base_fee;
    const percentageFee = rent * 0.05;

    return baseFee + percentageFee + calculateAddOnTotal();
  };

  const getPriceBreakdown = () => {
    if (!formData.tier_id) return null;
    const tier = TIERS.find((t) => t.id === formData.tier_id);
    if (!tier) return null;

    const rent = formData.prixMensuel || 0;
    const baseFee = tier.base_fee;
    const percentageFee = rent * 0.05;

    const addOns: Record<string, number> = {
      video: 10000,
      extra_slots: 7500,
      "3d_env": 25000,
      extra_photos: 10000,
      boost: 7000,
      open_house: 3000,
    };

    const addOnDetails = selectedAddOns.map((id) => ({
      id,
      name:
        id === "video"
          ? "Vidéo incluse"
          : id === "extra_slots"
            ? "Slots additionnels"
            : id === "3d_env"
              ? "Environnement 3D"
              : id === "extra_photos"
                ? "Photos supplémentaires"
                : id === "boost"
                  ? "Boost visibilité"
                  : "Open House extra",
      price: addOns[id] || 0,
    }));

    return {
      tier: {
        id: tier.id,
        name: tier.name,
        base_fee: baseFee,
      },
      commission: percentageFee,
      add_ons: addOnDetails,
      total: baseFee + percentageFee + calculateAddOnTotal(),
    };
  };

  const [formData, setFormData] = useState<Partial<ListingDraft>>({
    photos: [],
    equipements: [],
    interdictions: [],
  });

  const {
    formState: { errors: formErrors },
    setError,
    clearErrors,
  } = useForm<ListingDraft>({
    resolver: zodResolver(listingSchema),
    mode: "onChange",
    defaultValues: formData as ListingDraft,
  });

  // Convert form errors to simple object
  const errors = Object.keys(formErrors).reduce(
    (acc, key) => {
      const error = formErrors[key as keyof ListingDraft];
      if (error) {
        acc[key] = error.message || "Champ invalide";
      }
      return acc;
    },
    {} as Record<string, string>
  );

  const handleFormChange = (data: Partial<ListingDraft>) => {
    setFormData(data);
    clearErrors();
  };

  const validateStep1 = async () => {
    const step1Fields: (keyof ListingDraft)[] = [
      "titre",
      "type",
      "prixMensuel",
      "quartier",
      "ville",
    ];

    try {
      // Validate step 1 fields
      const result = listingSchema.safeParse(formData);
      if (!result.success) {
        const step1Errors = result.error.issues.filter((issue) =>
          step1Fields.includes(issue.path[0] as keyof ListingDraft)
        );
        if (step1Errors.length > 0) {
          step1Errors.forEach((err) => {
            setError(err.path[0] as keyof ListingDraft, {
              message: err.message,
            });
          });
          return false;
        }
      }

      // Check required fields manually
      if (
        !formData.titre ||
        formData.titre.length < 4 ||
        !formData.type ||
        !formData.prixMensuel ||
        formData.prixMensuel < 1000 ||
        !formData.quartier ||
        formData.quartier.length < 2 ||
        !formData.ville
      ) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  };

  const validateStep2 = async () => {
    // Check photos
    if (!formData.photos || formData.photos.length < 3) {
      setError("photos", { message: "Veuillez ajouter au moins 3 photos" });
      return false;
    }

    // Validate description length if provided
    if (formData.description && formData.description.length > 1200) {
      setError("description", {
        message: "La description ne doit pas dépasser 1200 caractères",
      });
      return false;
    }

    return true;
  };

  const handleNextStep1 = async () => {
    const isValid = await validateStep1();
    if (isValid) {
      setCurrentStep(2);
    }
  };

  const handleNextStep2 = async () => {
    const isValid = await validateStep2();
    if (isValid) {
      setCurrentStep(3);
    }
  };

  const handleBackStep2 = () => {
    setCurrentStep(1);
  };

  const handleBackStep3 = () => {
    setCurrentStep(2);
  };

  const handleSubmit = async () => {
    try {
      // Validate entire form
      const result = listingSchema.safeParse(formData);
      if (!result.success) {
        console.error("Validation errors:", result.error);
        throw new Error("Validation failed");
      }

      // Check if user is authenticated
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Show upsell flow instead of going straight to payment
      setShowUpsellModal(true);
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  const handleUpsellConfirm = (addOns: string[]) => {
    setSelectedAddOns(addOns);
    setShowUpsellModal(false);
    // After upsell, proceed to payment
    setShowPaymentModal(true);
  };

  // Called after payment is successful
  const handlePaymentSuccess = async (depositId?: string) => {
    setShowPaymentModal(false);
    setIsSubmitting(true);
    setSubmissionSuccess(false);
    setSubmissionStatus("Paiement reçu ! Initialisation...");

    try {
      // Get Clerk session token
      const token = await getToken();
      if (!token) throw new Error("Authentication failed");

      // Submit to backend API with the payment reference
      const submissionResult = await submitProperty(
        {
          ...(formData as ListingDraft),
          payment_id: depositId,
          add_ons: selectedAddOns,
        },
        token,
        (status) => setSubmissionStatus(status)
      );

      if (!submissionResult.success) {
        throw new Error(
          submissionResult.error || "Failed to submit property listing"
        );
      }

      // Success
      setSubmissionSuccess(true);
      setSubmissionStatus("Votre annonce est en cours de révision");

      console.log(
        "Property submitted successfully:",
        submissionResult.propertyId
      );

      // Wait a moment to show success state before resetting/navigating
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmissionSuccess(false);
        setSubmissionStatus("");
        setCurrentStep(1);
        setFormData({
          photos: [],
          equipements: [],
          interdictions: [],
        });
        // Navigate to "My Properties" tab
        navigation.navigate("my-properties" as never);
      }, 2000);
    } catch (error) {
      console.error("Submit error:", error);
      setIsSubmitting(false);
      alert("Erreur lors de la soumission. Veuillez contacter le support.");
    }
  };

  return (
    <AgentOnly>
      {currentStep === 1 && (
        <ListingStep1Screen
          navigation={navigation}
          formData={formData}
          onFormChange={handleFormChange}
          onNext={handleNextStep1}
          errors={errors}
        />
      )}
      {currentStep === 2 && (
        <ListingStep2Screen
          navigation={navigation}
          formData={formData}
          onFormChange={handleFormChange}
          onNext={handleNextStep2}
          onBack={handleBackStep2}
          errors={errors}
        />
      )}
      {currentStep === 3 && (
        <ListingStep3Screen
          navigation={navigation}
          formData={formData}
          onFormChange={handleFormChange}
          onBack={handleBackStep3}
          onSubmit={handleSubmit}
          errors={errors}
        />
      )}

      {/* Submission Progress Overlay */}
      <SubmissionOverlay
        visible={isSubmitting}
        status={submissionStatus}
        isSuccess={submissionSuccess}
      />

      {/* Payment Modal */}
      <PaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        amount={calculateTierPrice()}
        description={`Pack ${
          TIERS.find((t) => t.id === formData.tier_id)?.name || ""
        }${selectedAddOns.length > 0 ? " avec Options" : ""}`}
        transactionType="listing_submission"
        metadata={getPriceBreakdown()}
      />

      {/* Upsell Modal */}
      <UpsellModal
        visible={showUpsellModal}
        onClose={() => {
          setShowUpsellModal(false);
          setShowPaymentModal(true); // Still proceed to payment even if dismissed?
          // Actually, usually users want to proceed.
        }}
        onConfirm={handleUpsellConfirm}
        currentTierId={formData.tier_id}
      />
    </AgentOnly>
  );
}
