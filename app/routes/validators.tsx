import {createFileRoute, redirect} from "@tanstack/react-router";

// Redirect /validators to /validators/all (default tab)
// Also handles backward compatibility: /validators?tab=xxx -> /validators/xxx
export const Route = createFileRoute("/validators")({
  beforeLoad: ({search}) => {
    const searchParams = search as {tab?: string};
    // If there's a tab query param, redirect to path-based route
    if (searchParams?.tab) {
      throw redirect({
        to: "/validators/$tab",
        params: {tab: searchParams.tab},
      });
    }
    // Default: redirect to "all" tab
    throw redirect({
      to: "/validators/$tab",
      params: {tab: "all"},
    });
  },
  component: () => null,
});
