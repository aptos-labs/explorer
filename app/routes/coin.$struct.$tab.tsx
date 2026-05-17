import {createFileRoute} from "@tanstack/react-router";
import {getClientFromSearch, getNetworkFromSearch} from "../api/createClient";
import {accountResourceQueryOptions} from "../api/queries";
import {PagePending} from "../components/NavigationPending";
import {networks} from "../constants";
import CoinPage from "../pages/Coin/Index";
import {isValidStruct} from "../pages/utils";

// Primary route for coin with tab in path
export const Route = createFileRoute("/coin/$struct/$tab")({
  // Pre-fetch the coin's `0x1::coin::CoinInfo<struct>` resource (the primary
  // first-paint data) on the server so the CDN can amortize the fetch across
  // simultaneous users. The page also reads coin list, supply, and paired-FA
  // info; those are loaded client-side because they hit external APIs or
  // multiple view functions.
  loader: async ({params, context, location}) => {
    const {queryClient} = context;

    if (!isValidStruct(params.struct)) {
      // Invalid struct — let the page render its own error UI.
      return {};
    }

    const search = Object.fromEntries(
      new URLSearchParams(location.search),
    ) as Record<string, string>;
    const client = getClientFromSearch(search);
    const networkName = getNetworkFromSearch(search);
    const networkValue = networks[networkName];
    const address = params.struct.split("::")[0];

    try {
      await queryClient.ensureQueryData(
        accountResourceQueryOptions(
          address,
          `0x1::coin::CoinInfo<${params.struct}>`,
          client,
          networkValue,
        ),
      );
    } catch {
      // Swallow pre-fetch errors; the page renders its own loading/error UI.
    }

    return {};
  },
  pendingComponent: PagePending,
  component: CoinPage,
});
