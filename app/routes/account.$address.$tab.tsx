import {createFileRoute} from "@tanstack/react-router";
import {loadAccountPagePrefetch} from "../api/prefetchEntityPages";
import AccountPage from "../pages/Account/Index";

// Primary route for account with tab in path
export const Route = createFileRoute("/account/$address/$tab")({
  // Prefetch layout + first-tab data without blocking the skeleton page
  loader: ({params, context, location}) =>
    loadAccountPagePrefetch({
      address: params.address,
      queryClient: context.queryClient,
      search: location.search,
    }),
  component: AccountPage,
});
