import { supabase } from "../lib/supabase";
import type { Property, PropertyAgent } from "../constants/properties";
import type {
  DatabaseProperty,
  DatabasePropertyImage,
  DatabaseAmenity,
  DatabaseAgent,
  DatabaseOpenHouseSlot,
} from "../types/database";

// Re-export types for backward compatibility
export type { DatabaseProperty, DatabasePropertyImage as PropertyImage, DatabaseAmenity as PropertyAmenity };

/**
 * Transform database property to frontend Property type
 */
function transformProperty(dbProperty: DatabaseProperty): Property {
  // Try to find images in multiple possible locations
  // Supabase join often returns them as 'property_images'
  const rawImages =
    Array.isArray(dbProperty.images) && dbProperty.images.length > 0
      ? dbProperty.images
      : Array.isArray(dbProperty.property_images) &&
          dbProperty.property_images.length > 0
        ? dbProperty.property_images
        : [];

  // Get primary image or first image
  const primaryImage =
    rawImages.find(
      (img: any) => img && typeof img === "object" && img.is_primary
    ) || rawImages[0];

  // Determine the image source
  let propertyImage: any = null;
  if (primaryImage) {
    if (typeof primaryImage === "string") {
      propertyImage = { uri: primaryImage };
    } else     if (typeof primaryImage === "object") {
      const imageUrl = primaryImage.url || (primaryImage as any).uri;
      if (imageUrl) {
        propertyImage = { uri: imageUrl };
      }
    }
  } else if ((dbProperty as any).image_url || (dbProperty as any).imageUrl) {
    // Fallback if image is at top level
    propertyImage = { uri: (dbProperty as any).image_url || (dbProperty as any).imageUrl };
  }

  // Convert all images to format expected by frontend
  const images = rawImages.map((img: any) => {
    if (typeof img === "string") return { uri: img };
    if (typeof img === "object") {
      const url = img.url || img.uri;
      if (url) return { uri: url };
    }
    return img;
  });

  // Determine category based on property_type
  const category: "Residential" | "Business" =
    dbProperty.property_type === "commercial" ? "Business" : "Residential";

  // Map property_type to display format
  const propertyTypeMap: Record<string, string> = {
    villa: "Villa",
    appartement: "Appartement",
    maison: "Maison",
    terrain: "Terrain",
    commercial: "Commercial",
  };

  // Transform agent if available
  const dbAgent =
    dbProperty.agent ||
    (Array.isArray(dbProperty.users) ? dbProperty.users[0] : dbProperty.users);
  const agent: PropertyAgent | undefined = dbAgent
    ? {
        name: dbAgent.full_name || "Agent",
        agency: "Agency", // You may want to add agency to users table
        avatar: dbAgent.avatar_url
          ? { uri: dbAgent.avatar_url }
          : require("../assets/images/white_villa.jpg"),
        phone: dbAgent.phone || undefined,
        email: dbAgent.email || undefined,
        user_type: dbAgent.user_type || undefined,
      }
    : undefined;

  // Convert UUID to a stable numeric ID for frontend compatibility
  const numericId =
    dbProperty.id && typeof dbProperty.id === "string"
      ? parseInt(dbProperty.id.replace(/-/g, "").substring(0, 8), 16)
      : typeof dbProperty.id === "number"
        ? dbProperty.id
        : Math.floor(Math.random() * 1000000);

  return {
    id: numericId,
    uuid: dbProperty.id,
    title: dbProperty.title || "Sans titre",
    location: dbProperty.quartier
      ? `${dbProperty.quartier}, ${dbProperty.city || "Ouagadougou"}`
      : (dbProperty as any).location || "Ouagadougou",
    address: dbProperty.address || "",
    price: (dbProperty.price || 0).toString(),
    bedrooms: dbProperty.bedrooms || 0,
    bathrooms: dbProperty.bathrooms || 0,
    area: (dbProperty.area || 0).toString(),
    parking: dbProperty.parking_spaces || 0,
    period:
      dbProperty.period === "month" || dbProperty.period === "Mois"
        ? "Mois"
        : undefined,
    image: propertyImage,
    images: images.length > 0 ? images : undefined,
    category,
    isSponsored: !!dbProperty.is_boosted,
    status: dbProperty.status || "en_attente",
    propertyType:
      propertyTypeMap[dbProperty.property_type] ||
      (dbProperty as any).propertyType ||
      "Résidence",
    description: dbProperty.description || "",
    amenities:
      dbProperty.amenities?.map((a: any) =>
        typeof a === "string" ? a : a.name || ""
      ) || [],
    agent,
    deposit: dbProperty.caution_mois || (dbProperty as any).deposit,
    prohibitions: dbProperty.interdictions || (dbProperty as any).prohibitions,
    slots_filled: dbProperty.slots_filled || 0,
    slot_limit: dbProperty.slot_limit || 0,
    created_at: dbProperty.created_at,
    openHouseSlots: dbProperty.open_house_slots?.map((s: any) => ({
      id: s.id,
      date: s.date,
      startTime: s.start_time,
      endTime: s.end_time,
      capacity: s.capacity,
    })),
    published_at: dbProperty.published_at || undefined,
    is_locked: dbProperty.status === "locked",
  };
}

