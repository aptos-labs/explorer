import {createFileRoute, Outlet, redirect} from "@tanstack/react-router";

// Layout route for /validators/*
// Handles backward compatibility redirects from query params to path-based tabs
export const Route = createFileRoute("/validators")({
  beforeLoad: ({search, location}) => {
    const searchParams = search as {tab?: string; network?: string};

    // Check if we're on the exact /validators path (no child route)
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const isExactMatch = pathSegments.length === 1; // ["validators"]

    // If there's a tab query param, redirect to path-based route
    if (searchParams?.tab) {
      throw redirect({
        to: "/validators/$tab",
        params: {tab: searchParams.tab},
        search: searchParams.network
          ? {network: searchParams.network}
          : undefined,
      });
    }
    // Default: redirect to "all" tab only if on exact path
    if (isExactMatch) {
      throw redirect({
        to: "/validators/$tab",
        params: {tab: "all"},
        search: searchParams?.network
          ? {network: searchParams.network}
          : undefined,
      });
    }
  },
  component: () => <Outlet />,
});
