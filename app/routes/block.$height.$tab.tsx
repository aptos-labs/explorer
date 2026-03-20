import {createFileRoute} from "@tanstack/react-router";
import {getClientFromSearch, getNetworkFromSearch} from "../api/createClient";
import {blockQueryOptions} from "../api/queries";
import {PagePending} from "../components/NavigationPending";
import {networks} from "../constants";
import BlockPage from "../pages/Block/Index";

// Primary route for block with tab in path
export const Route = createFileRoute("/block/$height/$tab")({
  // Prefetch block data during navigation for faster perceived load
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
        blockQueryOptions(params.height, client, networkValue),
      );
    } catch {
      // Swallow prefetch errors so that block-specific error UI can handle them
      // during normal query usage instead of triggering the router error boundary.
    }

    return {};
  },
  pendingComponent: PagePending,
  component: BlockPage,
});
