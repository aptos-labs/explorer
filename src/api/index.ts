
import { AptosClient, Types, MaybeHexString } from "aptos";
import { withResponseError} from "./client";

export async function getTransactions(
  node_url: string,
  query?: {start?: number | undefined; limit?: number | undefined},
): Promise<Array<Types.OnChainTransaction>> {
  const transactions = await withResponseError(
    new AptosClient(node_url).getTransactions(
      query,
    ),
  );

  // Sort in descending order
  transactions.sort((a, b) =>
    parseInt(a.version) < parseInt(b.version) ? 1 : -1,
  );

  return transactions;
}

export function getTransaction(
  requestParameters: string,
  node_url: string,
): Promise<Types.Transaction> {
  return withResponseError(
    new AptosClient(node_url).getTransaction(
      requestParameters,
    ),
  );
}

export function getLedgerInfo(node_url: string): Promise<Types.LedgerInfo> {
  return withResponseError(
    new AptosClient(node_url).getLedgerInfo(),
  );
}

export function getAccount(
  account_address: string,
  node_url: string,
): Promise<Types.Account> {
  return withResponseError(
    new AptosClient(node_url).getAccount(account_address),
  );
}

export function getAccountResources(
  node_url: string,
  account_address: MaybeHexString,
  query?: { version?: string | undefined; }
): Promise<Array<Types.AccountResource>> {
  return withResponseError(
    new AptosClient(node_url).getAccountResources(
      account_address, query
    ),
  );
}

export function getAccountModules(
  node_url: string,
  account_address: MaybeHexString,
  query?: { version?: string | undefined; }
): Promise<Array<Types.MoveModule>> {
  return withResponseError(
    new AptosClient(node_url).getAccountModules(account_address, query),
  );
}
