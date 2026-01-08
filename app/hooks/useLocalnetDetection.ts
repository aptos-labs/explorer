import {useState, useEffect} from "react";
import {networks} from "../constants";

const LOCALNET_URL = networks.local;
const CHECK_INTERVAL = 30000; // Re-check every 30 seconds

/**
 * Hook to detect if a local Aptos node is running.
 * Only runs on the client side.
 */
export function useLocalnetDetection(): boolean {
  const [isLocalnetAvailable, setIsLocalnetAvailable] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

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
            return;
          }
        }
        setIsLocalnetAvailable(false);
      } catch {
        // Network error, localnet not running
        setIsLocalnetAvailable(false);
      }
    };

    // Initial check
    checkLocalnet();

    // Periodic re-check
    const interval = setInterval(checkLocalnet, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return isLocalnetAvailable;
}
