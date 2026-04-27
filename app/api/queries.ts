/**
 * Query options for TanStack Query.
 * These can be shared between route loaders and components.
 */

import type {Aptos} from "@aptos-labs/ts-sdk";
import {queryOptions} from "@tanstack/react-query";
import {
  emitRateLimit,
  isRateLimitLike,
} from "~/context/rate-limit/rateLimitEvents";
import {getTransaction} from "./client";

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
        return await client.getAccountResources({
          accountAddress: address,
        });
      } catch (error) {
        if (isRateLimitLike(error)) emitRateLimit();
        return [];
      }
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}
