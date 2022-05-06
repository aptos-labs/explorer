import {
  AccountsApi,
  GetAccountRequest,
  GetAccountResourcesRequest,
  GetAccountModulesRequest,
  TransactionsApi,
  OnChainTransaction,
  GetTransactionsRequest,
  Transaction,
  BlockMetadataTransaction,
  GenesisTransaction,
  PendingTransaction,
  UserTransaction,
  GetTransactionRequest,
  LedgerInfo,
  GeneralApi,
  Account,
  AccountResource,
  MoveModule, GetAccountTransactionsRequest,
} from "../api_client/";

import { AptosClient, AptosAccount, FaucetClient, Types } from "aptos";

import {Err, Ok, Result} from "ts-results";
import {configureClient, ResponseError, withResponseError} from "./client";

export async function getTransactions(
  requestParameters: GetTransactionsRequest,
  node_url: string,
): Promise<Array<OnChainTransaction>> {
  const transactions = await withResponseError(
    configureClient(TransactionsApi, node_url).getTransactions(
      requestParameters,
    ),
  );

  // Sort in descending order
  transactions.sort((a, b) =>
    parseInt(a.version) < parseInt(b.version) ? 1 : -1,
  );

  return transactions;
}

export async function getAccountTransactions(requestParameters: GetAccountTransactionsRequest, node_url?: string): Promise<Array<OnChainTransaction>> {
  const transactions = await withResponseError(configureClient(TransactionsApi, node_url).getAccountTransactions(requestParameters));

  // Sort in descending order
  transactions.sort((a, b) =>
    parseInt(a.version) < parseInt(b.version) ? 1 : -1,
  );

  return transactions;
}

export function getTransaction(
  requestParameters: GetTransactionRequest,
  node_url: string,
): Promise<Transaction> {
  return withResponseError(
    configureClient(TransactionsApi, node_url).getTransaction(
      requestParameters,
    ),
  );
}

export function getLedgerInfo(node_url: string): Promise<LedgerInfo> {
  return withResponseError(
    configureClient(GeneralApi, node_url).getLedgerInfo(),
  );
}

export function getAccount(
  requestParameters: GetAccountRequest,
  node_url: string,
): Promise<Account> {
  return withResponseError(
    configureClient(AccountsApi, node_url).getAccount(requestParameters),
  );
}

export function getAccountResources(
  requestParameters: GetAccountResourcesRequest,
  node_url: string,
): Promise<Array<AccountResource>> {
  return withResponseError(
    configureClient(AccountsApi, node_url).getAccountResources(
      requestParameters,
    ),
  );
}

export function getAccountModules(
  requestParameters: GetAccountModulesRequest,
  node_url: string,
): Promise<Array<MoveModule>> {
  return withResponseError(
    configureClient(AccountsApi, node_url).getAccountModules(requestParameters),
  );
}
