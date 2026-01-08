import {createFileRoute, Outlet, redirect} from "@tanstack/react-router";

// Layout route for /block/:height/*
// Handles backward compatibility redirects from query params to path-based tabs
export const Route = createFileRoute("/block/$height")({
  beforeLoad: ({params, search, location}) => {
    const searchParams = search as {tab?: string; network?: string};

    // Check if we're on the exact /block/:height path (no child route)
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const isExactMatch = pathSegments.length === 2; // ["block", "height"]

    // If there's a tab query param, redirect to path-based route
    if (searchParams?.tab) {
      throw redirect({
        to: "/block/$height/$tab",
        params: {height: params.height, tab: searchParams.tab},
        search: searchParams.network
          ? {network: searchParams.network}
          : undefined,
      });
    }
    // Default: redirect to "overview" tab only if on exact path
    if (isExactMatch) {
      throw redirect({
        to: "/block/$height/$tab",
        params: {height: params.height, tab: "overview"},
        search: searchParams?.network
          ? {network: searchParams.network}
          : undefined,
      });
    }
  },
  component: () => <Outlet />,
});
