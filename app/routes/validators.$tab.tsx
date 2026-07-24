import {createFileRoute} from "@tanstack/react-router";
import {getClientFromSearch, getNetworkFromSearch} from "../api/createClient";
import {accountResourceQueryOptions} from "../api/queries";
import {PagePending} from "../components/NavigationPending";
import {networks} from "../constants";
import ValidatorsPage from "../pages/Validators/Index";

// Primary route for validators with tab in path
export const Route = createFileRoute("/validators/$tab")({
  // Pre-fetch the `0x1::stake::ValidatorSet` resource on the server so the
  // table can render the active validator list at first paint. The off-chain
  // stats JSON (GCS) is left for the client; the GCS bucket is publicly
  // readable so users can fetch it directly without a rate-limit cost on
  // the Aptos Gateway.
  loader: async ({context, location}) => {
    const {queryClient} = context;
    const search = Object.fromEntries(
      new URLSearchParams(location.search),
    ) as Record<string, string>;
    const client = getClientFromSearch(search);
    const networkName = getNetworkFromSearch(search);
    const networkValue = networks[networkName];

    try {
      await queryClient.ensureQueryData(
        accountResourceQueryOptions(
          "0x1",
          "0x1::stake::ValidatorSet",
          client,
          networkValue,
        ),
      );
    } catch {
      // Pre-fetch failures fall through to client-side fetching.
    }
    return {};
  },
  pendingComponent: PagePending,
  component: ValidatorsPage,
});
