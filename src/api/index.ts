import {AptosClient, Types} from "aptos";
import {withResponseError} from "./client";

export async function getTransactions(
  requestParameters: {start?: number; limit?: number},
  nodeUrl: string,
): Promise<Types.OnChainTransaction[]> {
  const client = new AptosClient(nodeUrl);
  const transactions = await withResponseError(
    client.getTransactions(requestParameters),
  );

  // Sort in descending order
  transactions.sort((a, b) =>
    parseInt(a.version) < parseInt(b.version) ? 1 : -1,
  );

  return transactions;
}

export async function getAccountTransactions(
  requestParameters: {address: string; start?: number; limit?: number},
  nodeUrl: string,
): Promise<Types.OnChainTransaction[]> {
  const client = new AptosClient(nodeUrl);
  const {address, ...rest} = requestParameters;
  const transactions = await withResponseError(
    client.getAccountTransactions(address, rest),
  );

  // Sort in descending order
  transactions.sort((a, b) =>
    parseInt(a.version) < parseInt(b.version) ? 1 : -1,
  );

  return transactions;
}

export function getTransaction(
  requestParameters: {txnHashOrVersion: string},
  nodeUrl: string,
): Promise<Types.Transaction> {
  const client = new AptosClient(nodeUrl);
  const {txnHashOrVersion} = requestParameters;
  return withResponseError(client.getTransaction(txnHashOrVersion));
}

export function getLedgerInfo(nodeUrl: string): Promise<Types.LedgerInfo> {
  const client = new AptosClient(nodeUrl);
  return withResponseError(client.getLedgerInfo());
}

export function getAccount(
  requestParameters: {address: string},
  nodeUrl: string,
): Promise<Types.Account> {
  const client = new AptosClient(nodeUrl);
  const {address} = requestParameters;
  return withResponseError(client.getAccount(address));
}

export function getAccountResources(
  requestParameters: {address: string; version?: Types.LedgerVersion},
  nodeUrl: string,
): Promise<Types.AccountResource[]> {
  const client = new AptosClient(nodeUrl);
  const {address, ...rest} = requestParameters;
  return withResponseError(client.getAccountResources(address, rest));
}

export function getAccountModules(
  requestParameters: {address: string; version?: Types.LedgerVersion},
  nodeUrl: string,
): Promise<Types.MoveModule[]> {
  const client = new AptosClient(nodeUrl);
  const {address, ...rest} = requestParameters;
  return withResponseError(client.getAccountModules(address, rest));
}
