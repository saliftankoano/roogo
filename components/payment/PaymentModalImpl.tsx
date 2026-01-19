/**
 * PaymentModal Component (Refactored)
 * 
 * Orchestrates the payment flow using modular subcomponents.
 * Handles payment initiation and delegates polling to usePaymentPolling hook.
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Pressable,
  Keyboard,
} from "react-native";
import { XIcon } from "phosphor-react-native";
import { tokens } from "../../theme/tokens";
import { formatCurrency } from "../../utils/formatting";
import {
  usePaymentService,
  PaymentProvider,
  TransactionType,
} from "../../services/paymentService";
import { usePaymentPolling } from "../../hooks/usePaymentPolling";
import type { PaymentMetadata } from "../../types/database";

import { ProviderSelector } from "./ProviderSelector";
import { PhoneInput } from "./PhoneInput";
import { OrangeOTPInput } from "./OrangeOTPInput";
import { PaymentStatus } from "./PaymentStatus";

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (depositId?: string) => void;
  amount: number;
  description: string;
  transactionType: TransactionType;
  propertyId?: string;
  metadata?: PaymentMetadata | null;
}

export function PaymentModal({
  visible,
  onClose,
  onSuccess,
  amount,
  description,
  transactionType,
  propertyId,
  metadata,
}: PaymentModalProps) {
  // Form state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [provider, setProvider] = useState<PaymentProvider | null>(null);
  const [depositId, setDepositId] = useState<string | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);

  // Refs for callbacks
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  const { initiatePayment } = usePaymentService();

  // Polling hook
  const { isPolling, status, statusMessage, reset: resetPolling } = usePaymentPolling({
    depositId,
    onSuccess: (id) => {
      onSuccessRef.current(id);
    },
    onFailure: (error) => {
      Alert.alert("Erreur", error);
      setDepositId(null);
    },
  });

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setPhoneNumber("");
      setOtpCode("");
      setProvider(null);
      setDepositId(null);
      setIsInitiating(false);
      resetPolling();
    }
  }, [visible, resetPolling]);

  const handlePayment = async () => {
    // Validation
    const cleanPhone = phoneNumber.replace(/\s/g, "");
    if (!cleanPhone || cleanPhone.length < 8) {
      Alert.alert("Erreur", "Numéro de téléphone invalide");
      return;
    }
    if (!provider) {
      Alert.alert("Erreur", "Veuillez choisir un opérateur");
      return;
    }
    if (provider === "ORANGE_MONEY" && otpCode.length < 6) {
      Alert.alert(
        "Code requis",
        "Pour Orange Money, vous devez générer un code d'autorisation en composant le *144*4*6# sur votre téléphone."
      );
      return;
    }

    setIsInitiating(true);

    const result = await initiatePayment(
      amount,
      cleanPhone,
      provider,
      transactionType,
      description,
      propertyId,
      provider === "ORANGE_MONEY" ? otpCode : undefined,
      metadata
    );

    setIsInitiating(false);

    if (result.success && result.depositId) {
      // Check if payment already accepted
      const initialStatus = result.raw?.status || result.status;
      if (initialStatus === "ACCEPTED" || initialStatus === "COMPLETED") {
        onSuccessRef.current(result.depositId);
        return;
      }

      // Start polling
      setDepositId(result.depositId);
    } else {
      Alert.alert(
        "Erreur de paiement",
        result.error || "Impossible d'initier le paiement. Veuillez réessayer."
      );
    }
  };

  const isFormValid =
    phoneNumber.replace(/\s/g, "").length >= 8 &&
    provider !== null &&
    (provider !== "ORANGE_MONEY" || otpCode.length >= 6);

  const showForm = !isPolling && !isInitiating && status !== "success";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.container} onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Paiement Sécurisé</Text>
            {showForm && (
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <XIcon size={24} color={tokens.colors.roogo.neutral[500]} />
              </TouchableOpacity>
            )}
          </View>

          {/* Amount Display */}
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Montant à payer</Text>
            <Text style={styles.amount}>{formatCurrency(amount)}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          {/* Form or Status */}
          {showForm ? (
            <>
              <ProviderSelector selected={provider} onSelect={setProvider} />
              
              <PhoneInput
                value={phoneNumber}
                onChange={setPhoneNumber}
                provider={provider}
              />

              {provider === "ORANGE_MONEY" && (
                <OrangeOTPInput value={otpCode} onChange={setOtpCode} />
              )}

              <TouchableOpacity
                style={[
                  styles.payButton,
                  !isFormValid && styles.payButtonDisabled,
                ]}
                onPress={handlePayment}
                disabled={!isFormValid}
              >
                <Text style={styles.payButtonText}>Payer Maintenant</Text>
              </TouchableOpacity>
            </>
          ) : (
            <PaymentStatus
              status={isInitiating ? "polling" : status}
              message={isInitiating ? "Initialisation du paiement..." : statusMessage}
            />
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.neutral[900],
  },
  closeButton: {
    padding: 4,
  },
  amountContainer: {
    alignItems: "center",
    marginBottom: 32,
    padding: 16,
    backgroundColor: tokens.colors.roogo.neutral[100],
    borderRadius: 16,
  },
  amountLabel: {
    fontSize: 14,
    color: tokens.colors.roogo.neutral[500],
    marginBottom: 4,
    fontFamily: "Urbanist-Medium",
  },
  amount: {
    fontSize: 32,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.primary[500],
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: tokens.colors.roogo.neutral[700],
    fontFamily: "Urbanist-Regular",
    textAlign: "center",
  },
  payButton: {
    backgroundColor: tokens.colors.roogo.primary[500],
    borderRadius: 100,
    padding: 18,
    alignItems: "center",
    marginTop: 16,
  },
  payButtonDisabled: {
    backgroundColor: tokens.colors.roogo.neutral[300],
  },
  payButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Urbanist-Bold",
  },
});
