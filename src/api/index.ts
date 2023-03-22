import {AptosClient, Types} from "aptos";
import {isNumeric} from "../pages/utils";
import {sortTransactions} from "../utils";
import {withResponseError} from "./client";

export async function getTransactions(
  requestParameters: {start?: number; limit?: number},
  nodeUrl: string,
): Promise<Types.Transaction[]> {
  const client = new AptosClient(nodeUrl);
  const {start, limit} = requestParameters;
  let bigStart;
  if (start !== undefined) {
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
  if (start !== undefined) {
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
  if (typeof txnHashOrVersion === "number" || isNumeric(txnHashOrVersion)) {
    const version =
      typeof txnHashOrVersion === "number"
        ? txnHashOrVersion
        : parseInt(txnHashOrVersion);
    return getTransactionByVersion(version, nodeUrl);
  } else {
    return getTransactionByHash(txnHashOrVersion as string, nodeUrl);
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

export function getLedgerInfoWithoutResponseError(
  nodeUrl: string,
): Promise<Types.IndexResponse> {
  const client = new AptosClient(nodeUrl);
  return client.getLedgerInfo();
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
  if (ledgerVersion !== undefined) {
    ledgerVersionBig = BigInt(ledgerVersion);
  }
  return withResponseError(
    client.getAccountResources(address, {ledgerVersion: ledgerVersionBig}),
  );
}

export function getAccountResource(
  requestParameters: {
    address: string;
    resourceType: string;
    ledgerVersion?: number;
  },
  nodeUrl: string,
): Promise<Types.MoveResource> {
  const client = new AptosClient(nodeUrl);
  const {address, resourceType, ledgerVersion} = requestParameters;
  let ledgerVersionBig;
  if (ledgerVersion !== undefined) {
    ledgerVersionBig = BigInt(ledgerVersion);
  }
  return withResponseError(
    client.getAccountResource(address, resourceType, {
      ledgerVersion: ledgerVersionBig,
    }),
  );
}

export function getAccountModules(
  requestParameters: {address: string; ledgerVersion?: number},
  nodeUrl: string,
): Promise<Types.MoveModuleBytecode[]> {
  const client = new AptosClient(nodeUrl);
  const {address, ledgerVersion} = requestParameters;
  let ledgerVersionBig;
  if (ledgerVersion !== undefined) {
    ledgerVersionBig = BigInt(ledgerVersion);
  }
  return withResponseError(
    client.getAccountModules(address, {ledgerVersion: ledgerVersionBig}),
  );
}

export function getAccountModule(
  requestParameters: {
    address: string;
    moduleName: string;
    ledgerVersion?: number;
  },
  nodeUrl: string,
): Promise<Types.MoveModuleBytecode> {
  const client = new AptosClient(nodeUrl);
  const {address, moduleName, ledgerVersion} = requestParameters;
  let ledgerVersionBig;
  if (ledgerVersion !== undefined) {
    ledgerVersionBig = BigInt(ledgerVersion);
  }
  return withResponseError(
    client.getAccountModule(address, moduleName, {
      ledgerVersion: ledgerVersionBig,
    }),
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
  requestParameters: {height: number; withTransactions: boolean},
  nodeUrl: string,
): Promise<Types.Block> {
  const {height, withTransactions} = requestParameters;
  const client = new AptosClient(nodeUrl);
  return withResponseError(client.getBlockByHeight(height, withTransactions));
}

export function getBlockByVersion(
  requestParameters: {version: number; withTransactions: boolean},
  nodeUrl: string,
): Promise<Types.Block> {
  const {version, withTransactions} = requestParameters;
  const client = new AptosClient(nodeUrl);
  return withResponseError(client.getBlockByVersion(version, withTransactions));
}

export async function getRecentBlocks(
  currentBlockHeight: number,
  count: number,
  nodeUrl: string,
): Promise<Types.Block[]> {
  const client = new AptosClient(nodeUrl);
  const blocks = [];
  for (let i = 0; i < count; i++) {
    const block = await client.getBlockByHeight(currentBlockHeight - i, false);
    blocks.push(block);
  }
  return blocks;
}

export async function getStake(
  client: AptosClient,
  delegatorAddress: Types.Address,
  validatorAddress: Types.Address,
): Promise<Types.MoveValue[]> {
  const payload: Types.ViewRequest = {
    function: "0x1::delegation_pool::get_stake",
    type_arguments: [],
    arguments: [validatorAddress, delegatorAddress],
  };
  return withResponseError(client.view(payload));
}

export async function getValidatorCommission(
  client: AptosClient,
  validatorAddress: Types.Address,
): Promise<Types.MoveValue[]> {
  const payload: Types.ViewRequest = {
    function: "0x1::delegation_pool::operator_commission_percentage",
    type_arguments: [],
    arguments: [validatorAddress],
  };
  return withResponseError(client.view(payload));
}

export async function getDelegationPoolExist(
  client: AptosClient,
  validatorAddress: Types.Address,
): Promise<Types.MoveValue[]> {
  const payload: Types.ViewRequest = {
    function: "0x1::delegation_pool::delegation_pool_exists",
    type_arguments: [],
    arguments: [validatorAddress],
  };
  return withResponseError(client.view(payload));
}
