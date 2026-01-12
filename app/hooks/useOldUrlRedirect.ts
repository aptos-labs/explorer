/**
 * Hook to redirect old subdomain-based URLs to the new query parameter format.
 *
 * Old format (2022): https://explorer.devnet.aptos.dev/path
 * New format: https://explorer.aptoslabs.com/path?network=devnet
 *
 * This provides backward compatibility for old bookmarks and links.
 */
import {useEffect} from "react";

// Mapping of old subdomains to network names
const OLD_DOMAIN_MAPPINGS: Record<string, string> = {
  // Old format: explorer.{network}.aptos.dev
  "explorer.devnet.aptos.dev": "devnet",
  "explorer.testnet.aptos.dev": "testnet",
  "explorer.mainnet.aptos.dev": "mainnet",
  // Also handle legacy aptos.dev domains without "explorer" prefix
  "devnet.aptos.dev": "devnet",
  "testnet.aptos.dev": "testnet",
  "mainnet.aptos.dev": "mainnet",
};

// The canonical domain to redirect to
const CANONICAL_DOMAIN = "explorer.aptoslabs.com";

/**
 * Hook that redirects old subdomain-based URLs to the new query parameter format.
 * Should be called once in the root layout component.
 *
 * This handles cases where users have old bookmarks like:
 * - https://explorer.devnet.aptos.dev/account/0x1
 * - https://explorer.testnet.aptos.dev/txn/12345
 *
 * And redirects them to:
 * - https://explorer.aptoslabs.com/account/0x1?network=devnet
 * - https://explorer.aptoslabs.com/txn/12345?network=testnet
 */
export function useOldUrlRedirect(): void {
  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    const hostname = window.location.hostname.toLowerCase();

    // Check if we're on an old domain that needs redirecting
    const networkName = OLD_DOMAIN_MAPPINGS[hostname];
    if (!networkName) return;

    // Build the new URL
    const newUrl = new URL(window.location.href);
    newUrl.hostname = CANONICAL_DOMAIN;
    newUrl.protocol = "https:";
    newUrl.port = "";

    // Add or update the network parameter
    // Don't override if there's already a network param (user explicitly set it)
    if (!newUrl.searchParams.has("network")) {
      newUrl.searchParams.set("network", networkName);
    }

    // Redirect to the new URL
    window.location.replace(newUrl.toString());
  }, []);
}
