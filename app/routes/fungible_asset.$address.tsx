import {createFileRoute, Outlet, redirect} from "@tanstack/react-router";

const VALID_TABS = new Set(["info", "holders"]);

// Layout route for /fungible_asset/:address/*
// Handles backward compatibility redirects from query params to path-based tabs
export const Route = createFileRoute("/fungible_asset/$address")({
  beforeLoad: ({params, search, location}) => {
    const searchParams = search as {tab?: string; network?: string};

    const pathSegments = location.pathname.split("/").filter(Boolean);
    const isExactMatch = pathSegments.length === 2; // ["fungible_asset", "address"]

    // Redirect removed "transactions" tab → info
    if (pathSegments.length === 3 && !VALID_TABS.has(pathSegments[2])) {
      throw redirect({
        to: "/fungible_asset/$address/$tab",
        params: {address: params.address, tab: "info"},
        search: searchParams?.network
          ? {network: searchParams.network}
          : undefined,
      });
    }

    // If there's a tab query param, redirect to path-based route
    if (searchParams?.tab) {
      const tab = VALID_TABS.has(searchParams.tab) ? searchParams.tab : "info";
      throw redirect({
        to: "/fungible_asset/$address/$tab",
        params: {address: params.address, tab},
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
