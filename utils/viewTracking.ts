/**
 * View Tracking Utility
 * 
 * Tracks property views using AsyncStorage with TTL (Time To Live).
 * Prevents duplicate view counts within a 30-minute window.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import { Platform } from 'react-native';

const VIEW_STORAGE_KEY = "roogo_property_views";
const DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface ViewRecord {
  propertyId: string;
  timestamp: number;
}

interface ViewStorage {
  views: ViewRecord[];
}

/**
 * Get all stored view records, filtering out expired ones
 */
async function getStoredViews(): Promise<ViewRecord[]> {
  try {
    const data = await AsyncStorage.getItem(VIEW_STORAGE_KEY);
    if (!data) return [];
    
    const parsed: ViewStorage = JSON.parse(data);
    const now = Date.now();
    
    // Filter out expired records
    const validViews = parsed.views.filter(
      (view) => now - view.timestamp < DEFAULT_TTL_MS
    );
    
    // If we filtered some out, save the cleaned data
    if (validViews.length !== parsed.views.length) {
      await saveStoredViews(validViews);
    }
    
    return validViews;
  } catch (error) {
    console.warn("Error reading view tracking data:", error);
    return [];
  }
}

/**
 * Save view records to storage
 */
async function saveStoredViews(views: ViewRecord[]): Promise<void> {
  try {
    const data: ViewStorage = { views };
    await AsyncStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Error saving view tracking data:", error);
  }
}

/**
 * Check if we should increment the view count for a property.
 * Returns true if the property hasn't been viewed within the TTL window.
 * 
 * @param propertyId - The UUID of the property
 * @returns true if view should be incremented, false if already viewed recently
 */
export async function shouldIncrementView(propertyId: string): Promise<boolean> {
  const views = await getStoredViews();
  const existingView = views.find((v) => v.propertyId === propertyId);
  
  if (existingView) {
    // Check if the view has expired
    const now = Date.now();
    if (now - existingView.timestamp < DEFAULT_TTL_MS) {
      // View is still within TTL, don't increment
      return false;
    }
  }
  
  return true;
}

/**
 * Mark a property as viewed with the current timestamp.
 * Call this after successfully incrementing the view count.
 * 
 * @param propertyId - The UUID of the property
 */
export async function markPropertyViewed(propertyId: string): Promise<void> {
  const views = await getStoredViews();
  const now = Date.now();
  
  // Remove existing record for this property if any
  const filteredViews = views.filter((v) => v.propertyId !== propertyId);
  
  // Add new record
  filteredViews.push({
    propertyId,
    timestamp: now,
  });
  
  await saveStoredViews(filteredViews);
}

/**
 * Clear all view tracking data.
 * Useful for testing or when user logs out.
 */
export async function clearViewTracking(): Promise<void> {
  try {
    await AsyncStorage.removeItem(VIEW_STORAGE_KEY);
  } catch (error) {
    console.warn("Error clearing view tracking data:", error);
  }
}

/**
 * Get the count of tracked views (for debugging)
 */
export async function getViewCount(): Promise<number> {
  const views = await getStoredViews();
  return views.length;
}

interface ViewEventParams {
    propertyId: string;
    userId: string | null;
    clerkId: string | null;
    source?: 'browse' | 'search' | 'share_link' | 'notification';
    coordinates?: { latitude: number; longitude: number } | null;
    city?: string | null;
}

export async function recordViewEvent({
    propertyId,
    userId,
    clerkId,
    source = 'browse',
    coordinates,
    city
}: ViewEventParams): Promise<void> {
    try {
      // Insert into property_views table
      const { error } = await supabase.from('property_views').insert({
          property_id: propertyId,
          user_id: userId,
          clerk_id: clerkId,
          device_platform: Platform.OS,
          source,
          viewer_latitude: coordinates?.latitude,
          viewer_longitude: coordinates?.longitude,
          viewer_city: city
      });
      
      if (error) {
        // Just log warning, don't crash app for analytics
        // console.warn("Error recording view event:", error.message);
      }
    } catch {
      // console.warn("Error recording view event:", err);
    }
}

// Helper to get user location (request permission first)
export async function getUserLocation(): Promise<{
    coords: { latitude: number; longitude: number } | null;
    city: string | null;
}> {
    try {
        const { status } = await Location.getForegroundPermissionsAsync();
        
        if (status !== 'granted') {
            return { coords: null, city: null };
        }
        
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low // Low accuracy is fine for analytics
        });
        
        // Optionally reverse geocode for city name
        let city: string | null = null;
        try {
            const [place] = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });
            city = place?.city || place?.subregion || null;
        } catch {
            // Ignore geocoding errors
        }

        return {
            coords: { latitude: location.coords.latitude, longitude: location.coords.longitude },
            city
        };
    } catch {
        return { coords: null, city: null };
    }
}
