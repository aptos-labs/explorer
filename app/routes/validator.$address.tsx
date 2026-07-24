import {createFileRoute} from "@tanstack/react-router";
import {getClientFromSearch, getNetworkFromSearch} from "../api/createClient";
import {accountResourceQueryOptions} from "../api/queries";
import {PagePending} from "../components/NavigationPending";
import {networks} from "../constants";
import ValidatorPage from "../pages/DelegatoryValidator/index";
import {tryStandardizeAddress} from "../utils";

export const Route = createFileRoute("/validator/$address")({
  // Pre-fetch the validator's `0x1::stake::StakePool` resource and the
  // shared `0x1::stake::ValidatorSet` so the validator detail card has
  // everything it needs at first paint.
  loader: async ({params, context, location}) => {
    const {queryClient} = context;
    const search = Object.fromEntries(
      new URLSearchParams(location.search),
    ) as Record<string, string>;
    const client = getClientFromSearch(search);
    const networkName = getNetworkFromSearch(search);
    const networkValue = networks[networkName];
    const addressHex = tryStandardizeAddress(params.address) ?? params.address;

    try {
      await Promise.all([
        queryClient.ensureQueryData(
          accountResourceQueryOptions(
            addressHex,
            "0x1::stake::StakePool",
            client,
            networkValue,
          ),
        ),
        queryClient.ensureQueryData(
          accountResourceQueryOptions(
            "0x1",
            "0x1::stake::ValidatorSet",
            client,
            networkValue,
          ),
        ),
      ]);
    } catch {
      // The page renders its own error UI.
    }
    return {};
  },
  pendingComponent: PagePending,
  component: ValidatorPage,
});
