import {createFileRoute} from "@tanstack/react-router";
import {getClientFromSearch, getNetworkFromSearch} from "../api/createClient";
import {transactionQueryOptions} from "../api/queries";
import {PagePending} from "../components/NavigationPending";
import {networks} from "../constants";
import TransactionPage from "../pages/Transaction/Index";

// Primary route for transaction with tab in path
export const Route = createFileRoute("/txn/$txnHashOrVersion/$tab")({
  // Prefetch transaction data during navigation for faster perceived load
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
        transactionQueryOptions(params.txnHashOrVersion, client, networkValue),
      );
    } catch {
      // Ignore prefetch errors here so that transaction page-level error handling
      // (e.g., TransactionError) can handle query failures without triggering
      // the router error boundary. Optionally log for debugging:
      // console.error("Failed to prefetch transaction data", error);
    }

    return {networkName};
  },
  pendingComponent: PagePending,
  component: TransactionPage,
});
