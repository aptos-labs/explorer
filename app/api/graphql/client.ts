import {GraphQLClient} from "graphql-request";
import {NetworkName, getApiKey, getGraphqlURI} from "../../lib/constants";

const HEADERS = {
  "x-indexer-client": "aptos-explorer",
};

// Cache for GraphQL client instances to prevent unnecessary recreations
const clientCache = new Map<string, GraphQLClient>();

/**
 * Get a GraphQL client for the specified network
 * Uses singleton pattern per network for efficiency
 */
export function getGraphqlClient(
  networkName: NetworkName,
): GraphQLClient | null {
  const endpoint = getGraphqlURI(networkName);

  if (!endpoint) {
    return null;
  }

  if (!clientCache.has(networkName)) {
    const apiKey = getApiKey(networkName);

    const client = new GraphQLClient(endpoint, {
      headers: {
        ...HEADERS,
        ...(apiKey ? {authorization: `Bearer ${apiKey}`} : {}),
      },
    });

    clientCache.set(networkName, client);
  }

  return clientCache.get(networkName)!;
}

/**
 * Check if GraphQL is supported for a given network
 */
export function isGraphqlSupported(networkName: NetworkName): boolean {
  const uri = getGraphqlURI(networkName);
  return typeof uri === "string" && uri.length > 0;
}

/**
 * Execute a GraphQL query
 */
export async function executeGraphqlQuery<T>(
  networkName: NetworkName,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const client = getGraphqlClient(networkName);

  if (!client) {
    throw new Error(`GraphQL is not supported for network: ${networkName}`);
  }

  return client.request<T>(query, variables);
}
