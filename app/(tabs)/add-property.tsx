import { useUser, useAuth } from "@clerk/clerk-expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import AgentOnly from "../components/AgentOnly";
import { SubmissionOverlay } from "../components/SubmissionOverlay";
import { listingSchema, type ListingDraft } from "../forms/listingSchema";
import { submitProperty } from "../services/propertyService";
import { ListingStep1Screen } from "../screens/ListingStep1Screen";
import { ListingStep2Screen } from "../screens/ListingStep2Screen";
import { ListingStep3Screen } from "../screens/ListingStep3Screen";

export default function AddPropertyScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState("");
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

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

      // Get Clerk session token
      const token = await getToken();
      if (!token) {
        throw new Error("Failed to get authentication token");
      }

      // Start submission process
      setIsSubmitting(true);
      setSubmissionSuccess(false);
      setSubmissionStatus("Initialisation...");

      // Submit to backend API (which will handle Supabase insertion)
      const submissionResult = await submitProperty(
        result.data,
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
      setSubmissionStatus("Terminé !");

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
      throw error; // Re-throw to let the calling component handle if needed
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
    </AgentOnly>
  );
}