/**
 * Fetch all active properties with their images and amenities
 * Only returns properties with status 'en_ligne' (online/active)
 */
export async function fetchActiveProperties(): Promise<Property[]> {
  try {
    // Fetch properties with status 'en_ligne' (online/active)
    const { data: properties, error: propertiesError } = await supabase
      .from("properties")
      .select(
        `
        *,
        property_images (
          id,
          url,
          width,
          height,
          is_primary
        ),
        property_amenities (
          amenities (
            name,
            icon
          )
        ),
        users:agent_id (
          id,
          full_name,
          avatar_url,
          phone,
          email,
          user_type
        )
      `
      )
      .eq("status", "en_ligne")
      .order("created_at", { ascending: false });

    if (propertiesError) {
      console.error(
        "Error fetching properties:",
        JSON.stringify(propertiesError)
      );
      throw new Error(
        `Failed to fetch properties: ${
          propertiesError.message || "Unknown error"
        }`
      );
    }

    if (!properties || properties.length === 0) {
      return [];
    }

    // Transform and sort: Sponsored first, then by created_at (already ordered by query)
    const transformedProperties: Property[] = properties.map((prop: any) => {
      // Flatten images array
      const images = prop.property_images || [];

      // Flatten amenities array
      const amenities =
        prop.property_amenities
          ?.map((pa: any) => pa.amenities)
          .filter(Boolean) || [];

      // Get agent info
      const agent = Array.isArray(prop.users) ? prop.users[0] : prop.users;

      return transformProperty({
        ...prop,
        images,
        amenities,
        agent,
      });
    });

    return transformedProperties.sort((a, b) => {
      if (a.isSponsored && !b.isSponsored) return -1;
      if (!a.isSponsored && b.isSponsored) return 1;
      return 0;
    });
  } catch (error) {
    console.error("Error in fetchActiveProperties:", error);
    throw error;
  }
}

/**
 * Fetch a single property by ID with all details
 */
export async function fetchPropertyById(
  propertyId: string
): Promise<Property | null> {
  try {
    const { data: property, error } = await supabase
      .from("properties")
      .select(
        `
        *,
        property_images (
          id,
          url,
          width,
          height,
          is_primary
        ),
        property_amenities (
          amenities (
            name,
            icon
          )
        ),
        users:agent_id (
          id,
          full_name,
          avatar_url,
          phone,
          email,
          user_type
        ),
        open_house_slots (
          id,
          date,
          start_time,
          end_time,
          capacity
        )
      `
      )
      .eq("id", propertyId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching property:", error);
      return null;
    }

    if (!property) {
      return null;
    }

    // Flatten images array
    const images = property.property_images || [];

    // Flatten amenities array
    const amenities =
      property.property_amenities
        ?.map((pa: any) => pa.amenities)
        .filter(Boolean) || [];

    // Get agent info
    const agent = Array.isArray(property.users)
      ? property.users[0]
      : property.users;

    return transformProperty({
      ...property,
      images,
      amenities,
      agent,
    });
  } catch (error) {
    console.error("Error in fetchPropertyById:", error);
    return null;
  }
}

/**
 * Fetch properties with optional filters
 */
export interface PropertyFilters {
  category?: "Residential" | "Business";
  city?: string;
  quartier?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  property_type?: string;
}

