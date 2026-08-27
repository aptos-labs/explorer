/**
 * Query options for TanStack Query.
 * These can be shared between route loaders and components.
 */

import {
  APTOS_COIN,
  type Aptos,
  type InputViewFunctionData,
  TypeTagAddress,
  TypeTagU64,
} from "@aptos-labs/ts-sdk";
import {queryOptions} from "@tanstack/react-query";
import type {Types} from "~/types/aptos";
import {
  emitRateLimit,
  isRateLimitLike,
} from "../context/rate-limit/rateLimitEvents";
import {objectCoreResource, tokenV2Address} from "../lib/constants";
import {getTransaction, type ResponseError, withResponseError} from "./client";
import {toMoveResource} from "./moveResource";
import {getBlockByHeight} from "./v2";

export const ACCOUNT_RESOURCE_TYPE = "0x1::account::Account";
export const MULTISIG_ACCOUNT_RESOURCE_TYPE =
  "0x1::multisig_account::MultisigAccount";

/** Resources needed to choose title, tabs, and object redirect before the full resource list. */
export const ACCOUNT_LAYOUT_RESOURCE_TYPES = [
  ACCOUNT_RESOURCE_TYPE,
  objectCoreResource,
  tokenV2Address,
  MULTISIG_ACCOUNT_RESOURCE_TYPE,
] as const;

// Transactions list query
export function transactionsQueryOptions(client: Aptos) {
  return queryOptions({
    queryKey: ["transactions", "latest"],
    queryFn: async () => {
      const response = await client.getTransactions({
        options: {limit: 25},
      });
      return response;
    },
    staleTime: 10 * 1000, // 10 seconds
  });
}

// Ledger info query
export function ledgerInfoQueryOptions(
  client: Aptos,
  networkKey: string,
  staleTime: number = 1000,
) {
  return queryOptions({
    queryKey: ["ledgerInfo", networkKey],
    queryFn: () => client.getLedgerInfo(),
    staleTime,
  });
}

// Blocks list query (depends on block height)
export function blocksQueryOptions(client: Aptos, currentBlockHeight: number) {
  return queryOptions({
    queryKey: ["blocks", currentBlockHeight],
    queryFn: async () => {
      if (!currentBlockHeight) return [];

      const blockPromises = [];
      for (let i = 0; i < 20; i++) {
        const height = currentBlockHeight - i;
        if (height >= 0) {
          blockPromises.push(
            client.getBlockByHeight({
              blockHeight: height,
              options: {withTransactions: false},
            }),
          );
        }
      }
      return Promise.all(blockPromises);
    },
    enabled: currentBlockHeight > 0,
    staleTime: 5 * 1000, // 5 seconds
  });
}

// Single transaction query
export function transactionQueryOptions(
  txnHashOrVersion: string,
  client: Aptos,
  networkKey: string,
) {
  return queryOptions<Types.Transaction, ResponseError>({
    queryKey: ["transaction", {txnHashOrVersion}, networkKey],
    queryFn: () => getTransaction(txnHashOrVersion, client),
    staleTime: 60 * 60 * 1000, // 1 hour - transactions are immutable
    gcTime: 24 * 60 * 60 * 1000,
    enabled: !!txnHashOrVersion,
  });
}

// Single block query
export function blockQueryOptions(
  height: string,
  client: Aptos,
  networkKey: string,
) {
  return queryOptions({
    queryKey: ["block", Number(height), true, networkKey],
    queryFn: () =>
      getBlockByHeight(
        {height: Number(height), withTransactions: true},
        client,
      ),
    staleTime: 60 * 60 * 1000, // 1 hour - blocks are immutable
  });
}

// Account info query
export function accountInfoQueryOptions(
  address: string,
  client: Aptos,
  networkKey: string,
) {
  return queryOptions({
    queryKey: ["account", {address}, networkKey],
    queryFn: async () => {
      try {
        const account = await client.getAccountInfo({
          accountAddress: address,
        });
        return account;
      } catch (error) {
        if (isRateLimitLike(error)) emitRateLimit();
        return null;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Single account resource query (layout probes: Account, ObjectCore, Token, Multisig)
export function accountResourceQueryOptions(
  address: string,
  resource: string,
  client: Aptos,
  networkKey: string,
  ledgerVersion?: number,
) {
  return queryOptions<Types.MoveResource, ResponseError>({
    queryKey: [
      "accountResource",
      {address, resource, ledgerVersion},
      networkKey,
    ],
    queryFn: async () => {
      const result = await withResponseError(
        client.getAccountResource({
          accountAddress: address,
          resourceType: resource as `${string}::${string}::${string}`,
          options: {
            ledgerVersion:
              ledgerVersion !== undefined ? BigInt(ledgerVersion) : undefined,
          },
        }),
      );
      // SDK returns the inner payload; restore the REST {type, data} envelope.
      return toMoveResource(resource, result);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!address,
  });
}

// Account resources query
export function accountResourcesQueryOptions(
  address: string,
  client: Aptos,
  networkKey: string,
) {
  return queryOptions<Types.MoveResource[], ResponseError>({
    queryKey: ["accountResources", {address}, networkKey],
    queryFn: async () => {
      const resources = await withResponseError(
        client.getAccountResources({
          accountAddress: address,
        }),
      );
      return resources as unknown as Types.MoveResource[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: !!address,
  });
}

export function aptBalanceQueryOptions(
  address: string,
  client: Aptos,
  networkKey: string,
) {
  return queryOptions<string, ResponseError>({
    queryKey: ["aptBalance", {address}, networkKey],
    queryFn: async () => {
      const payload: InputViewFunctionData = {
        function: "0x1::coin::balance",
        typeArguments: [APTOS_COIN],
        functionArguments: [address],
        abi: {
          parameters: [new TypeTagAddress()],
          typeParameters: [{constraints: []}],
          returnTypes: [new TypeTagU64()],
        },
      };
      return withResponseError(
        client.view<[string]>({payload}).then((res) => res[0]),
      );
    },
    retry: false,
    enabled: !!address,
  });
}

// Account modules query
export function accountModulesQueryOptions(address: string, client: Aptos) {
  return queryOptions({
    queryKey: ["accountModules", address],
    queryFn: async () => {
      try {
        const modules = await client.getAccountModules({
          accountAddress: address,
        });
        return modules;
      } catch (error) {
        if (isRateLimitLike(error)) emitRateLimit();
        return [];
      }
    },
    staleTime: 60 * 1000, // 1 minute - modules change less frequently
  });
}

// Account transactions query
export function accountTransactionsQueryOptions(
  address: string,
  client: Aptos,
) {
  return queryOptions({
    queryKey: ["accountTransactions", address],
    queryFn: async () => {
      try {
        const transactions = await client.getAccountTransactions({
          accountAddress: address,
          options: {limit: 25},
        });
        return transactions;
      } catch (error) {
        if (isRateLimitLike(error)) emitRateLimit();
        return [];
      }
    },
    staleTime: 10 * 1000, // 10 seconds
  });
}
