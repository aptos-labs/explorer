/**
 * Routing utilities for TanStack Router
 * Re-exports from TanStack Router for backward compatibility
 */

import React from "react";
import {styled} from "@mui/material/styles";
import {
  Link as TanStackLink,
  useSearch,
  useNavigate as useTanStackNavigate,
} from "@tanstack/react-router";

// Re-export hooks from TanStack Router
export {useNavigate, useSearch, useParams} from "@tanstack/react-router";

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
 * Supports common MUI Link props like color and sx
 */
export const Link = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof TanStackLink> & {
    color?: "inherit" | "primary" | "secondary" | "error" | string;
    underline?: "none" | "hover" | "always";
    sx?: React.CSSProperties;
  }
>(({children, onClick, color, sx, ...props}, ref) => {
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

  return (
    <StyledTanStackLink
      ref={ref}
      {...props}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(e);
      }}
      style={{...colorStyle, ...(sx as React.CSSProperties)}}
    >
      {children}
    </StyledTanStackLink>
  );
});

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
    // @ts-expect-error - TanStack Router's search type is complex
    navigate({search: newSearch});
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
