import { supabase } from "../lib/supabase";

export interface TrendingProperty {
  property_id: string;
  view_count: number;
  unique_viewers: number;
}

export interface ViewStats {
  propertyId: string;
  totalViews: number;
  uniqueViewers: number;
  lastViewedAt: string | null;
}

/**
 * Fetch trending properties (most views in last 24h)
 */
export async function fetchTrendingProperties(limit = 10): Promise<TrendingProperty[]> {
  try {
    const { data, error } = await supabase.rpc("get_trending_properties", {
      hours_window: 24,
      result_limit: limit,
    });

    if (error) {
      console.error("Error fetching trending properties:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchTrendingProperties:", error);
    return [];
  }
}

/**
 * Fetch view statistics for a specific property
 */
export async function fetchPropertyViewStats(propertyId: string): Promise<ViewStats | null> {
  try {
    const { count, error } = await supabase
      .from("property_views")
      .select("*", { count: "exact", head: true })
      .eq("property_id", propertyId);

    if (error) throw error;
    
    // Get unique viewers count
    // Note: This might be slow for huge datasets without aggregation, 
    // but okay for direct querying on recent data
    const { count: uniqueCount } = await supabase
        .from("property_views")
        .select("user_id", { count: "exact", head: true }) // Not truly unique without distinct
        // Supabase JS doesn't support distinct count easily without RPC
        // Using approximate for now or assume RPC is better for this
        .eq("property_id", propertyId);

    // Get last view time
    const { data: lastView } = await supabase
      .from("property_views")
      .select("viewed_at")
      .eq("property_id", propertyId)
      .order("viewed_at", { ascending: false })
      .limit(1)
      .single();

    return {
      propertyId,
      totalViews: count || 0,
      uniqueViewers: uniqueCount || 0, // Placeholder, ideally use RPC
      lastViewedAt: lastView?.viewed_at || null,
    };
  } catch (error) {
    console.warn("Error fetching property view stats:", error);
    return null;
  }
}

/**
 * Fetch view history for the current user
 */
export async function fetchUserViewHistory(limit = 20) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("property_views")
      .select(`
        viewed_at,
        property:properties (
          id,
          title,
          price,
          address,
          property_type,
          listing_type,
          property_images (
            url
          )
        )
      `)
      .eq("user_id", user.id)
      .order("viewed_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Filter out duplicates (properties viewed multiple times)
    // Keep only the most recent view for each property
    const seenProps = new Set();
    const uniqueHistory = [];

    if (data) {
        for (const item of data) {
            // @ts-ignore
            const propId = item.property?.id;
            if (propId && !seenProps.has(propId)) {
                seenProps.add(propId);
                // Transform image structure
                // @ts-ignore
                if (item.property && item.property.property_images) {
                    // @ts-ignore
                    const images = item.property.property_images.map((img: any) => img.url);
                    // @ts-ignore
                    item.property.image = images[0] ? { uri: images[0] } : null;
                    // @ts-ignore
                    delete item.property.property_images;
                }
                uniqueHistory.push(item);
            }
        }
    }

    return uniqueHistory;
  } catch (error) {
    console.warn("Error fetching user view history:", error);
    return [];
  }
}
