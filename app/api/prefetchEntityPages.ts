/**
 * Non-blocking prefetch for account and transaction detail pages.
 *
 * Loaders call these and return immediately so the route can paint skeletons.
 * Layout-defining account resources are issued first; the full resource list
 * waits until those probes settle so they don't contend for the first
 * connection window.
 */

import type {Aptos} from "@aptos-labs/ts-sdk";
import type {QueryClient} from "@tanstack/react-query";
import {getGraphqlURI, networks, type NetworkName} from "../lib/constants";
import {tryStandardizeAddress} from "../utils";
import {getClientFromSearch, getNetworkFromSearch} from "./createClient";
import {
  ACCOUNT_TXN_PAGE_SIZE,
  accountTxnCountQueryOptions,
  accountTxnVersionsQueryOptions,
} from "./hooks/useGetAccountAllTransactions";
import {
  ACCOUNT_LAYOUT_RESOURCE_TYPES,
  accountResourceQueryOptions,
  accountResourcesQueryOptions,
  aptBalanceQueryOptions,
  transactionQueryOptions,
} from "./queries";

export function tryStandardizeRouteAddress(
  raw: string | undefined,
): string | undefined {
  if (!raw || raw.endsWith(".apt")) return undefined;
  return tryStandardizeAddress(raw);
}

export type PrefetchAccountPageArgs = {
  queryClient: QueryClient;
  address: string;
  client: Aptos;
  networkName: NetworkName;
  networkValue: string;
  page?: number;
};

/**
 * Schedule account-page queries without awaiting them.
 *
 * Order:
 * 1. Layout resources (Account / ObjectCore / Token / Multisig) — organize title, tabs, redirect
 * 2. Same tick: APT balance + default-tab transaction list (header + first tab)
 * 3. After layout probes settle: full resource list (Resources tab)
 */
export function prefetchAccountPageData({
  queryClient,
  address,
  client,
  networkName,
  networkValue,
  page = 1,
}: PrefetchAccountPageArgs): void {
  const layout = Promise.all(
    ACCOUNT_LAYOUT_RESOURCE_TYPES.map((resource) =>
      queryClient.prefetchQuery(
        accountResourceQueryOptions(address, resource, client, networkValue),
      ),
    ),
  );

  void queryClient.prefetchQuery(
    aptBalanceQueryOptions(address, client, networkValue),
  );

  if (getGraphqlURI(networkName)) {
    const addr64 = tryStandardizeAddress(address) ?? address;
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const offset = (safePage - 1) * ACCOUNT_TXN_PAGE_SIZE;
    void queryClient.prefetchQuery(
      accountTxnCountQueryOptions(addr64, client, networkValue),
    );
    void queryClient.prefetchQuery(
      accountTxnVersionsQueryOptions(
        addr64,
        client,
        networkValue,
        ACCOUNT_TXN_PAGE_SIZE,
        offset,
      ),
    );
  }

  void layout.then(() => {
    void queryClient.prefetchQuery(
      accountResourcesQueryOptions(address, client, networkValue),
    );
  });
}

export function prefetchTransactionPageData(
  queryClient: QueryClient,
  txnHashOrVersion: string,
  client: Aptos,
  networkValue: string,
): void {
  if (!txnHashOrVersion) return;
  void queryClient.prefetchQuery(
    transactionQueryOptions(txnHashOrVersion, client, networkValue),
  );
}

function searchRecord(search: unknown): Record<string, string | undefined> {
  if (typeof search === "string") {
    return Object.fromEntries(new URLSearchParams(search));
  }
  if (search && typeof search === "object") {
    const result: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(
      search as Record<string, unknown>,
    )) {
      if (typeof value === "string") {
        result[key] = value;
      } else if (typeof value === "number" || typeof value === "boolean") {
        result[key] = String(value);
      }
    }
    return result;
  }
  return {};
}

function routeParam(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Route-loader helper: start account prefetches and return immediately. */
export function loadAccountPagePrefetch(args: {
  address: unknown;
  queryClient: QueryClient;
  search: unknown;
}): {networkName: NetworkName} {
  const search = searchRecord(args.search);
  const client = getClientFromSearch(search);
  const networkName = getNetworkFromSearch(search);
  const networkValue = networks[networkName];
  const address = tryStandardizeRouteAddress(routeParam(args.address));
  const page = Number(search.page) || 1;
  if (address) {
    prefetchAccountPageData({
      queryClient: args.queryClient,
      address,
      client,
      networkName,
      networkValue,
      page,
    });
  }
  return {networkName};
}

/** Route-loader helper: start transaction prefetch and return immediately. */
export function loadTransactionPagePrefetch(args: {
  txnHashOrVersion: unknown;
  queryClient: QueryClient;
  search: unknown;
}): {networkName: NetworkName} {
  const search = searchRecord(args.search);
  const client = getClientFromSearch(search);
  const networkName = getNetworkFromSearch(search);
  const networkValue = networks[networkName];
  prefetchTransactionPageData(
    args.queryClient,
    routeParam(args.txnHashOrVersion),
    client,
    networkValue,
  );
  return {networkName};
}
