import type React from "react";
import {getGraphqlURI, type NetworkName} from "../../constants";
import {useNetworkName} from "../../global-config";

function getIsGraphqlClientSupportedFor(networkName: NetworkName): boolean {
  const graphqlUri = getGraphqlURI(networkName);
  return typeof graphqlUri === "string" && graphqlUri.length > 0;
}

type GraphqlClientProviderProps = {
  children: React.ReactNode;
};

/**
 * No-op provider kept for backward compatibility.
 * GraphQL queries now use @aptos-labs/ts-sdk queryIndexer + TanStack Query.
 */
export function GraphqlClientProvider({children}: GraphqlClientProviderProps) {
  return <>{children}</>;
}

export function useGetIsGraphqlClientSupported(): boolean {
  const networkName = useNetworkName();
  return getIsGraphqlClientSupportedFor(networkName);
}
