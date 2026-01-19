/**
 * Cache Utility
 * 
 * Generic caching layer using AsyncStorage with TTL (Time To Live) support.
 * Implements a "cache-first, network-refresh" pattern for offline support.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_PREFIX = "roogo_cache_";

/**
 * Structure stored in cache
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

/**
 * Cache configuration options
 */
export interface CacheOptions {
  /** Time to live in milliseconds (default: 5 minutes) */
  ttl?: number;
  /** Whether to return stale data if refresh fails (default: true) */
  staleWhileRevalidate?: boolean;
}

/**
 * Default TTL values for different data types (in milliseconds)
 */
export const CacheTTL = {
  /** Properties list - 5 minutes */
  PROPERTIES_LIST: 5 * 60 * 1000,
  /** User's own properties - 2 minutes */
  USER_PROPERTIES: 2 * 60 * 1000,
  /** Single property details - 10 minutes */
  PROPERTY_DETAIL: 10 * 60 * 1000,
  /** User favorites - 1 minute */
  FAVORITES: 1 * 60 * 1000,
  /** User profile - 5 minutes */
  USER_PROFILE: 5 * 60 * 1000,
} as const;

/**
 * Cache keys for consistent naming
 */
export const CacheKeys = {
  ACTIVE_PROPERTIES: `${CACHE_PREFIX}properties:active`,
  userProperties: (userId: string) => `${CACHE_PREFIX}properties:user:${userId}`,
  propertyDetail: (propertyId: string) => `${CACHE_PREFIX}property:${propertyId}`,
  userFavorites: (userId: string) => `${CACHE_PREFIX}favorites:${userId}`,
  userProfile: (userId: string) => `${CACHE_PREFIX}profile:${userId}`,
} as const;

/**
 * Get cached data
 * 
 * @param key - Cache key
 * @returns Cached data or null if not found/expired
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const rawData = await AsyncStorage.getItem(key);
    if (!rawData) return null;

    const entry: CacheEntry<T> = JSON.parse(rawData);
    const now = Date.now();

    // Check if cache has expired
    if (now - entry.timestamp > entry.ttl) {
      // Cache expired, remove it
      await AsyncStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.warn("Cache read error:", error);
    return null;
  }
}

/**
 * Get cached data even if expired (for stale-while-revalidate pattern)
 * 
 * @param key - Cache key
 * @returns Object with data and whether it's stale
 */
export async function getCachedWithStale<T>(key: string): Promise<{
  data: T | null;
  isStale: boolean;
}> {
  try {
    const rawData = await AsyncStorage.getItem(key);
    if (!rawData) return { data: null, isStale: false };

    const entry: CacheEntry<T> = JSON.parse(rawData);
    const now = Date.now();
    const isStale = now - entry.timestamp > entry.ttl;

    return { data: entry.data, isStale };
  } catch (error) {
    console.warn("Cache read error:", error);
    return { data: null, isStale: false };
  }
}

/**
 * Set cached data
 * 
 * @param key - Cache key
 * @param data - Data to cache
 * @param ttlMs - Time to live in milliseconds
 */
export async function setCache<T>(
  key: string,
  data: T,
  ttlMs: number = CacheTTL.PROPERTIES_LIST
): Promise<void> {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.warn("Cache write error:", error);
  }
}

/**
 * Invalidate (remove) cached data
 * 
 * @param key - Cache key to invalidate
 */
export async function invalidateCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn("Cache invalidation error:", error);
  }
}

/**
 * Invalidate all cached data with a given prefix
 * 
 * @param prefix - Key prefix to match
 */
export async function invalidateCacheByPrefix(prefix: string): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const keysToRemove = allKeys.filter((key) => key.startsWith(prefix));
    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
    }
  } catch (error) {
    console.warn("Cache prefix invalidation error:", error);
  }
}

/**
 * Clear all app cache
 */
export async function clearAllCache(): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((key) => key.startsWith(CACHE_PREFIX));
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch (error) {
    console.warn("Clear cache error:", error);
  }
}

/**
 * Get cache statistics (for debugging)
 */
export async function getCacheStats(): Promise<{
  totalKeys: number;
  totalSize: number;
  keys: string[];
}> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((key) => key.startsWith(CACHE_PREFIX));
    
    let totalSize = 0;
    for (const key of cacheKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        totalSize += value.length;
      }
    }

    return {
      totalKeys: cacheKeys.length,
      totalSize,
      keys: cacheKeys,
    };
  } catch (error) {
    console.warn("Get cache stats error:", error);
    return { totalKeys: 0, totalSize: 0, keys: [] };
  }
}

/**
 * Fetch with cache - combines cache lookup and network fetch
 * Implements stale-while-revalidate pattern
 * 
 * @param key - Cache key
 * @param fetchFn - Function to fetch fresh data
 * @param options - Cache options
 * @returns Cached or fresh data
 */
export async function fetchWithCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { ttl = CacheTTL.PROPERTIES_LIST, staleWhileRevalidate = true } = options;

  // Try to get cached data
  const { data: cachedData, isStale } = await getCachedWithStale<T>(key);

  // If we have valid (non-stale) cached data, return it
  if (cachedData && !isStale) {
    return cachedData;
  }

  try {
    // Fetch fresh data
    const freshData = await fetchFn();
    
    // Cache the fresh data
    await setCache(key, freshData, ttl);
    
    return freshData;
  } catch (error) {
    // If fetch fails and we have stale data, return it (stale-while-revalidate)
    if (staleWhileRevalidate && cachedData) {
      console.warn("Using stale cache data due to fetch error:", error);
      return cachedData;
    }
    
    // No stale data to fall back on, rethrow
    throw error;
  }
}

/**
 * Prefetch and cache data in the background
 * Useful for preloading data that might be needed soon
 * 
 * @param key - Cache key
 * @param fetchFn - Function to fetch data
 * @param ttl - Time to live
 */
export async function prefetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CacheTTL.PROPERTIES_LIST
): Promise<void> {
  try {
    // Check if we already have valid cache
    const cached = await getCached<T>(key);
    if (cached) return; // Already cached

    // Fetch and cache in background
    const data = await fetchFn();
    await setCache(key, data, ttl);
  } catch (error) {
    // Prefetch failures are silent
    console.warn("Prefetch error:", error);
  }
}
