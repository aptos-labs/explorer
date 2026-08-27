import {createFileRoute} from "@tanstack/react-router";
import {loadTransactionPagePrefetch} from "../api/prefetchEntityPages";
import TransactionPage from "../pages/Transaction/Index";

// Primary route for transaction with tab in path
export const Route = createFileRoute("/txn/$txnHashOrVersion/$tab")({
  // Prefetch the transaction without blocking the skeleton page
  loader: ({params, context, location}) =>
    loadTransactionPagePrefetch({
      txnHashOrVersion: params.txnHashOrVersion,
      queryClient: context.queryClient,
      search: location.search,
    }),
  component: TransactionPage,
});
