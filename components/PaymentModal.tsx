import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Pressable,
  Keyboard,
  Animated,
} from "react-native";
import { XIcon, CheckCircleIcon } from "phosphor-react-native";
import { tokens } from "../theme/tokens";
import {
  usePaymentService,
  PaymentProvider,
  TransactionType,
} from "../services/paymentService";

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (depositId?: string) => void;
  amount: number;
  description: string;
  transactionType: TransactionType;
  propertyId?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ProviderItemProps = {
  id: PaymentProvider;
  name: string;
  themeColor: string;
  lightColor: string;
  isSelected: boolean;
  onSelect: (id: PaymentProvider) => void;
};

function ProviderItem({
  id,
  name,
  themeColor,
  lightColor,
  isSelected,
  onSelect,
}: ProviderItemProps) {
  const anim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: isSelected ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isSelected, anim]);

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [tokens.colors.border, themeColor],
  });

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", lightColor],
  });

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const shadowOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.1],
  });

  const elevation = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  });

  return (
    <AnimatedPressable
      style={[
        styles.providerCard,
        {
          borderColor,
          backgroundColor,
          transform: [{ scale }],
          shadowColor: themeColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity,
          shadowRadius: 8,
          elevation,
        },
      ]}
      onPress={() => onSelect(id)}
    >
      <View style={styles.providerContent}>
        <View style={[styles.providerIcon, { backgroundColor: themeColor }]} />
        <Text style={styles.providerName}>{name}</Text>
      </View>
    </AnimatedPressable>
  );
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  onSuccess,
  amount,
  description,
  transactionType,
  propertyId,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [preAuthorisationCode, setPreAuthorisationCode] = useState("");
  const [provider, setProvider] = useState<PaymentProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [depositId, setDepositId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const successAnim = useRef(new Animated.Value(0)).current;
  const pollFailures = useRef(0);
  const pollAttempts = useRef(0);

  const { initiatePayment, checkPaymentStatus } = usePaymentService();

  useEffect(() => {
    if (isSuccess) {
      Animated.spring(successAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      successAnim.setValue(0);
    }
  }, [isSuccess, successAnim]);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setPhoneNumber("");
      setPreAuthorisationCode("");
      setProvider(null);
      setLoading(false);
      setStatusMessage("");
      setDepositId(null);
      setIsSuccess(false);
      pollFailures.current = 0;
      pollAttempts.current = 0;
    }
  }, [visible]);

  // Polling for status
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (depositId && loading) {
      pollFailures.current = 0;
      pollAttempts.current = 0;
      interval = setInterval(async () => {
        pollAttempts.current += 1;
        console.log(
          `[Poll ${pollAttempts.current}/20] Checking payment status for:`,
          depositId
        );

        // Timeout after 20 attempts regardless of status
        if (pollAttempts.current > 20) {
          clearInterval(interval);
          setLoading(false);
          console.log("⚠️ Payment polling timeout reached");
          Alert.alert(
            "Délai dépassé",
            "Le paiement prend trop de temps. Utilisez le numéro de test 07 34 56 78 pour un paiement qui réussit."
          );
          return;
        }

        const result = await checkPaymentStatus(depositId);
        console.log(
          `[Poll ${pollAttempts.current}] Status:`,
          result.raw?.status || result.status
        );

        if (result.success) {
          const actualStatus = result.raw?.status || result.status;

          if (actualStatus === "COMPLETED" || actualStatus === "ACCEPTED") {
            clearInterval(interval);
            console.log("✅ Payment successful");
            setStatusMessage("Paiement Réussi !");
            setIsSuccess(true);
            setLoading(false);

            // Wait 2 seconds before closing for user acknowledgment
            setTimeout(() => {
              onSuccess(depositId ?? undefined);
            }, 2000);
          } else if (
            actualStatus === "FAILED" ||
            actualStatus === "CANCELLED" ||
            actualStatus === "REJECTED"
          ) {
            clearInterval(interval);
            setLoading(false);
            console.log("❌ Payment failed:", actualStatus);
            Alert.alert("Échec", "Le paiement a échoué ou a été annulé.");
          } else if (
            actualStatus === "NOT_FOUND" &&
            pollAttempts.current >= 5
          ) {
            // If still not found after 15 seconds, the initiation probably failed
            clearInterval(interval);
            setLoading(false);
            console.log("❌ Payment not found in PawaPay system");
            Alert.alert(
              "Erreur d'initiation",
              "Le paiement n'a pas pu être initié. Veuillez réessayer."
            );
          }
        } else {
          pollFailures.current += 1;
          console.log(`⚠️ Poll failure ${pollFailures.current}/10`);
          if (pollFailures.current >= 10) {
            clearInterval(interval);
            setLoading(false);
            Alert.alert(
              "Erreur de connexion",
              "Impossible de vérifier le statut du paiement. Veuillez vérifier vos messages pour la confirmation."
            );
          }
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [depositId, loading, checkPaymentStatus, onSuccess]);

  const formatPhoneNumber = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/[^0-9]/g, "");

    // Limit to 8 digits (Burkina Faso phone numbers)
    const limited = cleaned.slice(0, 8);

    // Format in groups of 2 digits: "70 12 34 56"
    const formatted = limited.match(/.{1,2}/g)?.join(" ") || limited;

    return formatted;
  };

  const handlePayment = async () => {
    // Remove spaces for validation and API call
    const cleanPhoneNumber = phoneNumber.replace(/\s/g, "");

    if (!cleanPhoneNumber || cleanPhoneNumber.length < 8) {
      Alert.alert("Erreur", "Numéro de téléphone invalide");
      return;
    }
    if (!provider) {
      Alert.alert("Erreur", "Veuillez choisir un opérateur");
      return;
    }

    if (provider === "ORANGE_MONEY" && !preAuthorisationCode) {
      Alert.alert(
        "Code requis",
        "Pour Orange Money, vous devez générer un code d'autorisation en composant le *144*4*6# sur votre téléphone."
      );
      return;
    }

    setLoading(true);
    setStatusMessage("Initialisation du paiement...");

    const result = await initiatePayment(
      amount,
      cleanPhoneNumber,
      provider,
      transactionType,
      description,
      propertyId,
      preAuthorisationCode
    );

    if (result.success && result.depositId) {
      // Check if payment is already accepted in the initiation response
      const initialStatus = result.raw?.status || result.status;
      console.log("Initial payment status:", initialStatus);

      if (initialStatus === "ACCEPTED" || initialStatus === "COMPLETED") {
        console.log("✅ Payment accepted immediately!");
        setStatusMessage("Paiement Réussi, merci de votre confiance !");
        setIsSuccess(true);
        setLoading(false);

        // Wait 2 seconds before closing for user acknowledgment
        setTimeout(() => {
          onSuccess((result.depositId || depositId) ?? undefined);
        }, 2000);
        return;
      }

      setDepositId(result.depositId);
      setStatusMessage("Veuillez valider le paiement sur votre téléphone...");
    } else {
      setLoading(false);
      const errorMsg =
        result.error || "Impossible d'initier le paiement. Veuillez réessayer.";
      Alert.alert("Erreur de paiement", errorMsg);
    }
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

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
            {!loading && (
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <XIcon size={24} color={tokens.colors.roogo.neutral[500]} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Montant à payer</Text>
            <Text style={styles.amount}>{formatPrice(amount)} FCFA</Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          {loading || isSuccess ? (
            <View style={styles.loadingContainer}>
              {isSuccess ? (
                <Animated.View
                  style={[
                    styles.successIconContainer,
                    {
                      transform: [
                        { scale: successAnim },
                        {
                          translateY: successAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                          }),
                        },
                      ],
                      opacity: successAnim,
                    },
                  ]}
                >
                  <CheckCircleIcon
                    size={80}
                    weight="fill"
                    color={tokens.colors.roogo.primary[500]}
                  />
                </Animated.View>
              ) : (
                <ActivityIndicator
                  size="large"
                  color={tokens.colors.roogo.primary[500]}
                />
              )}
              <Text
                style={[styles.loadingText, isSuccess && styles.successText]}
              >
                {statusMessage}
              </Text>
              {!isSuccess && (
                <Text style={styles.loadingSubtext}>
                  Ne fermez pas cette fenêtre
                </Text>
              )}
            </View>
          ) : (
            <>
              {/* Provider Selection */}
              <Text style={styles.label}>Choisir l&apos;opérateur</Text>
              <View style={styles.providers}>
                <ProviderItem
                  id="ORANGE_MONEY"
                  name="Orange Money"
                  themeColor="#FF7900"
                  lightColor="#FFF4E6"
                  isSelected={provider === "ORANGE_MONEY"}
                  onSelect={setProvider}
                />
                <ProviderItem
                  id="MOOV_MONEY"
                  name="Moov Money"
                  themeColor="#0066B2"
                  lightColor="#E6F0FF"
                  isSelected={provider === "MOOV_MONEY"}
                  onSelect={setProvider}
                />
              </View>

              {/* Phone Number */}
              <Text style={styles.label}>Numéro de téléphone</Text>
              <TextInput
                style={styles.input}
                placeholder={
                  provider === "ORANGE_MONEY"
                    ? "Ex: 07 34 56 78 (test)"
                    : provider === "MOOV_MONEY"
                      ? "Ex: 02 34 56 78 (test)"
                      : "Ex: 70 12 34 56"
                }
                value={phoneNumber}
                onChangeText={(text) => {
                  // Format the phone number with spaces as user types
                  const formatted = formatPhoneNumber(text);
                  setPhoneNumber(formatted);
                }}
                keyboardType="phone-pad"
                maxLength={11}
              />
              <Text style={styles.helperText}>
                {provider === "ORANGE_MONEY"
                  ? "Test: 07 34 56 78 (succès) • ⚠️ Évitez 07 34 51 28 (bloque)"
                  : provider === "MOOV_MONEY"
                    ? "Test: 02 34 56 78 (succès)"
                    : "Sélectionnez un opérateur pour voir les numéros de test"}
              </Text>

              {/* Pre-authorisation code for Orange Burkina Faso */}
              {provider === "ORANGE_MONEY" && (
                <>
                  <Text style={styles.label}>
                    Code d&apos;autorisation (OTP)
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Entrez le code à 6 chiffres"
                    value={preAuthorisationCode}
                    onChangeText={setPreAuthorisationCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <Text style={styles.ussdHelper}>
                    Composez <Text style={styles.ussdCode}>*144*4*6#</Text> pour
                    générer votre code (valable 15 min).
                  </Text>
                  <Text style={styles.sandboxHelper}>
                    En test, utilisez n&apos;importe quel code à 6 chiffres (ex:
                    666666).
                  </Text>
                </>
              )}

              <TouchableOpacity
                style={[
                  styles.payButton,
                  (!phoneNumber ||
                    phoneNumber.replace(/\s/g, "").length < 8 ||
                    !provider ||
                    (provider === "ORANGE_MONEY" &&
                      preAuthorisationCode.length < 6)) &&
                    styles.payButtonDisabled,
                ]}
                onPress={handlePayment}
                disabled={
                  !phoneNumber ||
                  phoneNumber.replace(/\s/g, "").length < 8 ||
                  !provider ||
                  (provider === "ORANGE_MONEY" &&
                    preAuthorisationCode.length < 6)
                }
              >
                <Text style={styles.payButtonText}>Payer Maintenant</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Pressable>
    </Modal>
  );
};

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
  label: {
    fontSize: 16,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.neutral[900],
    marginBottom: 12,
  },
  providers: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  providerCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  providerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  providerSelected: {
    // handled by animation
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  providerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  providerName: {
    fontSize: 14,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.neutral[900],
  },
  input: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: "Urbanist-Regular",
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    fontFamily: "Urbanist-Regular",
    color: tokens.colors.roogo.neutral[500],
    marginBottom: 16,
    marginTop: 4,
  },
  ussdHelper: {
    fontSize: 14,
    fontFamily: "Urbanist-Medium",
    color: tokens.colors.roogo.neutral[700],
    marginBottom: 4,
  },
  ussdCode: {
    color: tokens.colors.roogo.primary[500],
    fontFamily: "Urbanist-Bold",
  },
  sandboxHelper: {
    fontSize: 12,
    fontFamily: "Urbanist-Italic",
    color: tokens.colors.roogo.neutral[500],
    marginBottom: 24,
  },
  payButton: {
    backgroundColor: tokens.colors.roogo.primary[500],
    borderRadius: 100,
    padding: 18,
    alignItems: "center",
  },
  payButtonDisabled: {
    backgroundColor: tokens.colors.roogo.neutral[500],
    opacity: 0.5,
  },
  payButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Urbanist-Bold",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.neutral[900],
    textAlign: "center",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: "Urbanist-Regular",
    color: tokens.colors.roogo.neutral[500],
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successText: {
    color: tokens.colors.roogo.primary[500],
    fontSize: 24,
  },
});
