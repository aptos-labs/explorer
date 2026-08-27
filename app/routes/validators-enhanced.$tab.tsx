import {createFileRoute, redirect} from "@tanstack/react-router";
import {rewriteValidatorsTab} from "../utils/routeRedirects";

// Backward compatibility: redirect /validators-enhanced/:tab to /validators/:tab
export const Route = createFileRoute("/validators-enhanced/$tab")({
  beforeLoad: ({params, search}) => {
    const searchParams = search as {network?: string};

    throw redirect({
      to: "/validators/$tab",
      params: {tab: rewriteValidatorsTab(params.tab)},
      search: searchParams?.network
        ? {network: searchParams.network}
        : undefined,
    });
  },
  component: () => null,
});
