/**
 * usePaymentPolling Hook
 * 
 * Handles payment status polling logic with proper cleanup and state management.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Alert } from "react-native";
import { usePaymentService } from "../services/paymentService";

export type PaymentPollingStatus = 
  | "idle" 
  | "polling" 
  | "success" 
  | "failed" 
  | "timeout" 
  | "error";

export interface UsePaymentPollingOptions {
  /** Deposit ID to poll for (null = don't poll) */
  depositId: string | null;
  /** Callback when payment succeeds */
  onSuccess: (depositId: string) => void;
  /** Callback when payment fails */
  onFailure: (error: string) => void;
  /** Maximum polling attempts (default: 20) */
  maxAttempts?: number;
  /** Polling interval in ms (default: 3000) */
  intervalMs?: number;
  /** Maximum consecutive failures before giving up (default: 10) */
  maxFailures?: number;
}

export interface UsePaymentPollingResult {
  /** Whether currently polling */
  isPolling: boolean;
  /** Current number of poll attempts */
  attempts: number;
  /** Current polling status */
  status: PaymentPollingStatus;
  /** Status message to display */
  statusMessage: string;
  /** Reset the polling state */
  reset: () => void;
}

/**
 * Hook for polling payment status
 * 
 * @param options - Polling configuration
 * @returns Polling state and controls
 * 
 * @example
 * ```typescript
 * const { isPolling, status, statusMessage } = usePaymentPolling({
 *   depositId,
 *   onSuccess: (id) => handleSuccess(id),
 *   onFailure: (err) => Alert.alert("Error", err),
 * });
 * ```
 */
export function usePaymentPolling(
  options: UsePaymentPollingOptions
): UsePaymentPollingResult {
  const {
    depositId,
    onSuccess,
    onFailure,
    maxAttempts = 20,
    intervalMs = 3000,
    maxFailures = 10,
  } = options;

  const [status, setStatus] = useState<PaymentPollingStatus>("idle");
  const [attempts, setAttempts] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  // Refs for callbacks to avoid stale closures
  const onSuccessRef = useRef(onSuccess);
  const onFailureRef = useRef(onFailure);
  const pollFailures = useRef(0);
  const isCleanedUp = useRef(false);

  const { checkPaymentStatus } = usePaymentService();
  const checkPaymentStatusRef = useRef(checkPaymentStatus);

  // Keep refs updated
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onFailureRef.current = onFailure;
  }, [onFailure]);

  useEffect(() => {
    checkPaymentStatusRef.current = checkPaymentStatus;
  }, [checkPaymentStatus]);

  const reset = useCallback(() => {
    setStatus("idle");
    setAttempts(0);
    setStatusMessage("");
    pollFailures.current = 0;
  }, []);

  // Polling effect
  useEffect(() => {
    if (!depositId) {
      return;
    }

    isCleanedUp.current = false;
    pollFailures.current = 0;
    setStatus("polling");
    setAttempts(0);
    setStatusMessage("Vérification du paiement...");

    const interval = setInterval(async () => {
      if (isCleanedUp.current) return;

      setAttempts((prev) => {
        const newAttempts = prev + 1;

        // Check timeout
        if (newAttempts > maxAttempts) {
          clearInterval(interval);
          if (!isCleanedUp.current) {
            setStatus("timeout");
            setStatusMessage("Le délai de vérification est dépassé");
            Alert.alert(
              "Délai dépassé",
              "Le paiement prend trop de temps. Veuillez vérifier sur votre téléphone si le paiement a abouti."
            );
          }
          return newAttempts;
        }

        return newAttempts;
      });

      const checkFn = checkPaymentStatusRef.current;
      if (!checkFn) return;

      try {
        const result = await checkFn(depositId);

        if (isCleanedUp.current) return;

        if (result.success) {
          const actualStatus = result.raw?.status || result.status;

          if (actualStatus === "COMPLETED" || actualStatus === "ACCEPTED") {
            clearInterval(interval);
            setStatus("success");
            setStatusMessage("Paiement réussi !");
            
            // Small delay before callback to show success state
            setTimeout(() => {
              if (!isCleanedUp.current) {
                onSuccessRef.current(depositId);
              }
            }, 1500);
          } else if (
            actualStatus === "FAILED" ||
            actualStatus === "CANCELLED" ||
            actualStatus === "REJECTED"
          ) {
            clearInterval(interval);
            setStatus("failed");
            setStatusMessage("Le paiement a échoué");
            onFailureRef.current("Le paiement a échoué ou a été annulé.");
          } else if (actualStatus === "NOT_FOUND" && attempts >= 5) {
            clearInterval(interval);
            setStatus("error");
            setStatusMessage("Paiement non trouvé");
            onFailureRef.current(
              "Le paiement n'a pas pu être initié. Veuillez réessayer."
            );
          }
          // Otherwise keep polling (PENDING, SUBMITTED, etc.)
        } else {
          pollFailures.current += 1;
          if (pollFailures.current >= maxFailures) {
            clearInterval(interval);
            setStatus("error");
            setStatusMessage("Erreur de connexion");
            onFailureRef.current(
              "Impossible de vérifier le statut du paiement. Veuillez vérifier vos messages pour la confirmation."
            );
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
        pollFailures.current += 1;
        if (pollFailures.current >= maxFailures) {
          clearInterval(interval);
          setStatus("error");
          setStatusMessage("Erreur de vérification");
        }
      }
    }, intervalMs);

    return () => {
      isCleanedUp.current = true;
      clearInterval(interval);
    };
  }, [depositId, maxAttempts, intervalMs, maxFailures, attempts]);

  const isPolling = status === "polling";

  return {
    isPolling,
    attempts,
    status,
    statusMessage,
    reset,
  };
}

export default usePaymentPolling;
