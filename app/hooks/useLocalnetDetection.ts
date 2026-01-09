import {useState, useEffect} from "react";
import {networks} from "../constants";

const LOCALNET_URL = networks.localnet;
const CHECK_INTERVAL = 30000; // Re-check every 30 seconds

interface LocalnetDetectionResult {
  isAvailable: boolean;
  isChecked: boolean; // True after initial check completes
}

/**
 * Hook to detect if a local Aptos node is running.
 * Only runs on the client side.
 * Returns both availability status and whether the initial check has completed.
 */
export function useLocalnetDetection(): LocalnetDetectionResult {
  const [isLocalnetAvailable, setIsLocalnetAvailable] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    const checkLocalnet = async () => {
      try {
        // Try to fetch the ledger info from localnet
        // Use /v1/ with trailing slash as that's the standard Aptos API root endpoint
        const checkUrl = `${LOCALNET_URL}/`;
        const response = await fetch(checkUrl, {
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
  }, []);

  return {isAvailable: isLocalnetAvailable, isChecked};
}
