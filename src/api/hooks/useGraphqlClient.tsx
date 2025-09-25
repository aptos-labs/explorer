import React, {useEffect, useState} from "react";
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import {getApiKey, NetworkName} from "../../constants";
import {useGlobalState} from "../../global-config/GlobalConfig";

function getIsGraphqlClientSupportedFor(networkName: NetworkName): boolean {
  const graphqlUri = getGraphqlURI(networkName);
  return typeof graphqlUri === "string" && graphqlUri.length > 0;
}

export function getGraphqlURI(networkName: NetworkName): string | undefined {
  switch (networkName) {
    case "mainnet":
      return "https://mainnet.libra2.org/v1/graphql";
    case "testnet":
      return "https://testnet.libra2.org/v1/graphql";
    case "devnet":
      return "https://devnet.libra2.org/v1/graphql";
    case "local":
    case "localnet":
      return "http://127.0.0.1:8090/v1/graphql";
    default:
      return undefined;
  }
}

function getGraphqlClient(
  networkName: NetworkName,
): ApolloClient<NormalizedCacheObject> {
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
  const [state] = useGlobalState();
  const [graphqlClient, setGraphqlClient] = useState<
    ApolloClient<NormalizedCacheObject>
  >(getGraphqlClient(state.network_name));

  useEffect(() => {
    setGraphqlClient(getGraphqlClient(state.network_name));
  }, [state.network_name]);

  return graphqlClient;
}

type GraphqlClientProviderProps = {
  children: React.ReactNode;
};

export function GraphqlClientProvider({children}: GraphqlClientProviderProps) {
  const graphqlClient = useGetGraphqlClient();

  return <ApolloProvider client={graphqlClient}>{children}</ApolloProvider>;
}

export function useGetIsGraphqlClientSupported(): boolean {
  const [state] = useGlobalState();
  return getIsGraphqlClientSupportedFor(state.network_name);
}
