import { supabase } from "../lib/supabase";
import type { Property, PropertyAgent } from "../constants/properties";
import { normalizeInterdiction } from "../utils/interdictions";

export interface PropertyImage {
  id: string;
  url: string;
  width: number;
  height: number;
  is_primary: boolean;
}

export interface PropertyAmenity {
  name: string;
  icon: string;
}

export interface DatabaseProperty {
  id: string;
  agent_id: string;
  title: string;
  description: string | null;
  price: number;
  listing_type: "louer" | "vendre";
  property_type: "villa" | "appartement" | "maison" | "terrain" | "commercial";
  status: "en_attente" | "en_ligne" | "expired";
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  parking_spaces: number | null;
  address: string;
  city: string;
  quartier: string;
  latitude: number | null;
  longitude: number | null;
  period: string | null;
  caution_mois: number | null;
  interdictions: string[] | null;
  slots_filled: number | null;
  slot_limit: number | null;
  created_at: string;
  updated_at: string;
  views_count: number;
  images?: PropertyImage[];
  amenities?: PropertyAmenity[];
  open_house_slots?: {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    capacity: number;
    bookings_count: number;
  }[];
  agent?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    email: string | null;
  };
}

/**
 * Transform database property to frontend Property type
 */
function transformProperty(dbProperty: DatabaseProperty): Property {
  // Get primary image or first image
  const primaryImage =
    dbProperty.images?.find((img) => img.is_primary) || dbProperty.images?.[0];

  // Convert all images to format expected by frontend
  const images = dbProperty.images?.map((img) => ({ uri: img.url })) || [];

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
  const agent: PropertyAgent | undefined = dbProperty.agent
    ? {
        name: dbProperty.agent.full_name || "Agent",
        agency: "Agency", // You may want to add agency to users table
        avatar: dbProperty.agent.avatar_url
          ? { uri: dbProperty.agent.avatar_url }
          : require("../assets/images/white_villa.jpg"),
        phone: dbProperty.agent.phone || undefined,
        email: dbProperty.agent.email || undefined,
      }
    : undefined;

  // Convert UUID to a stable numeric ID for frontend compatibility
  // Using first 8 characters of UUID (without dashes) converted to number
  const numericId = parseInt(
    dbProperty.id.replace(/-/g, "").substring(0, 8),
    16
  );

  return {
    id: numericId,
    uuid: dbProperty.id, // Store original UUID for API calls
    title: dbProperty.title,
    location: `${dbProperty.quartier}, ${dbProperty.city}`,
    address: dbProperty.address,
    price: dbProperty.price.toString(),
    bedrooms: dbProperty.bedrooms || 0,
    bathrooms: dbProperty.bathrooms || 0,
    area: dbProperty.area?.toString() || "0",
    parking: dbProperty.parking_spaces || 0,
    period: dbProperty.period === "month" ? "Mois" : undefined,
    image: primaryImage
      ? { uri: primaryImage.url }
      : require("../assets/images/white_villa.jpg"),
    images: images.length > 0 ? images : undefined,
    category,
    isSponsored: false, // You can add a sponsored field to the database if needed
    status: dbProperty.status,
    propertyType: propertyTypeMap[dbProperty.property_type] || "Résidence",
    description: dbProperty.description || "",
    amenities: dbProperty.amenities?.map((a) => a.name) || [],
    agent,
    deposit: dbProperty.caution_mois || undefined,
    prohibitions:
      dbProperty.interdictions?.map((int) => normalizeInterdiction(int)) ||
      undefined,
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
          email
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

    // Transform the data structure
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

    return transformedProperties;
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
          email
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
      .single();

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
          email
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

    // Transform the data
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

    return transformedProperties.filter(Boolean) as Property[];
  } catch (error) {
    console.error("Error in fetchPropertiesWithFilters:", error);
    throw error;
  }
}

/**
 * Fetch all properties belonging to a specific agent (user)
 */
export async function fetchUserProperties(userId: string): Promise<Property[]> {
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
        users:agent_id (
          id,
          full_name,
          avatar_url,
          phone,
          email
        )
      `
      )
      .eq("agent_id", userId)
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
      const images = prop.property_images || [];
      const amenities =
        prop.property_amenities
          ?.map((pa: any) => pa.amenities)
          .filter(Boolean) || [];
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
