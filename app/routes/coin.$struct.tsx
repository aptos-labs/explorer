import {createFileRoute, redirect} from "@tanstack/react-router";

// Redirect /coin/:struct to /coin/:struct/info (default tab)
// Also handles backward compatibility: /coin/:struct?tab=xxx -> /coin/:struct/xxx
export const Route = createFileRoute("/coin/$struct")({
  beforeLoad: ({params, search}) => {
    const searchParams = search as {tab?: string};
    // If there's a tab query param, redirect to path-based route
    if (searchParams?.tab) {
      throw redirect({
        to: "/coin/$struct/$tab",
        params: {struct: params.struct, tab: searchParams.tab},
      });
    }
    // Default: redirect to "info" tab
    throw redirect({
      to: "/coin/$struct/$tab",
      params: {struct: params.struct, tab: "info"},
    });
  },
  component: () => null,
});
