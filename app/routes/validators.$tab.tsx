import {createFileRoute, redirect} from "@tanstack/react-router";

// Backward compatibility: redirect /validators/:tab to /validators?tab=:tab
export const Route = createFileRoute("/validators/$tab")({
  beforeLoad: ({params}) => {
    throw redirect({
      to: "/validators",
      search: {tab: params.tab},
    });
  },
  component: () => null,
});
