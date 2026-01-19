/**
 * useNetworkStatus Hook
 * 
 * Monitors network connectivity and provides status information.
 * Uses @react-native-community/netinfo under the hood.
 */

import { useEffect, useState, useCallback } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

export interface NetworkStatus {
  /** Whether the device is connected to the internet */
  isConnected: boolean;
  /** Whether the connection type (wifi, cellular, etc.) */
  type: string | null;
  /** Whether the connection is expensive (cellular data) */
  isExpensive: boolean;
  /** Whether we're currently checking the status */
  isChecking: boolean;
  /** Manually refresh the network status */
  refresh: () => Promise<void>;
}

/**
 * Hook to monitor network connectivity status
 * 
 * @returns Network status information
 * 
 * @example
 * ```typescript
 * const { isConnected, type } = useNetworkStatus();
 * 
 * if (!isConnected) {
 *   return <OfflineBanner />;
 * }
 * ```
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<{
    isConnected: boolean;
    type: string | null;
    isExpensive: boolean;
    isChecking: boolean;
  }>({
    isConnected: true, // Assume connected initially
    type: null,
    isExpensive: false,
    isChecking: true,
  });

  const handleNetworkChange = useCallback((state: NetInfoState) => {
    setStatus({
      isConnected: state.isConnected ?? true,
      type: state.type,
      isExpensive: state.details?.isConnectionExpensive ?? false,
      isChecking: false,
    });
  }, []);

  const refresh = useCallback(async () => {
    setStatus((prev) => ({ ...prev, isChecking: true }));
    try {
      const state = await NetInfo.fetch();
      handleNetworkChange(state);
    } catch (error) {
      console.warn("Error fetching network status:", error);
      setStatus((prev) => ({ ...prev, isChecking: false }));
    }
  }, [handleNetworkChange]);

  useEffect(() => {
    // Initial fetch
    NetInfo.fetch().then(handleNetworkChange);

    // Subscribe to changes
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

    return () => {
      unsubscribe();
    };
  }, [handleNetworkChange]);

  return {
    ...status,
    refresh,
  };
}

/**
 * Simple hook that just returns whether online
 */
export function useIsOnline(): boolean {
  const { isConnected } = useNetworkStatus();
  return isConnected;
}

export default useNetworkStatus;
