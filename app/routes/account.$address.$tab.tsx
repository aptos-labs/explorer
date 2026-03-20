import {createFileRoute} from "@tanstack/react-router";
import {getClientFromSearch, getNetworkFromSearch} from "../api/createClient";
import {accountResourcesQueryOptions} from "../api/queries";
import {PagePending} from "../components/NavigationPending";
import {networks} from "../constants";
import AccountPage from "../pages/Account/Index";

// Primary route for account with tab in path
export const Route = createFileRoute("/account/$address/$tab")({
  // Prefetch account data during navigation for faster perceived load
  loader: async ({params, context, location}) => {
    const {queryClient} = context;
    const search = Object.fromEntries(
      new URLSearchParams(location.search),
    ) as Record<string, string>;
    const client = getClientFromSearch(search);
    const networkName = getNetworkFromSearch(search);
    const networkValue = networks[networkName];

    await queryClient.ensureQueryData(
      accountResourcesQueryOptions(params.address, client, networkValue),
    );

    return {networkName};
  },
  pendingComponent: PagePending,
  component: AccountPage,
});
