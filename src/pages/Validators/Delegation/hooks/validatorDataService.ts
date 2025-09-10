import {Types} from "aptos";
import {
  ApolloClient,
  gql,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from "@apollo/client";
import {tryStandardizeAddress} from "../../../../utils";
import {getGraphqlURI} from "../../../../api/hooks/useGraphqlClient";
import {NetworkName, getApiKey} from "../../../../constants";
import {AptosClient} from "aptos";

// Interface for delegator count response
interface DelegatorCountItem {
  pool_address: string;
  num_active_delegator: string;
}

// Create a GraphQL client instance
function createGraphqlClient(networkName: NetworkName): ApolloClient {
  const apiKey = getApiKey(networkName);

  // Middleware to attach the authorization token
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
 * Batch fetch delegator counts for multiple validators
 * @param validatorAddresses Array of validator addresses
 * @param client AptosClient instance
 * @param networkName Network name
 * @returns Array of delegator counts in the same order as the input addresses
 * @throws Error if the API request fails
 */
export async function getBatchDelegatorCounts(
  validatorAddresses: Types.Address[],
  client: AptosClient,
  networkName: NetworkName,
): Promise<number[]> {
  if (!validatorAddresses.length) return [];

  try {
    // Standardize addresses
    const formattedAddresses = validatorAddresses.map(
      (addr) => `"${tryStandardizeAddress(addr)}"`,
    );

    // Create GraphQL client with the provided network name
    const apolloClient = createGraphqlClient(networkName);

    // Execute GraphQL query using the correct field name
    const {data} = await apolloClient.query<{
      num_active_delegator_per_pool: DelegatorCountItem[];
    }>({
      query: gql`
          query GetDelegatorCounts {
              num_active_delegator_per_pool(
                  where: {pool_address: {_in: [${formattedAddresses.join(",")}]}}
              ) {
                  pool_address
                  num_active_delegator
              }
          }
      `,
    });

    // Process and return results
    const delegatorCounts = data?.num_active_delegator_per_pool ?? [];
    const addressToCountMap = new Map<string, number>();

    delegatorCounts.forEach((item) => {
      const addr = tryStandardizeAddress(item.pool_address);
      if (!addr) return;
      addressToCountMap.set(addr, parseInt(item.num_active_delegator));
    });

    // Map results back to original order, with missing values as 0
    return validatorAddresses.map((addr) => {
      const standardizedAddr = tryStandardizeAddress(addr);
      if (!standardizedAddr) return 0;
      return addressToCountMap.get(standardizedAddr) || 0;
    });
  } catch (error) {
    console.error("Error fetching delegator counts:", error);
    throw error;
  }
}

/**
 * Process validator addresses in batches to avoid exceeding argument limits
 * @param userAddress User wallet address
 * @param validatorAddresses Array of validator addresses
 * @param client AptosClient instance
 * @param batchSize Maximum number of validators to process in a single batch
 * @returns Array of user stake amounts in the same order as the input addresses
 */
async function processUserStakesBatched(
  userAddress: Types.Address,
  validatorAddresses: Types.Address[],
  client: AptosClient,
  batchSize: number = 10,
): Promise<number[]> {
  const results: number[] = [];

  // Process validators in batches
  for (let i = 0; i < validatorAddresses.length; i += batchSize) {
    const batch = validatorAddresses.slice(i, i + batchSize);
    const batchResults: number[] = [];

    // Process each validator individually with correct argument order
    for (const validatorAddress of batch) {
      try {
        // Prepare view function payload for this validator
        const payload = {
          function: "0x1::delegation_pool::get_stake",
          type_arguments: [],
          arguments: [validatorAddress, userAddress],
        };

        // Execute view function for this validator
        const response = (await client.view(payload)) as Types.MoveValue[];

        // Process result - sum up all stake values
        if (Array.isArray(response) && response.length > 0) {
          // Sum up all stake values - convert each MoveValue to a number first
          let sum = 0;
          for (const stake of response) {
            sum += Number(stake.toString());
          }

          // Convert from octas to APT (8 decimal places)
          // Use integer math to avoid floating point precision issues
          const totalStake = Math.floor(sum) / 100000000;

          batchResults.push(totalStake);
        } else {
          batchResults.push(0);
        }
      } catch (error) {
        console.error(
          `Error fetching user stake for validator ${validatorAddress}:`,
          error,
        );
        // Use 0 for this validator to maintain order
        batchResults.push(0);
      }
    }

    results.push(...batchResults);
  }

  return results;
}

/**
 * Batch fetch user stakes for multiple validators
 * @param userAddress User wallet address
 * @param validatorAddresses Array of validator addresses
 * @param client AptosClient instance
 * @returns Array of user stake amounts in the same order as the input addresses
 * @throws Error if all API requests fail
 */
export async function getBatchUserStakes(
  userAddress: Types.Address,
  validatorAddresses: Types.Address[],
  client: AptosClient,
): Promise<number[]> {
  if (!userAddress || !validatorAddresses.length) return [];

  try {
    // Process validators in batches to avoid exceeding argument limits
    return await processUserStakesBatched(
      userAddress,
      validatorAddresses,
      client,
    );
  } catch (error) {
    console.error("Error fetching user stakes:", error);
    throw error;
  }
}
