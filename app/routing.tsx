/**
 * Routing utilities for TanStack Router
 * Re-exports from TanStack Router for backward compatibility
 */

import React from "react";
import {styled, SxProps, Theme} from "@mui/material/styles";
import Box from "@mui/material/Box";
import {
  Link as TanStackLink,
  useSearch,
  useNavigate as useTanStackNavigate,
} from "@tanstack/react-router";

// Re-export hooks from TanStack Router
export {useSearch, useParams} from "@tanstack/react-router";

/**
 * Hook to get the current network from search params.
 * Used internally to preserve network across navigation.
 */
function useCurrentNetwork(): string | undefined {
  const search = useSearch({strict: false}) as {network?: string};
  return search?.network;
}

/**
 * Custom useNavigate hook that preserves the network search param.
 * Uses a ref to avoid recreating the callback when network changes.
 */
export function useNavigate() {
  const tanstackNavigate = useTanStackNavigate();
  const currentNetwork = useCurrentNetwork();

  // Store current network in ref to avoid callback recreation
  const networkRef = React.useRef(currentNetwork);
  React.useEffect(() => {
    networkRef.current = currentNetwork;
  }, [currentNetwork]);

  return React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (options: any) => {
      const network = networkRef.current;

      // If there's a current network, preserve it
      if (network) {
        // Check if network is already in the `to` path string (e.g., "/path?network=decibel")
        const toPath = typeof options.to === "string" ? options.to : "";
        if (toPath.includes("network=")) {
          return tanstackNavigate(options);
        }

        // Check if network is already in the search object
        const existingSearch =
          typeof options.search === "object" ? options.search : {};
        const hasNetwork =
          existingSearch && "network" in (existingSearch as object);

        if (!hasNetwork) {
          return tanstackNavigate({
            ...options,
            search: {
              ...(existingSearch as object),
              network: network,
            },
          });
        }
      }
      return tanstackNavigate(options);
    },
    [tanstackNavigate],
  );
}

/**
 * Styled TanStack Router Link that matches MUI Link styling
 * Inherits color from parent, no underlines, proper font weight
 */
const StyledTanStackLink = styled(TanStackLink)({
  color: "inherit",
  textDecoration: "none",
  fontWeight: 400,
  "&:hover": {
    textDecoration: "none",
    opacity: 0.8,
  },
});

/**
 * Custom Link component that wraps TanStack Router's Link with MUI styling
 * Supports common MUI Link props like color and sx (including pseudo-selectors)
 * Automatically preserves the network search param across navigation
 */
export const Link = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof TanStackLink> & {
    color?: "inherit" | "primary" | "secondary" | "error" | string;
    underline?: "none" | "hover" | "always";
    sx?: SxProps<Theme>;
  }
>(({children, onClick, color, sx, search, to, ...props}, ref) => {
  const currentNetwork = useCurrentNetwork();

  // Check if `to` prop already contains network= (from useAugmentToWithGlobalSearchParams)
  const toStr = typeof to === "string" ? to : "";
  const toHasNetwork = toStr.includes("network=");

  // Merge current network into search params if not already specified
  // Using type assertion to bypass TanStack Router's strict search typing
  const mergedSearch = React.useMemo(() => {
    // Don't add network if it's already in the `to` path or if no current network
    if (!currentNetwork || toHasNetwork) return search;

    const existingSearch = typeof search === "object" ? search : {};
    const hasNetwork =
      existingSearch && "network" in (existingSearch as object);

    if (hasNetwork) return search;

    return {
      ...(existingSearch as object),
      network: currentNetwork,
    } as unknown as typeof search;
  }, [search, currentNetwork, toHasNetwork]);

  const colorStyle =
    color === "primary"
      ? {color: "var(--mui-palette-primary-main)"}
      : color === "secondary"
        ? {color: "var(--mui-palette-secondary-main)"}
        : color === "error"
          ? {color: "var(--mui-palette-error-main)"}
          : color && color !== "inherit"
            ? {color}
            : {};

  // If sx prop is provided with complex styles (like pseudo-selectors), wrap in Box
  if (
    sx &&
    typeof sx === "object" &&
    Object.keys(sx).some((k) => k.startsWith("&"))
  ) {
    // Ensure children is not a function (TanStack Router allows function children)
    const resolvedChildren = typeof children === "function" ? null : children;
    return (
      <Box
        component={StyledTanStackLink}
        ref={ref}
        to={to}
        search={mergedSearch}
        {...props}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          if (onClick) onClick(e as React.MouseEvent<HTMLAnchorElement>);
        }}
        sx={{
          ...colorStyle,
          textDecoration: "none",
          ...(sx as object),
        }}
      >
        {resolvedChildren}
      </Box>
    );
  }

  return (
    <StyledTanStackLink
      ref={ref}
      to={to}
      search={mergedSearch}
      {...props}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(e);
      }}
      style={{...colorStyle, ...((sx as React.CSSProperties) || {})}}
    >
      {children}
    </StyledTanStackLink>
  );
});

/**
 * Compatibility hook for useSearchParams (react-router-dom style)
 * Returns a tuple of [searchParams, setSearchParams]
 * Automatically preserves the network search param
 */
export function useSearchParams(): [
  URLSearchParams,
  (
    params: URLSearchParams | Record<string, string | undefined>,
    options?: {replace?: boolean},
  ) => void,
] {
  const search = useSearch({strict: false}) as Record<
    string,
    string | undefined
  >;
  const navigate = useTanStackNavigate();
  const currentNetwork = useCurrentNetwork();

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
  const setSearchParams = React.useCallback(
    (
      params: URLSearchParams | Record<string, string | undefined>,
      options?: {replace?: boolean},
    ) => {
      // Convert URLSearchParams to object if needed
      const paramsObj: Record<string, string | undefined> =
        params instanceof URLSearchParams
          ? Object.fromEntries(params.entries())
          : params;

      const newSearch: Record<string, string | undefined> = {};
      Object.entries(paramsObj).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          newSearch[key] = value;
        }
      });

      // Preserve network param if not explicitly set
      if (currentNetwork && !("network" in newSearch)) {
        newSearch.network = currentNetwork;
      }

      // Navigate with search params - using type assertion for TanStack Router compatibility
      // The search type is dynamically typed based on route definitions, but we need generic support
      navigate({
        search: newSearch as unknown as Parameters<
          typeof navigate
        >[0]["search"],
        replace: options?.replace,
      });
    },
    [navigate, currentNetwork],
  );

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
 * Preserves the network param in the URL query string.
 */
export function useAugmentToWithGlobalSearchParams() {
  const currentNetwork = useCurrentNetwork();

  return React.useCallback(
    (to: string) => {
      if (!currentNetwork) return to;

      // Check if the path already has query params
      const hasQuery = to.includes("?");
      const separator = hasQuery ? "&" : "?";

      // Check if network is already in the path
      if (to.includes("network=")) return to;

      return `${to}${separator}network=${encodeURIComponent(currentNetwork)}`;
    },
    [currentNetwork],
  );
}
