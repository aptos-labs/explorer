import {createFileRoute} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import TransactionPage from "../pages/Transaction/Index";
import {prefetchTransactionData} from "../pages/Transaction/transactionRouteLoader";

// Canonical transaction route: `/txn/:txnHashOrVersion` renders the per-type
// Overview without an explicit tab segment in the URL.
export const Route = createFileRoute("/txn/$txnHashOrVersion/")({
  loader: async ({params, context, location}) => {
    const {queryClient} = context;
    return prefetchTransactionData(
      params.txnHashOrVersion,
      queryClient,
      location.search,
    );
  },
  pendingComponent: PagePending,
  component: TransactionPage,
});
