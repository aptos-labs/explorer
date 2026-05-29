import type {QueryClient} from "@tanstack/react-query";
import {getClientFromSearch, getNetworkFromSearch} from "../../api/createClient";
import {transactionQueryOptions} from "../../api/queries";
import {networks} from "../../constants";

/**
 * Prefetch transaction data during navigation for faster perceived load.
 *
 * Shared by the transaction base route (`/txn/:txnHashOrVersion`, overview) and
 * the tab route (`/txn/:txnHashOrVersion/:tab`) so both warm the same query.
 * Prefetch errors are swallowed so the transaction page's own error handling
 * (e.g. `TransactionError`) can render instead of the router error boundary.
 */
export async function prefetchTransactionData(
  txnHashOrVersion: string,
  queryClient: QueryClient,
  search: Record<string, string | undefined>,
): Promise<{networkName: string}> {
  const client = getClientFromSearch(search);
  const networkName = getNetworkFromSearch(search);
  const networkValue = networks[networkName];

  try {
    await queryClient.ensureQueryData(
      transactionQueryOptions(txnHashOrVersion, client, networkValue),
    );
  } catch {
    // Intentionally ignored — see doc comment above.
  }

  return {networkName};
}
