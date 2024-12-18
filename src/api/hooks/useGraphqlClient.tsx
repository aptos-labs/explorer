import React from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  NormalizedCacheObject,
  ApolloLink,
} from "@apollo/client";
import {useEffect, useState} from "react";
import {NetworkName} from "../../constants";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {getCustomParameters} from "../../../src/pages/layout/NetworkSelect";

function getIsGraphqlClientSupportedFor(networkName: NetworkName): boolean {
  const graphqlUri = getGraphqlURI(networkName);
  return typeof graphqlUri === "string" && graphqlUri.length > 0;
}

export function getGraphqlURI(networkName: NetworkName): string | undefined {
  const prefix = import.meta.env.REACT_APP_PREFIX || "";
  switch (networkName) {
    case "mainnet":
      return `https://rpc.sentio.xyz/movement-indexer/v1/graphql`;
    case "testnet":
      return (
        import.meta.env.PORTO_GRAPHQL ||
        `https://indexer.testnet.porto.movementnetwork.xyz/v1/graphql`
      );
    // case "bardock testnet":
    //   return (
    //     import.meta.env.BARDOCK_GRAPHQL ||
    //     `https://indexer.testnet.bardock.movementnetwork.xyz/v1/graphql`
    //   );
    case "devnet":
      return (
        import.meta.env.DEVNET_GRAPHQL ||
        `https://${prefix}aptos.devnet.suzuka.movementlabs.xyz/graphql`
      );
    case "local":
      return import.meta.env.LOCAL_GRAPHQL || "http://0.0.0.0:30731/graphql";
    case "mevmdevnet":
      return (
        import.meta.env.IMOLA_GRAPHQL ||
        `https://${prefix}aptos.devnet.imola.movementlabs.xyz/graphql`
      );
    case "custom":
      return getCustomParameters().graphqlUrl;

    default:
      return undefined;
  }
}

function getGraphqlClient(
  networkName: NetworkName,
): ApolloClient<NormalizedCacheObject> {
  // const apiKey = getApiKey(networkName);
  // Middleware to attach the authorization token.
  const authMiddleware = new ApolloLink((operation, forward) => {
    operation.setContext(({headers = {}}) => ({
      headers: {
        ...headers,
        // ...(apiKey ? {authorization: `Bearer ${apiKey}`} : {}),
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
  const [isGraphqlClientSupported, setIsGraphqlClientSupported] =
    useState<boolean>(getIsGraphqlClientSupportedFor(state.network_name));

  useEffect(() => {
    setIsGraphqlClientSupported(
      getIsGraphqlClientSupportedFor(state.network_name),
    );
  }, [state.network_name]);

  return isGraphqlClientSupported;
}
