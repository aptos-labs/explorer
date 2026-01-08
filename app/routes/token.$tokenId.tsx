import {createFileRoute, Outlet, redirect} from "@tanstack/react-router";

// Layout route for /token/:tokenId/*
// Handles backward compatibility redirects from query params to path-based tabs
export const Route = createFileRoute("/token/$tokenId")({
  beforeLoad: ({params, search, location}) => {
    const searchParams = search as {
      tab?: string;
      propertyVersion?: string;
      network?: string;
    };

    // Check if we're on the exact /token/:tokenId path (no child route)
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const isExactMatch = pathSegments.length === 2; // ["token", "tokenId"]

    // If there's a tab query param, redirect to path-based route
    if (searchParams?.tab) {
      throw redirect({
        to: "/token/$tokenId/$tab",
        params: {tokenId: params.tokenId, tab: searchParams.tab},
        search: {
          ...(searchParams.propertyVersion && {
            propertyVersion: searchParams.propertyVersion,
          }),
          ...(searchParams.network && {network: searchParams.network}),
        },
      });
    }
    // Default: redirect to "overview" tab only if on exact path
    if (isExactMatch) {
      throw redirect({
        to: "/token/$tokenId/$tab",
        params: {tokenId: params.tokenId, tab: "overview"},
        search: {
          ...(searchParams?.propertyVersion && {
            propertyVersion: searchParams.propertyVersion,
          }),
          ...(searchParams?.network && {network: searchParams.network}),
        },
      });
    }
  },
  component: () => <Outlet />,
});
