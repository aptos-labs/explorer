import {createFileRoute, Outlet, redirect} from "@tanstack/react-router";

// Layout route for /fungible_asset/:address/*
// Handles backward compatibility redirects from query params to path-based tabs
export const Route = createFileRoute("/fungible_asset/$address")({
  beforeLoad: ({params, search, location}) => {
    const searchParams = search as {tab?: string; network?: string};

    // Check if we're on the exact /fungible_asset/:address path (no child route)
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const isExactMatch = pathSegments.length === 2; // ["fungible_asset", "address"]

    // If there's a tab query param, redirect to path-based route
    if (searchParams?.tab) {
      throw redirect({
        to: "/fungible_asset/$address/$tab",
        params: {address: params.address, tab: searchParams.tab},
        search: searchParams.network
          ? {network: searchParams.network}
          : undefined,
      });
    }
    // Default: redirect to "info" tab only if on exact path
    if (isExactMatch) {
      throw redirect({
        to: "/fungible_asset/$address/$tab",
        params: {address: params.address, tab: "info"},
        search: searchParams?.network
          ? {network: searchParams.network}
          : undefined,
      });
    }
  },
  component: () => <Outlet />,
});
