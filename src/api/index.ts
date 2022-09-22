import {AptosClient, Types} from "aptos";
import {isHex} from "../pages/utils";
import {withResponseError} from "./client";

/**
 * AptosClient 1.3.8+ added a feature to fix the sticky session problem.
 * Client requests might be routed to different fullnodes by load balancer, so the data read by clients might be inconsistent.
 * Load balancer uses cookie for sticky session. Therefore clients need to carry cookie.
 *
 * Unfortunately, this new feature would cause CORS issue for testnet and local networks.
 * While waiting for the testnet nodes upgrading to the latest software,
 * we apply this walk-around to make WITH_CREDENTIALS false when creating AptosClients.
 */
const config = {WITH_CREDENTIALS: false};

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
  const client = new AptosClient(nodeUrl, config);
  return withResponseError(client.getTransactionByVersion(BigInt(version)));
}

function getTransactionByHash(
  hash: string,
  nodeUrl: string,
): Promise<Types.Transaction> {
  const client = new AptosClient(nodeUrl, config);
  return withResponseError(client.getTransactionByHash(hash));
}

export function getAccount(
  requestParameters: {address: string},
  nodeUrl: string,
): Promise<Types.AccountData> {
  const client = new AptosClient(nodeUrl, config);
  const {address} = requestParameters;
  return withResponseError(client.getAccount(address));
}

export function getAccountResources(
  requestParameters: {address: string; ledgerVersion?: number},
  nodeUrl: string,
): Promise<Types.MoveResource[]> {
  const client = new AptosClient(nodeUrl, config);
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
  const client = new AptosClient(nodeUrl, config);
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
  const client = new AptosClient(nodeUrl, config);
  const {tableHandle, data} = requestParameters;
  return withResponseError(client.getTableItem(tableHandle, data));
}
