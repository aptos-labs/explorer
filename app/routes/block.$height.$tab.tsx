import {createFileRoute, redirect} from "@tanstack/react-router";

// Backward compatibility: redirect /block/:height/:tab to /block/:height?tab=:tab
export const Route = createFileRoute("/block/$height/$tab")({
  beforeLoad: ({params}) => {
    throw redirect({
      to: "/block/$height",
      params: {height: params.height},
      search: {tab: params.tab},
    });
  },
  component: () => null,
});
