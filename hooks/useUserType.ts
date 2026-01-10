import { useUser } from "@clerk/clerk-expo";
import { useMemo } from "react";

export type UserType = "owner" | "renter" | "agent" | "staff" | null;

export function useUserType() {
  const { user, isLoaded } = useUser();

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/8d4160e4-1a58-4ce5-b197-c68afdfbc381", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "useUserType.ts:7",
      message: "Auth state check",
      data: {
        isLoaded,
        hasUser: !!user,
        userTypeMetadata: user?.publicMetadata?.userType,
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      hypothesisId: "1,5",
    }),
  }).catch(() => {});
  // #endregion
  const userType = useMemo(() => {
    if (!user || !isLoaded) return null;

    // Check publicMetadata (secure).
    // We stop looking at unsafeMetadata as part of the migration to secure fields.
    const metadataType = user.publicMetadata?.userType as string;

    // Only return valid types
    if (
      metadataType === "owner" ||
      metadataType === "renter" ||
      metadataType === "agent" ||
      metadataType === "staff"
    ) {
      return metadataType as UserType;
    }

    return null;
  }, [user, isLoaded]);

  const isAuthenticated = !!user && isLoaded;
  const isOwner = userType === "owner";
  const isRenter = userType === "renter";
  const isAgent = userType === "agent";
  const isStaff = userType === "staff";
  const isGuest = !isAuthenticated;

  return {
    userType,
    isAuthenticated,
    isOwner,
    isRenter,
    isAgent,
    isStaff,
    isGuest,
    hasUserType: !!userType,
    isLoaded,
  };
}
