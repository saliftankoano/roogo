// Mock API endpoint for lead submission
// In a real application, this would be a proper API route

export interface LeadData {
  listingId: number;
  name: string;
  phone: string;
  email?: string;
  message: string;
  property: {
    title: string;
    location: string;
    price: string;
    bedrooms: number;
    bathrooms: number;
    area: string;
  };
}

export interface LeadResponse {
  id: string;
  success: boolean;
  message: string;
}

// Mock function to simulate API call
export const submitLead = async (leadData: LeadData): Promise<LeadResponse> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate random success/failure for testing
  const isSuccess = Math.random() > 0.1; // 90% success rate for testing

  if (isSuccess) {
    return {
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      success: true,
      message: "Lead submitted successfully",
    };
  } else {
    throw new Error("Failed to submit lead - please try again");
  }
};
