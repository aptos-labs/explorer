import {createFileRoute, Outlet, redirect} from "@tanstack/react-router";

// Layout route for /coin/:struct/*
// Handles backward compatibility redirects from query params to path-based tabs
export const Route = createFileRoute("/coin/$struct")({
  beforeLoad: ({params, search, location}) => {
    const searchParams = search as {tab?: string; network?: string};

    // Check if we're on the exact /coin/:struct path (no child route)
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const isExactMatch = pathSegments.length === 2; // ["coin", "struct"]

    // If there's a tab query param, redirect to path-based route
    if (searchParams?.tab) {
      throw redirect({
        to: "/coin/$struct/$tab",
        params: {struct: params.struct, tab: searchParams.tab},
        search: searchParams.network
          ? {network: searchParams.network}
          : undefined,
      });
    }
    // Default: redirect to "info" tab only if on exact path
    if (isExactMatch) {
      throw redirect({
        to: "/coin/$struct/$tab",
        params: {struct: params.struct, tab: "info"},
        search: searchParams?.network
          ? {network: searchParams.network}
          : undefined,
      });
    }
  },
  component: () => <Outlet />,
});
