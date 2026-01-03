/**
 * Query options for TanStack Query.
 * These can be shared between route loaders and components.
 */
import {queryOptions} from "@tanstack/react-query";
import {Aptos} from "@aptos-labs/ts-sdk";
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
export function ledgerInfoQueryOptions(client: Aptos) {
  return queryOptions({
    queryKey: ["ledgerInfo"],
    queryFn: () => client.getLedgerInfo(),
    staleTime: 5 * 1000, // 5 seconds
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
  networkName: string,
) {
  return queryOptions({
    queryKey: ["transaction", txnHashOrVersion, networkName],
    queryFn: () => getTransaction(txnHashOrVersion, client),
    staleTime: 60 * 60 * 1000, // 1 hour - transactions are immutable
  });
}

// Single block query
export function blockQueryOptions(height: string, client: Aptos) {
  return queryOptions({
    queryKey: ["block", height],
    queryFn: () =>
      client.getBlockByHeight({
        blockHeight: Number(height),
        options: {withTransactions: true},
      }),
    staleTime: 60 * 60 * 1000, // 1 hour - blocks are immutable
  });
}

// Account info query
export function accountInfoQueryOptions(address: string, client: Aptos) {
  return queryOptions({
    queryKey: ["account", address],
    queryFn: async () => {
      try {
        const account = await client.getAccountInfo({
          accountAddress: address,
        });
        return account;
      } catch {
        return null;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Account resources query
export function accountResourcesQueryOptions(address: string, client: Aptos) {
  return queryOptions({
    queryKey: ["accountResources", address],
    queryFn: async () => {
      try {
        const resources = await client.getAccountResources({
          accountAddress: address,
        });
        return resources;
      } catch {
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
      } catch {
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
      } catch {
        return [];
      }
    },
    staleTime: 10 * 1000, // 10 seconds
  });
}
