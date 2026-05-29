import {createFileRoute, Outlet, redirect} from "@tanstack/react-router";
import {isOverviewTab} from "../pages/Transaction/transactionTabMeta";

// Layout route for /txn/:txnHashOrVersion/*
// Handles backward compatibility redirects from query params to path-based tabs.
// The exact `/txn/:txnHashOrVersion` path is served by the index route, which
// renders the per-type Overview directly (no explicit overview tab segment).
export const Route = createFileRoute("/txn/$txnHashOrVersion")({
  beforeLoad: ({params, search}) => {
    const searchParams = search as {tab?: string; network?: string};

    // Backward compatibility: `?tab=` query param → path-based route.
    if (searchParams?.tab) {
      const networkSearch = searchParams.network
        ? {network: searchParams.network}
        : undefined;

      // Overview tabs have no URL segment — send them to the base path.
      if (isOverviewTab(searchParams.tab)) {
        throw redirect({
          to: "/txn/$txnHashOrVersion",
          params: {txnHashOrVersion: params.txnHashOrVersion},
          search: networkSearch,
        });
      }

      throw redirect({
        to: "/txn/$txnHashOrVersion/$tab",
        params: {
          txnHashOrVersion: params.txnHashOrVersion,
          tab: searchParams.tab,
        },
        search: networkSearch,
      });
    }
  },
  component: () => <Outlet />,
});
