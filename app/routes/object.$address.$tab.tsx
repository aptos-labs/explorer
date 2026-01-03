import {createFileRoute, redirect} from "@tanstack/react-router";

// Backward compatibility: redirect /object/:address/:tab to /object/:address?tab=:tab
export const Route = createFileRoute("/object/$address/$tab")({
  beforeLoad: ({params}) => {
    throw redirect({
      to: "/object/$address",
      params: {address: params.address},
      search: {tab: params.tab},
    });
  },
  component: () => null,
});
