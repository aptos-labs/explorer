import React from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  NormalizedCacheObject,
} from "@apollo/client";
import {useEffect, useState} from "react";
import {defaultNetworkName, NetworkName} from "../../constants";
import {useGlobalState} from "../../GlobalState";

function getIsGraphqlClientSupportFor(networkName: NetworkName): boolean {
  switch (networkName) {
    case "local":
      return false;
    case "Devnet":
      return false;
    case "testnet":
      return true;
    case "premainnet":
      return false;
    case "ait3":
      return false;
    default:
      return false;
  }
}

function getGraphqlURI(networkName: NetworkName): string | undefined {
  switch (networkName) {
    case "local":
      return undefined;
    case "Devnet":
      return undefined;
    case "testnet":
      return process.env.REACT_APP_INDEXER_GRAPHQL_TESTNET;
    case "premainnet":
      return undefined;
    case "ait3":
      return undefined;
    default:
      return undefined;
  }
}

function getGraphqlSecret(networkName: NetworkName): string | undefined {
  switch (networkName) {
    case "local":
      return undefined;
    case "Devnet":
      return undefined;
    case "testnet":
      return process.env.REACT_APP_INDEXER_GRAPHQL_SECRET_TESTNET;
    case "premainnet":
      return undefined;
    case "ait3":
      return undefined;
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
      headers: {
        "x-hasura-admin-secret": getGraphqlSecret(networkName),
        "x-hasura-role": "anonymous",
      },
    }),
    cache: new InMemoryCache(),
  });
}

export function useGraphqlClient() {
  const [state, _] = useGlobalState();
  const [isGraphqlClientSupported, setIsGraphqlClientSupported] =
    useState<boolean>(false);
  const [graphqlClient, setGraphqlClient] = useState<
    ApolloClient<NormalizedCacheObject>
  >(getGraphqlClient(defaultNetworkName));

  useEffect(() => {
    setIsGraphqlClientSupported(
      getIsGraphqlClientSupportFor(state.network_name),
    );
    setGraphqlClient(getGraphqlClient(state.network_name));
  }, []);

  return {graphqlClient, isGraphqlClientSupported};
}

type GraphqlClientProviderProps = {
  children: React.ReactNode;
};

export function GraphqlClientProvider({children}: GraphqlClientProviderProps) {
  const {graphqlClient} = useGraphqlClient();

  return <ApolloProvider client={graphqlClient}>{children}</ApolloProvider>;
}
