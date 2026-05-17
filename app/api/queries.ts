/**
 * Query options for TanStack Query.
 * These can be shared between route loaders and components.
 */

import type {Aptos} from "@aptos-labs/ts-sdk";
import {queryOptions} from "@tanstack/react-query";
import {
  emitRateLimit,
  isRateLimitLike,
} from "../context/rate-limit/rateLimitEvents";
import {getRecentBlocks} from "./v2";
import {getTransaction} from "./client";

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
  return queryOptions({
    queryKey: ["transaction", {txnHashOrVersion}, networkKey],
    queryFn: () => getTransaction(txnHashOrVersion, client),
    staleTime: 60 * 60 * 1000, // 1 hour - transactions are immutable
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
      client.getBlockByHeight({
        blockHeight: Number(height),
        options: {withTransactions: true},
      }),
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

// Account resources query
export function accountResourcesQueryOptions(
  address: string,
  client: Aptos,
  networkKey: string,
) {
  return queryOptions({
    queryKey: ["accountResources", {address}, networkKey],
    queryFn: async () => {
      try {
        const resources = await client.getAccountResources({
          accountAddress: address,
        });
        return resources;
      } catch (error) {
        if (isRateLimitLike(error)) emitRateLimit();
        return [];
      }
    },
    staleTime: 30 * 1000, // 30 seconds
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

// Recent blocks list (used by /blocks loader). Must key identically to
// `useGetMostRecentBlocks` so the SSR pre-fetch is reused on hydration.
// The fifth key slot is the explorer's per-user API key override
// identity, which is the empty string when no override is configured
// (matches `normalizeGeomiDevApiKeyOverride(undefined)`).
export function recentBlocksQueryOptions(
  client: Aptos,
  networkKey: string,
  currentBlockHeight: number,
  count: number,
  apiKeyIdentity: string = "",
) {
  return queryOptions({
    queryKey: [
      "recentBlocksRest",
      currentBlockHeight,
      count,
      networkKey,
      apiKeyIdentity,
    ],
    queryFn: () => getRecentBlocks(currentBlockHeight, count, client),
    staleTime: 60 * 1000,
  });
}

// Generic view-function query, used by loaders to pre-warm `useViewFunction`
// (whose key shape this matches exactly).
export function viewFunctionQueryOptions(
  functionName: string,
  typeArgs: string[],
  args: string[],
  client: Aptos,
  networkKey: string,
  opts?: {staleTime?: number; gcTime?: number},
) {
  return queryOptions({
    queryKey: ["viewFunction", {functionName, typeArgs, args}, networkKey],
    queryFn: async () => {
      try {
        const result = await client.view({
          payload: {
            function: functionName as `${string}::${string}::${string}`,
            typeArguments: typeArgs,
            functionArguments: args,
          },
        });
        return result;
      } catch (error) {
        if (isRateLimitLike(error)) emitRateLimit();
        throw error;
      }
    },
    staleTime: opts?.staleTime ?? 5 * 60 * 1000,
    gcTime: opts?.gcTime ?? 30 * 60 * 1000,
  });
}

// Generic single-resource query, used by loaders to pre-warm
// `useGetAccountResource` (whose key shape this matches exactly).
export function accountResourceQueryOptions(
  address: string,
  resourceType: string,
  client: Aptos,
  networkKey: string,
  ledgerVersion?: number,
) {
  return queryOptions({
    queryKey: [
      "accountResource",
      {address, resource: resourceType, ledgerVersion},
      networkKey,
    ],
    queryFn: async () => {
      try {
        const resource = await client.getAccountResource({
          accountAddress: address,
          resourceType: resourceType as `0x${string}::${string}::${string}`,
          options:
            ledgerVersion !== undefined
              ? {ledgerVersion: BigInt(ledgerVersion)}
              : undefined,
        });
        return resource;
      } catch (error) {
        if (isRateLimitLike(error)) emitRateLimit();
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
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
