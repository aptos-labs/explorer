import {createFileRoute, redirect} from "@tanstack/react-router";

// Legacy redirect: `/deployments` was promoted into a sub-tab of `/releases`.
// Keep links and bookmarks working by forwarding to the matching tab.
export const Route = createFileRoute("/deployments")({
  beforeLoad: ({search}) => {
    const searchParams = search as {network?: string};
    throw redirect({
      to: "/releases/$tab",
      params: {tab: "networks"},
      search: searchParams?.network
        ? {network: searchParams.network}
        : undefined,
    });
  },
  component: () => null,
});
