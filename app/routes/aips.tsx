import {createFileRoute, redirect} from "@tanstack/react-router";

// Legacy redirect: `/aips` was promoted into a sub-tab of `/releases`.
// Keep links and bookmarks working by forwarding to the matching tab.
export const Route = createFileRoute("/aips")({
  beforeLoad: ({search}) => {
    const searchParams = search as {network?: string};
    throw redirect({
      to: "/releases/$tab",
      params: {tab: "aips"},
      search: searchParams?.network
        ? {network: searchParams.network}
        : undefined,
    });
  },
  component: () => null,
});
