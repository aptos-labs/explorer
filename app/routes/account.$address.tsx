import {createFileRoute, redirect} from "@tanstack/react-router";

// Redirect /account/:address to /account/:address/transactions (default tab)
// Also handles backward compatibility: /account/:address?tab=xxx -> /account/:address/xxx
export const Route = createFileRoute("/account/$address")({
  beforeLoad: ({params, search}) => {
    const searchParams = search as {tab?: string; modulesTab?: string};
    // If there's a tab query param, redirect to path-based route
    if (searchParams?.tab) {
      throw redirect({
        to: "/account/$address/$tab",
        params: {address: params.address, tab: searchParams.tab},
        search: searchParams.modulesTab
          ? {modulesTab: searchParams.modulesTab}
          : undefined,
      });
    }
    // If there's a modulesTab query param, redirect to modules tab
    if (searchParams?.modulesTab) {
      throw redirect({
        to: "/account/$address/$tab",
        params: {address: params.address, tab: "modules"},
        search: {modulesTab: searchParams.modulesTab},
      });
    }
    // Default: redirect to "transactions" tab
    throw redirect({
      to: "/account/$address/$tab",
      params: {address: params.address, tab: "transactions"},
    });
  },
  component: () => null,
});
