import {createFileRoute, redirect} from "@tanstack/react-router";

// Redirect /txn/:txnHashOrVersion to /txn/:txnHashOrVersion/userTxnOverview (default tab)
// Also handles backward compatibility: /txn/:txnHashOrVersion?tab=xxx -> /txn/:txnHashOrVersion/xxx
export const Route = createFileRoute("/txn/$txnHashOrVersion")({
  beforeLoad: ({params, search}) => {
    const searchParams = search as {tab?: string};
    // If there's a tab query param, redirect to path-based route
    if (searchParams?.tab) {
      throw redirect({
        to: "/txn/$txnHashOrVersion/$tab",
        params: {
          txnHashOrVersion: params.txnHashOrVersion,
          tab: searchParams.tab,
        },
      });
    }
    // Default: redirect to "userTxnOverview" tab (first tab for user transactions)
    throw redirect({
      to: "/txn/$txnHashOrVersion/$tab",
      params: {
        txnHashOrVersion: params.txnHashOrVersion,
        tab: "userTxnOverview",
      },
    });
  },
  component: () => null,
});
