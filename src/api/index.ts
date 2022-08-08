import {AptosClient, Types} from "aptos";
import { isHex } from "../pages/utils";
import {withResponseError} from "./client";

export async function getTransactions(
  requestParameters: {start?: bigint; limit?: number},
  nodeUrl: string,
): Promise<Types.Transaction[]> {
  const client = new AptosClient(nodeUrl);
  const transactions = await withResponseError(
    client.getTransactions(requestParameters),
  );

  // Sort in descending order
  // transactions.sort((a, b) =>
  //   parseInt(a.hash) < parseInt(b.version) ? 1 : -1,
  // );

  return transactions;
}

export async function getAccountTransactions(
  requestParameters: {address: string; start?: bigint; limit?: number},
  nodeUrl: string,
): Promise<Types.Transaction[]> {
  const client = new AptosClient(nodeUrl);
  const {address, ...rest} = requestParameters;
  const transactions = await withResponseError(
    client.getAccountTransactions(address, rest),
  );

  // Sort in descending order
  // transactions.sort((a, b) =>
  //   parseInt(a.version) < parseInt(b.version) ? 1 : -1,
  // );

  return transactions;
}

export function getTransaction(
  requestParameters: {txnHashOrVersion: string},
  nodeUrl: string,
): Promise<Types.Transaction> {
  const {txnHashOrVersion} = requestParameters;
  if(isHex(txnHashOrVersion)){
    return getTransactionByHash(txnHashOrVersion, nodeUrl)
  }else{
    return getTransactionByVersion(BigInt(txnHashOrVersion), nodeUrl)
  }
}

function getTransactionByVersion(
  version: bigint,
  nodeUrl: string,
): Promise<Types.Transaction> {
  const client = new AptosClient(nodeUrl);
  return withResponseError(client.getTransactionByVersion(version));
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
  requestParameters: {address: string; ledgerVersion?: BigInt},
  nodeUrl: string,
): Promise<Types.MoveResource[]> {
  const client = new AptosClient(nodeUrl);
  const {address, ...rest} = requestParameters;
  return withResponseError(client.getAccountResources(address, rest));
}

export function getAccountModules(
  requestParameters: {address: string; ledgerVersion?: BigInt},
  nodeUrl: string,
): Promise<Types.MoveModuleBytecode[]> {
  const client = new AptosClient(nodeUrl);
  const {address, ...rest} = requestParameters;
  return withResponseError(client.getAccountModules(address, rest));
}

export function getTableItem(
  requestParameters: {tableHandle: string; data: Types.TableItemRequest},
  nodeUrl: string,
): Promise<any> {
  const client = new AptosClient(nodeUrl);
  const {tableHandle, data} = requestParameters;
  return withResponseError(client.getTableItem(tableHandle, data));
}
