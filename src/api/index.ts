import {AptosClient, Types} from "aptos";
import {isHex} from "../pages/utils";
import {sortTransactions} from "../utils";
import {withResponseError} from "./client";

export async function getTransactions(
  requestParameters: {start?: number; limit?: number},
  nodeUrl: string,
): Promise<Types.Transaction[]> {
  const client = new AptosClient(nodeUrl);
  const {start, limit} = requestParameters;
  let bigStart;
  if (start) {
    bigStart = BigInt(start);
  }
  const transactions = await withResponseError(
    client.getTransactions({start: bigStart, limit}),
  );

  // Sort in descending order
  transactions.sort(sortTransactions);

  return transactions;
}

export async function getAccountTransactions(
  requestParameters: {address: string; start?: number; limit?: number},
  nodeUrl: string,
): Promise<Types.Transaction[]> {
  const client = new AptosClient(nodeUrl);
  const {address, start, limit} = requestParameters;
  let bigStart;
  if (start) {
    bigStart = BigInt(start);
  }
  const transactions = await withResponseError(
    client.getAccountTransactions(address, {start: bigStart, limit}),
  );

  // Sort in descending order
  transactions.sort(sortTransactions);

  return transactions;
}

export function getTransaction(
  requestParameters: {txnHashOrVersion: string | number},
  nodeUrl: string,
): Promise<Types.Transaction> {
  const {txnHashOrVersion} = requestParameters;
  if (isHex(txnHashOrVersion as string)) {
    return getTransactionByHash(txnHashOrVersion as string, nodeUrl);
  } else {
    return getTransactionByVersion(txnHashOrVersion as number, nodeUrl);
  }
}

function getTransactionByVersion(
  version: number,
  nodeUrl: string,
): Promise<Types.Transaction> {
  const client = new AptosClient(nodeUrl);
  return withResponseError(client.getTransactionByVersion(BigInt(version)));
}

function getTransactionByHash(
  hash: string,
  nodeUrl: string,
): Promise<Types.Transaction> {
  const client = new AptosClient(nodeUrl);
  return withResponseError(client.getTransactionByHash(hash));
}

export function getLedgerInfo(nodeUrl: string): Promise<Types.IndexResponse> {
  const client = new AptosClient(nodeUrl);
  return withResponseError(client.getLedgerInfo());
}

export function getAccount(
  requestParameters: {address: string},
  nodeUrl: string,
): Promise<Types.AccountData> {
  const client = new AptosClient(nodeUrl);
  const {address} = requestParameters;
  return withResponseError(client.getAccount(address));
}

export function getAccountResources(
  requestParameters: {address: string; ledgerVersion?: number},
  nodeUrl: string,
): Promise<Types.MoveResource[]> {
  const client = new AptosClient(nodeUrl);
  const {address, ledgerVersion} = requestParameters;
  let ledgerVersionBig;
  if (ledgerVersion) {
    ledgerVersionBig = BigInt(ledgerVersion);
  }
  return withResponseError(
    client.getAccountResources(address, {ledgerVersion: ledgerVersionBig}),
  );
}

export function getAccountModules(
  requestParameters: {address: string; ledgerVersion?: number},
  nodeUrl: string,
): Promise<Types.MoveModuleBytecode[]> {
  const client = new AptosClient(nodeUrl);
  const {address, ledgerVersion} = requestParameters;
  let ledgerVersionBig;
  if (ledgerVersion) {
    ledgerVersionBig = BigInt(ledgerVersion);
  }
  return withResponseError(
    client.getAccountModules(address, {ledgerVersion: ledgerVersionBig}),
  );
}

export function getTableItem(
  requestParameters: {tableHandle: string; data: Types.TableItemRequest},
  nodeUrl: string,
): Promise<any> {
  const client = new AptosClient(nodeUrl);
  const {tableHandle, data} = requestParameters;
  return withResponseError(client.getTableItem(tableHandle, data));
}

export function getBlockByHeight(
  height: number,
  nodeUrl: string,
): Promise<Types.Block> {
  const client = new AptosClient(nodeUrl);
  return withResponseError(client.getBlockByHeight(height, true));
}

export function getBlockByVersion(
  version: number,
  nodeUrl: string,
): Promise<Types.Block> {
  const client = new AptosClient(nodeUrl);
  return withResponseError(client.getBlockByVersion(version, true));
}
