import React from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  NormalizedCacheObject,
} from "@apollo/client";
import {useEffect, useState} from "react";
import {NetworkName} from "../../constants";
import {useGlobalState} from "../../GlobalState";

function getIsGraphqlClientSupportedFor(networkName: NetworkName): boolean {
  const graphqlUri = getGraphqlURI(networkName);
  return typeof graphqlUri === "string";
}

function getGraphqlURI(networkName: NetworkName): string | undefined {
  switch (networkName) {
    case "local":
      return undefined;
    case "devnet":
      return process.env.REACT_APP_INDEXER_GRAPHQL_DEVNET;
    case "testnet":
      return process.env.REACT_APP_INDEXER_GRAPHQL_TESTNET;
    case "premainnet":
      return process.env.REACT_APP_INDEXER_GRAPHQL_PREMAINNET;
    default:
      return undefined;
  }
}

function getGraphqlClient(
  networkName: NetworkName,
): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    link: new HttpLink({
      uri: getGraphqlURI(networkName),
    }),
    cache: new InMemoryCache(),
  });
}

export function useGetGraphqlClient() {
  const [state, _] = useGlobalState();
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
  const [state, _] = useGlobalState();
  const [isGraphqlClientSupported, setIsGraphqlClientSupported] =
    useState<boolean>(getIsGraphqlClientSupportedFor(state.network_name));

  useEffect(() => {
    setIsGraphqlClientSupported(
      getIsGraphqlClientSupportedFor(state.network_name),
    );
  }, [state.network_name]);

  return isGraphqlClientSupported;
}
