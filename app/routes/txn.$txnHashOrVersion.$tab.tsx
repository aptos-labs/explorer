import {createFileRoute, redirect} from "@tanstack/react-router";

// Backward compatibility: redirect /txn/:txnHashOrVersion/:tab to /txn/:txnHashOrVersion?tab=:tab
export const Route = createFileRoute("/txn/$txnHashOrVersion/$tab")({
  beforeLoad: ({params}) => {
    throw redirect({
      to: "/txn/$txnHashOrVersion",
      params: {txnHashOrVersion: params.txnHashOrVersion},
      search: {tab: params.tab},
    });
  },
  component: () => null,
});
