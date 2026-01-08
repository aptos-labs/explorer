import {createFileRoute, redirect} from "@tanstack/react-router";

// Redirect /object/:address to /object/:address/transactions (default tab)
// Also handles backward compatibility: /object/:address?tab=xxx -> /object/:address/xxx
export const Route = createFileRoute("/object/$address")({
  beforeLoad: ({params, search}) => {
    const searchParams = search as {tab?: string; modulesTab?: string};
    // If there's a tab query param, redirect to path-based route
    if (searchParams?.tab) {
      throw redirect({
        to: "/object/$address/$tab",
        params: {address: params.address, tab: searchParams.tab},
        search: searchParams.modulesTab
          ? {modulesTab: searchParams.modulesTab}
          : undefined,
      });
    }
    // If there's a modulesTab query param, redirect to modules tab
    if (searchParams?.modulesTab) {
      throw redirect({
        to: "/object/$address/$tab",
        params: {address: params.address, tab: "modules"},
        search: {modulesTab: searchParams.modulesTab},
      });
    }
    // Default: redirect to "transactions" tab
    throw redirect({
      to: "/object/$address/$tab",
      params: {address: params.address, tab: "transactions"},
    });
  },
  component: () => null,
});
