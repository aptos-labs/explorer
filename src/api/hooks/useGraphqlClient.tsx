import React from "react";
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import {getApiKey, NetworkName} from "../../constants";
import {useNetworkName} from "../../global-config/GlobalConfig";
import {ApolloProvider} from "@apollo/client/react";

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

function getGraphqlClient(networkName: NetworkName): ApolloClient {
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

export function useGetGraphqlClient() {
  const networkName = useNetworkName();

  // Calculate graphqlClient during render instead of using useEffect
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
