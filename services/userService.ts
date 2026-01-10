import { supabase } from "../lib/supabase";

export interface UserStats {
  propertiesCount: number;
  viewsCount: number;
  pendingCount: number;
  favoritesCount: number;
  rating: number;
  reviewsCount: number;
}

export interface UserProfile {
  id: string;
  clerk_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  location: string | null;
  user_type: string;
}

/**
 * Get Supabase user profile by Clerk ID
 */
export async function getUserByClerkId(
  clerkId: string
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", clerkId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getUserByClerkId:", error);
    return null;
  }
}

/**
 * Update Clerk user metadata via backend API
 */
export async function updateClerkMetadata(
  clerkToken: string,
  metadata: {
    userType?: string;
    companyName?: string;
    facebookUrl?: string;
    location?: string;
    sex?: string;
    dateOfBirth?: string;
  }
): Promise<boolean> {
  try {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://roogo-backend.vercel.app";
    const response = await fetch(`${apiUrl}/api/clerk/users/me/metadata`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${clerkToken}`,
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to update Clerk metadata:", errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating Clerk metadata:", error);
    return false;
  }
}

/**
 * Get user statistics based on user type
 */
export async function getUserStats(
  userId: string,
  userType: string
): Promise<UserStats> {
  const stats: UserStats = {
    propertiesCount: 0,
    viewsCount: 0,
    pendingCount: 0,
    favoritesCount: 0,
    rating: 0,
    reviewsCount: 0,
  };

  try {
    if (userType === "owner" || userType === "agent") {
      const { data: properties, error } = await supabase
        .from("properties")
        .select("id, views_count, status")
        .eq("agent_id", userId);

      if (!error && properties) {
        stats.propertiesCount = properties.length;
        stats.viewsCount = properties.reduce(
          (sum, prop) => sum + (prop.views_count || 0),
          0
        );
        stats.pendingCount = properties.filter(
          (p) => p.status === "en_attente"
        ).length;

        if (properties.length > 0) {
          const propertyIds = properties.map((p) => p.id);
          const { count: favCount } = await supabase
            .from("favorites")
            .select("*", { count: "exact", head: true })
            .in("property_id", propertyIds);

          stats.favoritesCount = favCount || 0;
        }
      }
    } else {
      const { count, error } = await supabase
        .from("favorites")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (!error && count !== null) {
        stats.favoritesCount = count;
      }

      stats.rating = 4.8;
      stats.reviewsCount = 12;
    }

    return stats;
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return stats;
  }
}
