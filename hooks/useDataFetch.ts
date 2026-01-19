/**
 * useDataFetch Hook
 * 
 * A reusable hook for fetching data with:
 * - Loading state management
 * - hasLoadedOnce tracking to prevent blank flash on tab switches
 * - Error handling
 * - Pull-to-refresh support
 * - Focus-based refetching
 */

import { useCallback, useRef, useState, DependencyList } from "react";
import { useFocusEffect } from "expo-router";

export interface UseDataFetchOptions {
  /** Whether to fetch on focus (default: true) */
  fetchOnFocus?: boolean;
  /** Whether to show loading only on first load (default: true) */
  showLoadingOnlyFirst?: boolean;
}

export interface UseDataFetchResult<T> {
  /** The fetched data */
  data: T | null;
  /** Whether initial loading is in progress */
  loading: boolean;
  /** Any error that occurred during fetch */
  error: Error | null;
  /** Whether a refresh is in progress */
  refreshing: boolean;
  /** Whether we've loaded data at least once */
  hasLoadedOnce: boolean;
  /** Function to manually trigger a refresh */
  refresh: () => void;
  /** Function to manually refetch (resets loading state) */
  refetch: () => void;
  /** Function to clear the data */
  clear: () => void;
}

/**
 * Custom hook for data fetching with standardized loading/error states
 * 
 * @param fetchFn - Async function that fetches the data
 * @param deps - Dependencies that trigger a refetch when changed
 * @param options - Configuration options
 * @returns Object containing data, loading states, and control functions
 * 
 * @example
 * ```typescript
 * const { data, loading, error, refresh, hasLoadedOnce } = useDataFetch(
 *   async () => fetchUserProperties(user.id),
 *   [user?.id],
 *   { fetchOnFocus: true }
 * );
 * 
 * // Only show loading spinner on first load
 * if (loading && !hasLoadedOnce) {
 *   return <LoadingSpinner />;
 * }
 * ```
 */
export function useDataFetch<T>(
  fetchFn: () => Promise<T>,
  deps: DependencyList = [],
  options: UseDataFetchOptions = {}
): UseDataFetchResult<T> {
  const { fetchOnFocus = true, showLoadingOnlyFirst = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Track if we've loaded data at least once to prevent blank flash on tab switches
  const hasLoadedOnce = useRef(false);
  // Track if a fetch is currently in progress to prevent duplicate requests
  const isFetching = useRef(false);

  const doFetch = useCallback(
    async (isRefresh: boolean = false) => {
      // Prevent duplicate simultaneous fetches
      if (isFetching.current) return;

      isFetching.current = true;

      try {
        // Only show loading spinner on first load (unless explicitly requested)
        if (!isRefresh && (!showLoadingOnlyFirst || !hasLoadedOnce.current)) {
          setLoading(true);
        }

        if (isRefresh) {
          setRefreshing(true);
        }

        setError(null);

        const result = await fetchFn();
        setData(result);
        hasLoadedOnce.current = true;
      } catch (err) {
        console.error("useDataFetch error:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
        setRefreshing(false);
        isFetching.current = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchFn, showLoadingOnlyFirst, ...deps]
  );

  // Fetch on focus if enabled
  useFocusEffect(
    useCallback(() => {
      if (fetchOnFocus) {
        doFetch(false);
      }
    }, [doFetch, fetchOnFocus])
  );

  // Manual refresh function for pull-to-refresh
  const refresh = useCallback(() => {
    doFetch(true);
  }, [doFetch]);

  // Manual refetch that resets the hasLoadedOnce flag
  const refetch = useCallback(() => {
    hasLoadedOnce.current = false;
    doFetch(false);
  }, [doFetch]);

  // Clear data function
  const clear = useCallback(() => {
    setData(null);
    setError(null);
    hasLoadedOnce.current = false;
  }, []);

  return {
    data,
    loading,
    error,
    refreshing,
    hasLoadedOnce: hasLoadedOnce.current,
    refresh,
    refetch,
    clear,
  };
}

/**
 * Simplified version that just handles the hasLoadedOnce pattern
 * Useful when you need more control over the fetch logic
 */
export function useLoadedOnce(): {
  hasLoadedOnce: boolean;
  markLoaded: () => void;
  reset: () => void;
} {
  const hasLoadedOnce = useRef(false);
  const [, forceUpdate] = useState({});

  const markLoaded = useCallback(() => {
    if (!hasLoadedOnce.current) {
      hasLoadedOnce.current = true;
      forceUpdate({});
    }
  }, []);

  const reset = useCallback(() => {
    hasLoadedOnce.current = false;
    forceUpdate({});
  }, []);

  return {
    hasLoadedOnce: hasLoadedOnce.current,
    markLoaded,
    reset,
  };
}

export default useDataFetch;
