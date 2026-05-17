import {createFileRoute} from "@tanstack/react-router";
import {getClientFromSearch, getNetworkFromSearch} from "../api/createClient";
import {ledgerInfoQueryOptions} from "../api/queries";
import {PagePending} from "../components/NavigationPending";
import {networks} from "../constants";
import TransactionsPage from "../pages/Transactions/Index";

export const Route = createFileRoute("/transactions")({
  // Pre-fetch ledger info on the server so the "latest version" pagination
  // anchor is known at first paint. Shared `useGetLedgerInfo` polling takes
  // over on the client.
  loader: async ({context, location}) => {
    const {queryClient} = context;
    const search = Object.fromEntries(
      new URLSearchParams(location.search),
    ) as Record<string, string>;
    const client = getClientFromSearch(search);
    const networkName = getNetworkFromSearch(search);
    const networkValue = networks[networkName];

    try {
      // Match the staleTime used by `useGetLedgerInfo` so the hook does not
      // immediately refetch after hydration.
      await queryClient.ensureQueryData(
        ledgerInfoQueryOptions(client, networkValue, 10 * 1000),
      );
    } catch {
      // SSR pre-fetch failures should not block the page — the client will
      // retry the same query via `useGetLedgerInfo`.
    }
    return {};
  },
  pendingComponent: PagePending,
  component: TransactionsPage,
});
