import {createFileRoute, redirect} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import TransactionPage from "../pages/Transaction/Index";
import {prefetchTransactionData} from "../pages/Transaction/transactionRouteLoader";
import {isOverviewTab} from "../pages/Transaction/transactionTabMeta";

// Route for a transaction with an explicit tab segment in the path.
export const Route = createFileRoute("/txn/$txnHashOrVersion/$tab")({
  beforeLoad: ({params, search}) => {
    // Overview views have no URL segment — collapse any legacy
    // `/txn/:id/<type>Overview` (or `/unknown`) link to the canonical base path.
    if (isOverviewTab(params.tab)) {
      const searchParams = search as {network?: string};
      throw redirect({
        to: "/txn/$txnHashOrVersion",
        params: {txnHashOrVersion: params.txnHashOrVersion},
        search: searchParams?.network
          ? {network: searchParams.network}
          : undefined,
      });
    }
  },
  // Prefetch transaction data during navigation for faster perceived load.
  loader: async ({params, context, location}) => {
    const {queryClient} = context;
    return prefetchTransactionData(
      params.txnHashOrVersion,
      queryClient,
      location.search as Record<string, string | undefined>,
    );
  },
  pendingComponent: PagePending,
  component: TransactionPage,
});
