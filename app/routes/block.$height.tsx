import {createFileRoute, redirect} from "@tanstack/react-router";

// Redirect /block/:height to /block/:height/overview (default tab)
// Also handles backward compatibility: /block/:height?tab=xxx -> /block/:height/xxx
export const Route = createFileRoute("/block/$height")({
  beforeLoad: ({params, search}) => {
    const searchParams = search as {tab?: string};
    // If there's a tab query param, redirect to path-based route
    if (searchParams?.tab) {
      throw redirect({
        to: "/block/$height/$tab",
        params: {height: params.height, tab: searchParams.tab},
      });
    }
    // Default: redirect to "overview" tab
    throw redirect({
      to: "/block/$height/$tab",
      params: {height: params.height, tab: "overview"},
    });
  },
  component: () => null,
});
