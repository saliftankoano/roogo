/**
 * Favorites Service
 * 
 * Handles CRUD operations for user favorites with Supabase.
 * Includes optimistic updates with rollback on error.
 */

import { supabase } from "../lib/supabase";
import type { Property } from "../constants/properties";

export interface FavoriteResult {
  success: boolean;
  error?: string;
}

export interface FavoritesListResult {
  success: boolean;
  favorites: string[]; // Array of property IDs
  error?: string;
}

/**
 * Get Supabase user ID from Clerk ID
 */
async function getSupabaseUserId(clerkId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .maybeSingle();

  if (error) {
    console.error("Error getting Supabase user ID:", error);
    return null;
  }

  if (!data) {
    // User not found in Supabase - valid case (e.g. not synced yet)
    // Return null silently so we just show empty favorites
    return null;
  }

  return data.id;
}

/**
 * Fetch all favorite property IDs for a user
 * 
 * @param clerkId - Clerk user ID
 * @returns Array of property UUIDs that are favorited
 */
export async function fetchUserFavoriteIds(clerkId: string): Promise<FavoritesListResult> {
  try {
    const userId = await getSupabaseUserId(clerkId);
    if (!userId) {
      return { success: false, favorites: [], error: "User not found" };
    }

    const { data, error } = await supabase
      .from("user_favorites")
      .select("property_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching favorites:", error);
      return { success: false, favorites: [], error: error.message };
    }

    const favoriteIds = data?.map((f) => f.property_id) || [];
    return { success: true, favorites: favoriteIds };
  } catch (error) {
    console.error("Error in fetchUserFavoriteIds:", error);
    return {
      success: false,
      favorites: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Fetch all favorite properties with full details
 * 
 * @param clerkId - Clerk user ID
 * @returns Array of favorited Property objects
 */
export async function fetchUserFavorites(clerkId: string): Promise<Property[]> {
  try {
    const userId = await getSupabaseUserId(clerkId);
    if (!userId) {
      return [];
    }

    const { data, error } = await supabase
      .from("user_favorites")
      .select(`
        property_id,
        created_at,
        properties:property_id (
          *,
          property_images (
            id,
            url,
            width,
            height,
            is_primary
          ),
          users:agent_id (
            id,
            full_name,
            avatar_url,
            phone,
            email
          )
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching favorite properties:", error);
      return [];
    }

    // Transform to Property format
    return (data || [])
      .filter((item: any) => item.properties)
      .map((item: any) => {
        const prop = item.properties;
        const primaryImage = prop.property_images?.find((img: any) => img.is_primary) 
          || prop.property_images?.[0];
        
        return {
          id: parseInt(prop.id.replace(/-/g, "").substring(0, 8), 16),
          uuid: prop.id,
          title: prop.title || "Sans titre",
          location: prop.quartier 
            ? `${prop.quartier}, ${prop.city || "Ouagadougou"}`
            : "Ouagadougou",
          address: prop.address || "",
          price: (prop.price || 0).toString(),
          bedrooms: prop.bedrooms || 0,
          bathrooms: prop.bathrooms || 0,
          area: (prop.area || 0).toString(),
          parking: prop.parking_spaces || 0,
          period: prop.period === "month" || prop.period === "Mois" ? "Mois" : undefined,
          image: primaryImage ? { uri: primaryImage.url } : null,
          images: prop.property_images?.map((img: any) => ({ uri: img.url })),
          category: prop.property_type === "commercial" ? "Business" : "Residential",
          isSponsored: !!prop.is_boosted,
          status: prop.status || "en_attente",
          propertyType: prop.property_type,
          description: prop.description || "",
          amenities: [],
          agent: prop.users ? {
            name: prop.users.full_name || "Agent",
            agency: "Agency",
            avatar: prop.users.avatar_url ? { uri: prop.users.avatar_url } : null,
            phone: prop.users.phone,
            email: prop.users.email,
          } : undefined,
        } as Property;
      });
  } catch (error) {
    console.error("Error in fetchUserFavorites:", error);
    return [];
  }
}

/**
 * Add a property to user's favorites
 * 
 * @param clerkId - Clerk user ID
 * @param propertyId - Property UUID to favorite
 * @returns Result indicating success or failure
 */
export async function addFavorite(
  clerkId: string,
  propertyId: string
): Promise<FavoriteResult> {
  try {
    const userId = await getSupabaseUserId(clerkId);
    if (!userId) {
      return { success: false, error: "User not found" };
    }

    const { error } = await supabase
      .from("user_favorites")
      .insert({
        user_id: userId,
        property_id: propertyId,
      });

    if (error) {
      // Check if it's a duplicate error (already favorited)
      if (error.code === "23505") {
        return { success: true }; // Already favorited, treat as success
      }
      console.error("Error adding favorite:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in addFavorite:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Remove a property from user's favorites
 * 
 * @param clerkId - Clerk user ID
 * @param propertyId - Property UUID to unfavorite
 * @returns Result indicating success or failure
 */
export async function removeFavorite(
  clerkId: string,
  propertyId: string
): Promise<FavoriteResult> {
  try {
    const userId = await getSupabaseUserId(clerkId);
    if (!userId) {
      return { success: false, error: "User not found" };
    }

    const { error } = await supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("property_id", propertyId);

    if (error) {
      console.error("Error removing favorite:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in removeFavorite:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Toggle favorite status for a property
 * 
 * @param clerkId - Clerk user ID
 * @param propertyId - Property UUID
 * @param currentlyFavorited - Whether the property is currently favorited
 * @returns Result indicating success or failure and new favorite state
 */
export async function toggleFavorite(
  clerkId: string,
  propertyId: string,
  currentlyFavorited: boolean
): Promise<FavoriteResult & { isFavorited?: boolean }> {
  if (currentlyFavorited) {
    const result = await removeFavorite(clerkId, propertyId);
    return { ...result, isFavorited: !result.success };
  } else {
    const result = await addFavorite(clerkId, propertyId);
    return { ...result, isFavorited: result.success };
  }
}

/**
 * Check if a property is favorited by the user
 * 
 * @param clerkId - Clerk user ID
 * @param propertyId - Property UUID to check
 * @returns Whether the property is favorited
 */
export async function isFavorited(
  clerkId: string,
  propertyId: string
): Promise<boolean> {
  try {
    const userId = await getSupabaseUserId(clerkId);
    if (!userId) return false;

    const { data, error } = await supabase
      .from("user_favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("property_id", propertyId)
      .maybeSingle();

    if (error) {
      console.error("Error checking favorite status:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Error in isFavorited:", error);
    return false;
  }
}

/**
 * Get favorites count for a property (for analytics)
 * 
 * @param propertyId - Property UUID
 * @returns Number of users who have favorited this property
 */
export async function getFavoritesCount(propertyId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("user_favorites")
      .select("*", { count: "exact", head: true })
      .eq("property_id", propertyId);

    if (error) {
      console.error("Error getting favorites count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error in getFavoritesCount:", error);
    return 0;
  }
}
