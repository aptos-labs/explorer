import React from "react";
import {GraphQLClient} from "graphql-request";
import {getApiKey, NetworkName} from "../../constants";
import {useNetworkName} from "../../global-config";

function getIsGraphqlClientSupportedFor(networkName: NetworkName): boolean {
  const graphqlUri = getGraphqlURI(networkName);
  return typeof graphqlUri === "string" && graphqlUri.length > 0;
}

export function getGraphqlURI(networkName: NetworkName): string | undefined {
  switch (networkName) {
    case "mainnet":
      return "https://api.mainnet.aptoslabs.com/v1/graphql";
    case "testnet":
      return "https://api.testnet.staging.aptoslabs.com/v1/graphql";
    case "devnet":
      return "https://api.devnet.staging.aptoslabs.com/v1/graphql";
    case "decibel":
      return "https://api.netna.aptoslabs.com/v1/graphql";
    case "shelbynet":
      return "https://api.shelbynet.staging.shelby.xyz/v1/graphql";
    case "local":
      return "http://127.0.0.1:8090/v1/graphql";
    default:
      return undefined;
  }
}

// Cache GraphQL clients per network
const clientCache = new Map<NetworkName, GraphQLClient>();

function createGraphqlClient(networkName: NetworkName): GraphQLClient {
  const apiKey = getApiKey(networkName);
  const uri = getGraphqlURI(networkName) ?? "";
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }
  return new GraphQLClient(uri, {headers});
}

/**
 * Get a cached GraphQL client for the given network.
 */
export function getGraphqlClient(networkName: NetworkName): GraphQLClient {
  if (!clientCache.has(networkName)) {
    clientCache.set(networkName, createGraphqlClient(networkName));
  }
  return clientCache.get(networkName)!;
}

export function useGetGraphqlClient(): GraphQLClient {
  const networkName = useNetworkName();
  return getGraphqlClient(networkName);
}

type GraphqlClientProviderProps = {
  children: React.ReactNode;
};

/**
 * No-op provider kept for backward compatibility.
 * Apollo has been removed; GraphQL queries now use graphql-request + TanStack Query.
 */
export function GraphqlClientProvider({children}: GraphqlClientProviderProps) {
  return <>{children}</>;
}

export function useGetIsGraphqlClientSupported(): boolean {
  const networkName = useNetworkName();
  return getIsGraphqlClientSupportedFor(networkName);
}
