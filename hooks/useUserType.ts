import { useUser } from "@clerk/clerk-expo";
import { useMemo } from "react";

export type UserType = "owner" | "renter" | "agent" | null;

export function useUserType() {
  const { user, isLoaded } = useUser();

  const userType = useMemo(() => {
    if (!user || !isLoaded) return null;
    const metadataType = user.unsafeMetadata?.userType;

    // Only return valid types
    if (
      metadataType === "owner" ||
      metadataType === "renter" ||
      metadataType === "agent"
    ) {
      return metadataType as UserType;
    }

    return null;
  }, [user, isLoaded]);

  const isAuthenticated = !!user && isLoaded;
  const isOwner = userType === "owner";
  const isRenter = userType === "renter";
  const isAgent = userType === "agent";
  const isGuest = !isAuthenticated;

  return {
    userType,
    isAuthenticated,
    isOwner,
    isRenter,
    isAgent,
    isGuest,
    hasUserType: !!userType,
    isLoaded, // Export isLoaded for loading checks
    // Legacy support - will be removed in future
    isAgentLegacy: isOwner,
    isBuyerRenter: isRenter,
  };
}
