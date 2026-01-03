import {createFileRoute, redirect} from "@tanstack/react-router";

// Backward compatibility: redirect /coin/:struct/:tab to /coin/:struct?tab=:tab
export const Route = createFileRoute("/coin/$struct/$tab")({
  beforeLoad: ({params}) => {
    throw redirect({
      to: "/coin/$struct",
      params: {struct: params.struct},
      search: {tab: params.tab},
    });
  },
  component: () => null,
});
