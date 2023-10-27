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
import {useGlobalState} from "../../global-config/GlobalConfig";

function getIsGraphqlClientSupportedFor(networkName: NetworkName): boolean {
  const graphqlUri = getGraphqlURI(networkName);
  return typeof graphqlUri === "string" && graphqlUri.length > 0;
}

export function getGraphqlURI(
  networkName: NetworkName,
  browserUri?: string,
): string | undefined {
  // todo(jill): change to permanent unified api
  if (browserUri && browserUri.includes("txn_indexer")) {
    return "http://localhost:4003";
  }

  switch (networkName) {
    case "mainnet":
      return "https://indexer.mainnet.aptoslabs.com/v1/graphql";
    case "testnet":
      return "https://indexer-testnet.staging.gcp.aptosdev.com/v1/graphql";
    case "devnet":
      return "https://indexer-devnet.staging.gcp.aptosdev.com/v1/graphql";
    case "local":
      return undefined;
    default:
      return undefined;
  }
}

function getGraphqlClient(
  networkName: NetworkName,
  browserUri: string,
): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    link: new HttpLink({
      uri: getGraphqlURI(networkName, browserUri),
    }),
    cache: new InMemoryCache(),
  });
}

export function useGetGraphqlClient(browserUri: string) {
  const [state] = useGlobalState();
  const [graphqlClient, setGraphqlClient] = useState<
    ApolloClient<NormalizedCacheObject>
  >(getGraphqlClient(state.network_name, browserUri));

  useEffect(() => {
    setGraphqlClient(getGraphqlClient(state.network_name, browserUri));
  }, [state.network_name, browserUri]);

  return graphqlClient;
}

type GraphqlClientProviderProps = {
  children: React.ReactNode;
  browserUri: string;
};

export function GraphqlClientProvider({
  browserUri,
  children,
}: GraphqlClientProviderProps) {
  const graphqlClient = useGetGraphqlClient(browserUri);

  return <ApolloProvider client={graphqlClient}>{children}</ApolloProvider>;
}

export function useGetIsGraphqlClientSupported(): boolean {
  const [state] = useGlobalState();
  const [isGraphqlClientSupported, setIsGraphqlClientSupported] =
    useState<boolean>(getIsGraphqlClientSupportedFor(state.network_name));

  useEffect(() => {
    setIsGraphqlClientSupported(
      getIsGraphqlClientSupportedFor(state.network_name),
    );
  }, [state.network_name]);

  return isGraphqlClientSupported;
}
