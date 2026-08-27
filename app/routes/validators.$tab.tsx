import {createFileRoute, redirect} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import ValidatorsPage from "../pages/Validators/Index";
import {rewriteValidatorsTab} from "../utils/routeRedirects";

// Primary route for validators with tab in path
export const Route = createFileRoute("/validators/$tab")({
  beforeLoad: ({params, search}) => {
    const rewritten = rewriteValidatorsTab(params.tab);
    if (rewritten === params.tab) {
      return;
    }
    const searchParams = search as {network?: string};
    throw redirect({
      to: "/validators/$tab",
      params: {tab: rewritten},
      search: searchParams.network
        ? {network: searchParams.network}
        : undefined,
    });
  },
  pendingComponent: PagePending,
  component: ValidatorsPage,
});
