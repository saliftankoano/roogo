import { useAuth } from "@clerk/clerk-expo";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type TransactionType =
  | "listing_submission"
  | "photography"
  | "property_lock"
  | "boost";
export type PaymentProvider = "ORANGE_MONEY" | "MOOV_MONEY";

export interface InitiatePaymentResponse {
  success: boolean;
  depositId?: string;
  status?: string;
  error?: string;
  raw?: any;
}

export interface PaymentStatusResponse {
  success: boolean;
  status: string;
  error?: string;
  raw?: any;
}

export const usePaymentService = () => {
  const { getToken } = useAuth();

  const initiatePayment = async (
    amount: number,
    phoneNumber: string,
    provider: PaymentProvider,
    transactionType: TransactionType,
    description: string,
    propertyId?: string,
    preAuthorisationCode?: string
  ): Promise<InitiatePaymentResponse> => {
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_URL}/api/payments/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          phoneNumber,
          provider,
          description,
          transactionType,
          propertyId,
          preAuthorisationCode,
        }),
      });

      const data = await response.json();
      console.log(
        "Payment initiation response:",
        JSON.stringify(data, null, 2)
      );

      if (!response.ok) {
        console.error(
          `Payment failed on ${API_URL}. Status: ${response.status}. Error:`,
          JSON.stringify(data, null, 2)
        );
        // Extract detailed error message if available
        // Check for PawaPay failure reason first
        const failureReason = data.details?.failureReason;
        const errorMessage =
          failureReason?.failureMessage ||
          data.details?.errorMessage ||
          data.details?.error ||
          data.error ||
          "Payment initiation failed";
        throw new Error(errorMessage);
      }

      return data;
    } catch (error: any) {
      console.error("Payment error:", error);
      return {
        success: false,
        error: error.message || "An unexpected error occurred",
      };
    }
  };

  const checkPaymentStatus = async (
    depositId: string
  ): Promise<PaymentStatusResponse> => {
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_URL}/api/payments/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ depositId }),
      });

      const data = await response.json();
      console.log(
        "Payment status check response:",
        JSON.stringify(data, null, 2)
      );

      if (!response.ok) {
        console.error("Status check failed:", JSON.stringify(data, null, 2));
        throw new Error(data.error || "Status check failed");
      }

      return data;
    } catch (error: any) {
      console.error("Status check error:", error);
      return {
        success: false,
        status: "UNKNOWN",
        error: error.message,
      };
    }
  };

  return { initiatePayment, checkPaymentStatus };
};
