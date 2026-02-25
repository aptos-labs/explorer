import {useEffect, useState} from "react";
import {networks} from "../constants";

const LOCALNET_URL = networks.local;
const CHECK_INTERVAL = 30000; // Re-check every 30 seconds

interface LocalnetDetectionResult {
  isAvailable: boolean;
  isChecked: boolean; // True after initial check completes
}

interface UseLocalnetDetectionOptions {
  /**
   * Whether to actively check for localnet availability.
   * When false, the hook will not make any network requests.
   * Defaults to false to avoid prompting users about local device connections
   * unless they explicitly select the local network.
   */
  enabled?: boolean;
}

/**
 * Hook to detect if a local Aptos node is running.
 * Only runs on the client side and only when enabled.
 * Returns both availability status and whether the initial check has completed.
 *
 * @param options.enabled - Whether to actively check for localnet. Defaults to false.
 */
export function useLocalnetDetection(
  options: UseLocalnetDetectionOptions = {},
): LocalnetDetectionResult {
  const {enabled = false} = options;
  const [isLocalnetAvailable, setIsLocalnetAvailable] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    // Only run on client and when enabled
    if (typeof window === "undefined" || !enabled) {
      return;
    }

    const checkLocalnet = async () => {
      try {
        // Try to fetch the ledger info from localnet
        const response = await fetch(LOCALNET_URL, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          // Short timeout to avoid blocking
          signal: AbortSignal.timeout(2000),
        });

        if (response.ok) {
          const data = await response.json();
          // Check if it looks like a valid Aptos node response
          if (data && data.chain_id !== undefined) {
            setIsLocalnetAvailable(true);
            setIsChecked(true);
            return;
          }
        }
        setIsLocalnetAvailable(false);
        setIsChecked(true);
      } catch {
        // Network error, localnet not running
        setIsLocalnetAvailable(false);
        setIsChecked(true);
      }
    };

    // Initial check
    checkLocalnet();

    // Periodic re-check
    const interval = setInterval(checkLocalnet, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [enabled]);

  // When not enabled, return unchecked state (checking hasn't started)
  // This is fine because the LocalnetUnavailableModal only shows the modal
  // when networkName === "local" (which enables this hook), so the returned
  // values when disabled don't affect the modal display.
  if (!enabled) {
    return {isAvailable: false, isChecked: false};
  }

  return {isAvailable: isLocalnetAvailable, isChecked};
}
