import {createFileRoute, Outlet, redirect} from "@tanstack/react-router";

// Layout route for /object/:address/*
// Handles backward compatibility redirects from query params to path-based tabs
export const Route = createFileRoute("/object/$address")({
  beforeLoad: ({params, search, location}) => {
    const searchParams = search as {
      tab?: string;
      modulesTab?: string;
      network?: string;
    };

    // Check if we're on the exact /object/:address path (no child route)
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const isExactMatch = pathSegments.length === 2; // ["object", "address"]

    // If there's a tab query param, redirect to path-based route
    if (searchParams?.tab) {
      throw redirect({
        to: "/object/$address/$tab",
        params: {address: params.address, tab: searchParams.tab},
        search: {
          ...(searchParams.modulesTab && {modulesTab: searchParams.modulesTab}),
          ...(searchParams.network && {network: searchParams.network}),
        },
      });
    }
    // If there's a modulesTab query param, redirect to modules tab
    if (searchParams?.modulesTab && isExactMatch) {
      throw redirect({
        to: "/object/$address/$tab",
        params: {address: params.address, tab: "modules"},
        search: {
          modulesTab: searchParams.modulesTab,
          ...(searchParams.network && {network: searchParams.network}),
        },
      });
    }
    // Default: redirect to "transactions" tab only if on exact path
    if (isExactMatch) {
      throw redirect({
        to: "/object/$address/$tab",
        params: {address: params.address, tab: "transactions"},
        search: searchParams?.network
          ? {network: searchParams.network}
          : undefined,
      });
    }
  },
  component: () => <Outlet />,
});
