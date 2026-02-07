import {Types} from "~/types/aptos";
import {gql} from "graphql-request";
import {tryStandardizeAddress} from "../../../../utils";
import {getGraphqlClient} from "../../../../api/hooks/useGraphqlClient";
import {NetworkName} from "../../../../constants";
import {AptosClient} from "../../../../api/legacyClient";

// Interface for delegator count response
interface DelegatorCountItem {
  pool_address: string;
  num_active_delegator: string;
}

const DELEGATOR_COUNTS_QUERY = gql`
  query GetDelegatorCounts($addresses: [String!]!) {
    num_active_delegator_per_pool(where: {pool_address: {_in: $addresses}}) {
      pool_address
      num_active_delegator
    }
  }
`;

/**
 * Batch fetch delegator counts for multiple validators
 */
export async function getBatchDelegatorCounts(
  validatorAddresses: Types.Address[],
  client: AptosClient,
  networkName: NetworkName,
): Promise<number[]> {
  if (!validatorAddresses.length) return [];

  try {
    const formattedAddresses = validatorAddresses.map(
      (addr) => tryStandardizeAddress(addr) ?? addr,
    );

    const graphqlClient = getGraphqlClient(networkName);

    const data = await graphqlClient.request<{
      num_active_delegator_per_pool: DelegatorCountItem[];
    }>(DELEGATOR_COUNTS_QUERY, {addresses: formattedAddresses});

    const delegatorCounts = data?.num_active_delegator_per_pool ?? [];
    const addressToCountMap = new Map<string, number>();

    delegatorCounts.forEach((item) => {
      const addr = tryStandardizeAddress(item.pool_address);
      if (!addr) return;
      addressToCountMap.set(addr, parseInt(item.num_active_delegator));
    });

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
 * Process validator addresses in batches
 */
async function processUserStakesBatched(
  userAddress: Types.Address,
  validatorAddresses: Types.Address[],
  client: AptosClient,
  batchSize: number = 10,
): Promise<number[]> {
  const results: number[] = [];

  for (let i = 0; i < validatorAddresses.length; i += batchSize) {
    const batch = validatorAddresses.slice(i, i + batchSize);
    const batchResults: number[] = [];

    for (const validatorAddress of batch) {
      try {
        const payload = {
          function: "0x1::delegation_pool::get_stake",
          type_arguments: [],
          arguments: [validatorAddress, userAddress],
        };

        const response = (await client.view(payload)) as Types.MoveValue[];

        if (Array.isArray(response) && response.length > 0) {
          let sum = 0;
          for (const stake of response) {
            sum += Number(stake.toString());
          }
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
        batchResults.push(0);
      }
    }

    results.push(...batchResults);
  }

  return results;
}

/**
 * Batch fetch user stakes for multiple validators
 */
export async function getBatchUserStakes(
  userAddress: Types.Address,
  validatorAddresses: Types.Address[],
  client: AptosClient,
): Promise<number[]> {
  if (!userAddress || !validatorAddresses.length) return [];

  try {
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
