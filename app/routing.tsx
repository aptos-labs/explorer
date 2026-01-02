/**
 * Routing utilities for TanStack Router
 * Re-exports from TanStack Router for backward compatibility
 */

import {
  useSearch,
  useNavigate as useTanStackNavigate,
} from "@tanstack/react-router";

// Re-export commonly used routing utilities from TanStack Router
export {Link, useNavigate, useSearch, useParams} from "@tanstack/react-router";

/**
 * Compatibility hook for useSearchParams (react-router-dom style)
 * Returns a tuple of [searchParams, setSearchParams]
 */
export function useSearchParams(): [
  URLSearchParams,
  (params: Record<string, string | undefined>) => void,
] {
  const search = useSearch({strict: false}) as Record<
    string,
    string | undefined
  >;
  const navigate = useTanStackNavigate();

  // Convert search object to URLSearchParams
  const searchParams = new URLSearchParams();
  if (search) {
    Object.entries(search).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value);
      }
    });
  }

  // Function to update search params
  const setSearchParams = (params: Record<string, string | undefined>) => {
    const newSearch = {...search};
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        delete newSearch[key];
      } else {
        newSearch[key] = value;
      }
    });
    navigate({search: newSearch as Record<string, string>});
  };

  return [searchParams, setSearchParams];
}

// Valid route prefixes for navigation
export type RoutePrefix =
  | "account"
  | "txn"
  | "block"
  | "validator"
  | "coin"
  | "fungible_asset"
  | "token"
  | "object";

/**
 * Build a route path for the given prefix and value
 */
export function buildPath(prefix: RoutePrefix, value: string): string {
  return `/${prefix}/${encodeURIComponent(value)}`;
}

/**
 * Parse a route path and extract the prefix and value
 */
export function parsePath(
  path: string,
): {prefix: RoutePrefix; value: string} | null {
  const match = path.match(/^\/(\w+)\/(.+)$/);
  if (!match) return null;

  const [, prefix, value] = match;
  const validPrefixes: RoutePrefix[] = [
    "account",
    "txn",
    "block",
    "validator",
    "coin",
    "fungible_asset",
    "token",
    "object",
  ];

  if (validPrefixes.includes(prefix as RoutePrefix)) {
    return {prefix: prefix as RoutePrefix, value: decodeURIComponent(value)};
  }

  return null;
}

/**
 * Helper hook to augment a "to" path with global search params.
 * This is a placeholder that can be enhanced to preserve network params.
 */
export function useAugmentToWithGlobalSearchParams() {
  // For now, just return the path as-is
  return (to: string) => to;
}
