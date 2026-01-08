/**
 * Hook to redirect hash-based tab URLs to path-based URLs.
 * e.g., /txn/123#events → /txn/123/events
 *
 * This provides backward compatibility for old bookmarks/links that used
 * hash-based tab navigation.
 */
import {useEffect} from "react";
import {useLocation} from "@tanstack/react-router";
import {useNavigate} from "../routing";

// Valid tabs for each route pattern
const ROUTE_TABS: Record<string, Set<string>> = {
  // /account/:address and /object/:address
  "/account/": new Set([
    "transactions",
    "coins",
    "tokens",
    "multisig",
    "resources",
    "modules",
    "info",
  ]),
  "/object/": new Set([
    "transactions",
    "coins",
    "tokens",
    "resources",
    "modules",
    "info",
  ]),
  // /txn/:hashOrVersion
  "/txn/": new Set([
    "userTxnOverview",
    "blockMetadataOverview",
    "blockEpilogueOverview",
    "stateCheckpointOverview",
    "pendingTxnOverview",
    "genesisTxnOverview",
    "validatorTxnOverview",
    "balanceChange",
    "events",
    "payload",
    "changes",
  ]),
  // /token/:tokenId
  "/token/": new Set(["overview", "activities"]),
  // /block/:height
  "/block/": new Set(["overview", "transactions"]),
  // /coin/:struct
  "/coin/": new Set(["info", "holders", "transactions"]),
  // /fungible_asset/:address
  "/fungible_asset/": new Set(["info", "holders", "transactions"]),
  // /validators
  "/validators": new Set(["all", "delegation", "enhanced_delegation"]),
};

/**
 * Find the route pattern that matches the current pathname
 */
function findMatchingRoute(pathname: string): string | null {
  for (const routePrefix of Object.keys(ROUTE_TABS)) {
    if (pathname.startsWith(routePrefix)) {
      return routePrefix;
    }
  }
  return null;
}

/**
 * Check if a hash value is a valid tab for the given route
 */
function isValidTabForRoute(routePrefix: string, hash: string): boolean {
  const validTabs = ROUTE_TABS[routePrefix];
  return validTabs ? validTabs.has(hash) : false;
}

/**
 * Hook that redirects hash-based tab URLs to path-based URLs.
 * Should be called once in the root layout component.
 */
export function useHashToPathRedirect(): void {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    const hash = window.location.hash.slice(1); // Remove leading #
    if (!hash) return;

    const pathname = location.pathname;
    const routePrefix = findMatchingRoute(pathname);

    if (!routePrefix) return;

    // Check if the hash is a valid tab for this route
    if (!isValidTabForRoute(routePrefix, hash)) return;

    // Check if we're already on a path with a tab segment
    // e.g., /txn/123/events should not redirect again
    const pathSegments = pathname.split("/").filter(Boolean);

    // For most routes, if there are already 3+ segments, a tab is already in the path
    // /txn/123/events = ["txn", "123", "events"]
    // /txn/123 = ["txn", "123"]
    // /validators/all = ["validators", "all"]
    const isValidatorsRoute = routePrefix === "/validators";
    const minSegmentsForTab = isValidatorsRoute ? 2 : 3;

    if (pathSegments.length >= minSegmentsForTab) {
      // Already has a tab in path, just clear the hash
      window.history.replaceState(null, "", pathname + window.location.search);
      return;
    }

    // Build the new path with tab
    const newPath = isValidatorsRoute
      ? `/validators/${hash}`
      : `${pathname}/${hash}`;

    // Parse existing search params into an object
    const searchParamsObj: Record<string, string> = {};
    const urlSearchParams = new URLSearchParams(window.location.search);
    urlSearchParams.forEach((value, key) => {
      searchParamsObj[key] = value;
    });

    // Navigate to path-based URL, replacing history entry
    // Pass search as object so our custom useNavigate can preserve network
    navigate({
      to: newPath,
      search:
        Object.keys(searchParamsObj).length > 0 ? searchParamsObj : undefined,
      replace: true,
    });
  }, [location.pathname, navigate]);
}
