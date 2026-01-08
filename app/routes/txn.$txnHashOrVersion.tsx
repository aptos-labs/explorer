import {createFileRoute, Outlet, redirect} from "@tanstack/react-router";

// Layout route for /txn/:txnHashOrVersion/*
// Handles backward compatibility redirects from query params to path-based tabs
export const Route = createFileRoute("/txn/$txnHashOrVersion")({
  beforeLoad: ({params, search, location}) => {
    const searchParams = search as {tab?: string; network?: string};

    // Check if we're on the exact /txn/:txnHashOrVersion path (no child route)
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const isExactMatch = pathSegments.length === 2; // ["txn", "txnHashOrVersion"]

    // If there's a tab query param, redirect to path-based route
    if (searchParams?.tab) {
      throw redirect({
        to: "/txn/$txnHashOrVersion/$tab",
        params: {
          txnHashOrVersion: params.txnHashOrVersion,
          tab: searchParams.tab,
        },
        search: searchParams.network
          ? {network: searchParams.network}
          : undefined,
      });
    }
    // Default: redirect to "userTxnOverview" tab only if on exact path
    if (isExactMatch) {
      throw redirect({
        to: "/txn/$txnHashOrVersion/$tab",
        params: {
          txnHashOrVersion: params.txnHashOrVersion,
          tab: "userTxnOverview",
        },
        search: searchParams?.network
          ? {network: searchParams.network}
          : undefined,
      });
    }
  },
  component: () => <Outlet />,
});
