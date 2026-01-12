import React from "react";
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import {getApiKey, getGraphqlURI, NetworkName} from "../../constants";
import {useNetworkName} from "../../global-config";
import {ApolloProvider} from "@apollo/client/react";

function getIsGraphqlClientSupportedFor(networkName: NetworkName): boolean {
  const graphqlUri = getGraphqlURI(networkName);
  return typeof graphqlUri === "string" && graphqlUri.length > 0;
}

// Re-export for consumers that were importing from here
export {getGraphqlURI} from "../../constants";

// Cache Apollo clients per network to preserve GraphQL cache across renders
const apolloClientCache = new Map<NetworkName, ApolloClient>();

function createGraphqlClient(networkName: NetworkName): ApolloClient {
  const apiKey = getApiKey(networkName);
  // Middleware to attach the authorization token.
  const authMiddleware = new ApolloLink((operation, forward) => {
    operation.setContext(({headers = {}}) => ({
      headers: {
        ...headers,
        ...(apiKey ? {authorization: `Bearer ${apiKey}`} : {}),
      },
    }));
    return forward(operation);
  });

  const httpLink = new HttpLink({
    uri: getGraphqlURI(networkName),
  });

  return new ApolloClient({
    link: ApolloLink.from([authMiddleware, httpLink]),
    cache: new InMemoryCache(),
  });
}

/**
 * Get a cached Apollo client for the given network.
 * Uses singleton pattern per network to preserve GraphQL cache.
 */
function getGraphqlClient(networkName: NetworkName): ApolloClient {
  if (!apolloClientCache.has(networkName)) {
    apolloClientCache.set(networkName, createGraphqlClient(networkName));
  }
  return apolloClientCache.get(networkName)!;
}

export function useGetGraphqlClient() {
  const networkName = useNetworkName();

  // Return cached client to preserve GraphQL cache across renders
  return getGraphqlClient(networkName);
}

type GraphqlClientProviderProps = {
  children: React.ReactNode;
};

export function GraphqlClientProvider({children}: GraphqlClientProviderProps) {
  const graphqlClient = useGetGraphqlClient();

  return <ApolloProvider client={graphqlClient}>{children}</ApolloProvider>;
}

export function useGetIsGraphqlClientSupported(): boolean {
  const networkName = useNetworkName();
  return getIsGraphqlClientSupportedFor(networkName);
}
