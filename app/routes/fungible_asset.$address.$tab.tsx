import {createFileRoute, redirect} from "@tanstack/react-router";

// Backward compatibility: redirect /fungible_asset/:address/:tab to /fungible_asset/:address?tab=:tab
export const Route = createFileRoute("/fungible_asset/$address/$tab")({
  beforeLoad: ({params}) => {
    throw redirect({
      to: "/fungible_asset/$address",
      params: {address: params.address},
      search: {tab: params.tab},
    });
  },
  component: () => null,
});
