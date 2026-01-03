import {createFileRoute, redirect} from "@tanstack/react-router";

// Backward compatibility: redirect /account/:address/:tab to /account/:address?tab=:tab
export const Route = createFileRoute("/account/$address/$tab")({
  beforeLoad: ({params}) => {
    throw redirect({
      to: "/account/$address",
      params: {address: params.address},
      search: {tab: params.tab},
    });
  },
  component: () => null,
});