export async function fetchPropertiesWithFilters(
  filters?: PropertyFilters
): Promise<Property[]> {
  try {
    let query = supabase
      .from("properties")
      .select(
        `
        *,
        property_images (
          id,
          url,
          width,
          height,
          is_primary
        ),
        property_amenities (
          amenities (
            name,
            icon
          )
        ),
        users:agent_id (
          id,
          full_name,
          avatar_url,
          phone,
          email,
          user_type
        )
      `
      )
      .eq("status", "en_ligne");

    // Apply filters
    if (filters?.city) {
      query = query.eq("city", filters.city);
    }

    if (filters?.quartier) {
      query = query.eq("quartier", filters.quartier);
    }

    if (filters?.minPrice) {
      query = query.gte("price", filters.minPrice);
    }

    if (filters?.maxPrice) {
      query = query.lte("price", filters.maxPrice);
    }

    if (filters?.bedrooms) {
      query = query.eq("bedrooms", filters.bedrooms);
    }

    if (filters?.bathrooms) {
      query = query.eq("bathrooms", filters.bathrooms);
    }

    if (filters?.property_type) {
      query = query.eq("property_type", filters.property_type);
    }

    const { data: properties, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching filtered properties:", error);
      throw new Error(`Failed to fetch properties: ${error.message}`);
    }

    if (!properties || properties.length === 0) {
      return [];
    }

    // Transform and sort: Sponsored first
    const transformedProperties: (Property | null)[] = properties.map(
      (prop: any) => {
        const images = prop.property_images || [];
        const amenities =
          prop.property_amenities
            ?.map((pa: any) => pa.amenities)
            .filter(Boolean) || [];
        const agent = Array.isArray(prop.users) ? prop.users[0] : prop.users;

        const transformed = transformProperty({
          ...prop,
          images,
          amenities,
          agent,
        });

        // Apply category filter if specified
        if (filters?.category && transformed.category !== filters.category) {
          return null;
        }

        return transformed;
      }
    );

    return (transformedProperties.filter(Boolean) as Property[]).sort(
      (a, b) => {
        if (a.isSponsored && !b.isSponsored) return -1;
        if (!a.isSponsored && b.isSponsored) return 1;
        return 0;
      }
    );
  } catch (error) {
    console.error("Error in fetchPropertiesWithFilters:", error);
    throw error;
  }
}

/**
 * Increment the views count for a property
 * Uses an RPC function for atomic increment
 */
export async function incrementPropertyViews(
  propertyId: string
): Promise<void> {
  try {
    const { error } = await supabase.rpc("increment_property_views", {
      property_uuid: propertyId,
    });

    if (error) {
      console.warn("Error incrementing views:", error.message);
      // Non-critical - views tracking shouldn't break the app
    }
  } catch (error) {
    console.warn("Error in incrementPropertyViews:", error);
    // Non-critical, don't throw
  }
}

/**
 * Fetch all properties belonging to a specific agent (user)
 * Queries by clerk_id instead of user UUID
 */
export async function fetchUserProperties(
  clerkId: string
): Promise<Property[]> {
  try {
    const { data: properties, error } = await supabase
      .from("properties")
      .select(
        `
        *,
        property_images (
          id,
          url,
          width,
          height,
          is_primary
        ),
        property_amenities (
          amenities (
            name,
            icon
          )
        ),
        users:agent_id!inner (
          id,
          full_name,
          avatar_url,
          phone,
          email,
          clerk_id
        )
      `
      )
      .eq("users.clerk_id", clerkId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user properties:", error);
      throw new Error(`Failed to fetch your properties: ${error.message}`);
    }

    if (!properties || properties.length === 0) {
      return [];
    }

    // Transform the data structure
    return properties.map((prop: any) => {
      // Flatten images array
      const images = prop.property_images || [];

      // Flatten amenities array
      const amenities =
        prop.property_amenities
          ?.map((pa: any) => pa.amenities)
          .filter(Boolean) || [];

      // Get agent info (aliased as 'users' in query)
      const agent = Array.isArray(prop.users) ? prop.users[0] : prop.users;

      return transformProperty({
        ...prop,
        images,
        amenities,
        agent,
      });
    });
  } catch (error) {
    console.error("Error in fetchUserProperties:", error);
    throw error;
  }
}

/**
 * Fetch all transactions related to a property via the backend API
 * This bypasses RLS issues by using the service role on the backend
 */
export async function fetchPropertyTransactions(
  propertyId: string,
  clerkToken: string
): Promise<any[]> {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  try {
    const response = await fetch(
      `${API_URL}/api/payments/property/${propertyId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clerkToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch property transactions:", response.status);
      return [];
    }

    const data = await response.json();
    return data.transactions || [];
  } catch (error) {
    console.error("Error in fetchPropertyTransactions:", error);
    return [];
  }
}
