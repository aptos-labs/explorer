import {createFileRoute} from "@tanstack/react-router";
import {getClientFromSearch, getNetworkFromSearch} from "../api/createClient";
import {viewFunctionQueryOptions} from "../api/queries";
import {PagePending} from "../components/NavigationPending";
import {networks} from "../constants";
import FAPage from "../pages/FungibleAsset/Index";
import {isValidAccountAddress} from "../pages/utils";

// Primary route for fungible asset with tab in path
export const Route = createFileRoute("/fungible_asset/$address/$tab")({
  // Pre-fetch the FA metadata + supply view functions on the server. These
  // are the two view calls every FA detail page makes immediately; cached
  // on the edge via `s-maxage` they amortize across all simultaneous users.
  loader: async ({params, context, location}) => {
    const {queryClient} = context;

    if (!isValidAccountAddress(params.address)) {
      return {};
    }

    const search = Object.fromEntries(
      new URLSearchParams(location.search),
    ) as Record<string, string>;
    const client = getClientFromSearch(search);
    const networkName = getNetworkFromSearch(search);
    const networkValue = networks[networkName];

    try {
      await Promise.all([
        queryClient.ensureQueryData(
          viewFunctionQueryOptions(
            "0x1::fungible_asset::metadata",
            ["0x1::object::ObjectCore"],
            [params.address],
            client,
            networkValue,
            {gcTime: 30 * 60 * 1000, staleTime: 5 * 60 * 1000},
          ),
        ),
        queryClient.ensureQueryData(
          viewFunctionQueryOptions(
            "0x1::fungible_asset::supply",
            ["0x1::object::ObjectCore"],
            [params.address],
            client,
            networkValue,
          ),
        ),
      ]);
    } catch {
      // Swallow pre-fetch errors; the page renders its own loading/error UI.
    }

    return {};
  },
  pendingComponent: PagePending,
  component: FAPage,
});
