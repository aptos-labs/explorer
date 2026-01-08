import {createFileRoute, redirect} from "@tanstack/react-router";

// Redirect /fungible_asset/:address to /fungible_asset/:address/info (default tab)
// Also handles backward compatibility: /fungible_asset/:address?tab=xxx -> /fungible_asset/:address/xxx
export const Route = createFileRoute("/fungible_asset/$address")({
  beforeLoad: ({params, search}) => {
    const searchParams = search as {tab?: string};
    // If there's a tab query param, redirect to path-based route
    if (searchParams?.tab) {
      throw redirect({
        to: "/fungible_asset/$address/$tab",
        params: {address: params.address, tab: searchParams.tab},
      });
    }
    // Default: redirect to "info" tab
    throw redirect({
      to: "/fungible_asset/$address/$tab",
      params: {address: params.address, tab: "info"},
    });
  },
  component: () => null,
});
