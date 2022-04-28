import {
  AccountsApi,
  GetAccountRequest,
  GetAccountResourcesRequest,
  GetAccountModulesRequest,
  TransactionsApi,
  OnChainTransaction,
  GetTransactionsRequest,
  BlockMetadataTransaction,
  GenesisTransaction,
  PendingTransaction,
  UserTransaction,
  GetTransactionRequest,
  LedgerInfo,
  GeneralApi,
  Account,
  AccountResource,
  MoveModule,
} from "../api_client/";

import {Err, Ok, Result} from "ts-results";
import {configureClient, ResponseError, toResult} from "./client";

export type GetTransactionType =
  | BlockMetadataTransaction
  | GenesisTransaction
  | PendingTransaction
  | UserTransaction;

export async function getTransactions(
  requestParameters: GetTransactionsRequest = {},
  node_url?: string,
): Promise<Result<Array<OnChainTransaction>, ResponseError>> {
  const result = await toResult(
    configureClient(TransactionsApi, node_url).getTransactions(
      requestParameters,
    ),
  );

  // Sort in descending order
  if (result.ok && result.val) {
    result.val.sort((a, b) =>
      parseInt(a.version) < parseInt(b.version) ? 1 : -1,
    );
  }

  return result;
}

export function getTransaction(
  requestParameters: GetTransactionRequest,
  node_url?: string,
): Promise<Result<GetTransactionType, ResponseError>> {
  return toResult(
    configureClient(TransactionsApi, node_url).getTransaction(
      requestParameters,
    ),
  );
}

export function getLedgerInfo(
  node_url?: string,
): Promise<Result<LedgerInfo, ResponseError>> {
  return toResult(configureClient(GeneralApi, node_url).getLedgerInfo());
}

export function getAccount(
  requestParameters: GetAccountRequest,
  node_url?: string,
): Promise<Result<Account, ResponseError>> {
  return toResult(
    configureClient(AccountsApi, node_url).getAccount(requestParameters),
  );
}

export function getAccountResources(
  requestParameters: GetAccountResourcesRequest,
  node_url?: string,
): Promise<Result<Array<AccountResource>, ResponseError>> {
  return toResult(
    configureClient(AccountsApi, node_url).getAccountResources(
      requestParameters,
    ),
  );
}

export function getAccountModules(
  requestParameters: GetAccountModulesRequest,
  node_url?: string,
): Promise<Result<Array<MoveModule>, ResponseError>> {
  return toResult(
    configureClient(AccountsApi, node_url).getAccountModules(requestParameters),
  );
}
