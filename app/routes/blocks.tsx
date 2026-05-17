import {createFileRoute} from "@tanstack/react-router";
import {getClientFromSearch, getNetworkFromSearch} from "../api/createClient";
import {
  ledgerInfoQueryOptions,
  recentBlocksQueryOptions,
} from "../api/queries";
import {PagePending} from "../components/NavigationPending";
import {networks} from "../constants";
import BlocksPage from "../pages/Blocks/Index";

const BLOCKS_COUNT = 20;

export const Route = createFileRoute("/blocks")({
  // Pre-fetch ledger info + the most-recent blocks on the server so the
  // first paint is fully populated, and so the CDN can amortize the
  // ~20 REST calls across all simultaneous users via the `s-maxage=60`
  // SSR cache header in `app/ssr.tsx`.
  loader: async ({context, location}) => {
    const {queryClient} = context;
    const search = Object.fromEntries(
      new URLSearchParams(location.search),
    ) as Record<string, string>;
    const client = getClientFromSearch(search);
    const networkName = getNetworkFromSearch(search);
    const networkValue = networks[networkName];

    try {
      const ledger = await queryClient.ensureQueryData(
        ledgerInfoQueryOptions(client, networkValue, 60 * 1000),
      );
      const startStr = search?.start;
      const start = startStr ? parseInt(startStr, 10) : NaN;
      const blockHeight = Number.isFinite(start)
        ? start
        : parseInt(ledger.block_height, 10);
      if (Number.isFinite(blockHeight)) {
        await queryClient.ensureQueryData(
          recentBlocksQueryOptions(
            client,
            networkValue,
            blockHeight,
            BLOCKS_COUNT,
          ),
        );
      }
    } catch {
      // Loader failures should not block the page; the client will refetch.
    }
    return {};
  },
  pendingComponent: PagePending,
  component: BlocksPage,
});
