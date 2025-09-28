import { useUser } from "@clerk/clerk-expo";
import { useMemo } from "react";

export type UserType = "agent" | "regular" | null;

export function useUserType() {
  const { user } = useUser();

  const userType = useMemo(() => {
    if (!user) return null;
    return user.unsafeMetadata?.userType as UserType;
  }, [user]);

  const isAgent = userType === "agent";
  const isBuyerRenter = userType === "regular";

  return {
    userType,
    isAgent,
    isBuyerRenter,
    hasUserType: !!userType,
  };
}
