import {createFileRoute} from "@tanstack/react-router";
import {getClientFromSearch, getNetworkFromSearch} from "../api/createClient";
import {accountResourcesQueryOptions} from "../api/queries";
import {PagePending} from "../components/NavigationPending";
import {networks} from "../constants";
import AccountPage from "../pages/Account/Index";

// Primary route for object with tab in path
export const Route = createFileRoute("/object/$address/$tab")({
  // Pre-fetch account resources so the page can render without a client-side
  // round-trip — mirrors the `/account/$address/$tab` loader (objects share
  // the same page component as accounts).
  loader: async ({params, context, location}) => {
    const {queryClient} = context;
    const search = Object.fromEntries(
      new URLSearchParams(location.search),
    ) as Record<string, string>;
    const client = getClientFromSearch(search);
    const networkName = getNetworkFromSearch(search);
    const networkValue = networks[networkName];

    try {
      await queryClient.ensureQueryData(
        accountResourcesQueryOptions(params.address, client, networkValue),
      );
    } catch {
      // The page renders its own error UI for non-existent objects.
    }
    return {networkName};
  },
  pendingComponent: PagePending,
  component: ObjectPage,
});

function ObjectPage() {
  // Render AccountPage with isObject=true to handle object-specific behavior
  return <AccountPage isObject={true} />;
}
