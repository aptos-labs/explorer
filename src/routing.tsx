import {Link as MuiLink} from "@mui/material";
import React from "react";
import {
  NavigateOptions,
  Link as RouterLink,
  useNavigate as useNavigateRaw,
  useSearchParams,
} from "react-router-dom";

const GLOBAL_PERSISTENT_SEARCH_PARAMS = ["network", "feature"];

// This is a wrapper around MuiLink that ensures that some global params stay persistent across all links
export const AugmentedLink = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => {
  const augmentToWithGlobalSearchParams = useAugmentToWithGlobalSearchParams();

  return (
    <MuiLink
      component={RouterLink}
      to={augmentToWithGlobalSearchParams(to as string)}
      style={{textDecoration: "none", color: "inherit"}}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {children}
    </MuiLink>
  );
};

// This is a wrapper around useNavigate that ensures that some global params stay persistent across all navs
// Concretely `network` and `feature` are treated as global persistent params
export function useNavigate() {
  const navigateRaw = useNavigateRaw();
  const normalizeTo = useAugmentToWithGlobalSearchParams();

  function navigate(to: string, options?: NavigateOptions): void;
  function navigate(to: number): void;
  function navigate(to: string | number, options?: NavigateOptions) {
    if (typeof to === "number") {
      return navigateRaw(to);
    }

    navigateRaw(normalizeTo(to), options);
  }

  return navigate;
}

export function useAugmentToWithGlobalSearchParams() {
  const [currentSearchParams] = useSearchParams();
  return function augmentToWithGlobalSearchParams(to: string) {
    const toUrl = new URL(to, window.location.origin);
    for (const param of GLOBAL_PERSISTENT_SEARCH_PARAMS) {
      if (!toUrl.searchParams.has(param) && currentSearchParams.has(param)) {
        toUrl.searchParams.set(param, currentSearchParams.get(param)!);
      }
    }
    return toUrl.pathname + toUrl.search + toUrl.hash;
  };
}
