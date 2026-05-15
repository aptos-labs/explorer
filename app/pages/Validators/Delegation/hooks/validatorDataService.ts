import type {Types} from "~/types/aptos";
import type {AptosClient} from "../../../../api/legacyClient";
import type {NetworkName} from "../../../../constants";
import {getCachedV2Client} from "../../../../global-config";
import {tryStandardizeAddress} from "../../../../utils";

// Interface for delegator count response
interface DelegatorCountItem {
  pool_address: string;
  num_active_delegator: string;
}

const DELEGATOR_COUNTS_QUERY = `
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
  networkName: NetworkName,
): Promise<number[]> {
  if (!validatorAddresses.length) return [];

  try {
    const formattedAddresses = validatorAddresses.map(
      (addr) => tryStandardizeAddress(addr) ?? addr,
    );

    const client = getCachedV2Client(networkName);

    const data = await client.queryIndexer<{
      num_active_delegator_per_pool: DelegatorCountItem[];
    }>({
      query: {
        query: DELEGATOR_COUNTS_QUERY,
        variables: {addresses: formattedAddresses},
      },
    });

    const delegatorCounts = data?.num_active_delegator_per_pool ?? [];
    const addressToCountMap = new Map<string, number>();

    delegatorCounts.forEach((item) => {
      const addr = tryStandardizeAddress(item.pool_address);
      if (!addr) return;
      addressToCountMap.set(addr, parseInt(item.num_active_delegator, 10));
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

async function fetchSingleUserStake(
  userAddress: Types.Address,
  validatorAddress: Types.Address,
  client: AptosClient,
): Promise<number> {
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
      return Math.floor(sum) / 100000000;
    }
    return 0;
  } catch (error) {
    console.error(
      `Error fetching user stake for validator ${validatorAddress}:`,
      error,
    );
    return 0;
  }
}

/**
 * Process validator addresses in concurrent batches to avoid overwhelming the API
 * while still being significantly faster than serial execution.
 */
async function processUserStakesBatched(
  userAddress: Types.Address,
  validatorAddresses: Types.Address[],
  client: AptosClient,
  batchSize: number = 25,
): Promise<number[]> {
  const results: number[] = [];

  for (let i = 0; i < validatorAddresses.length; i += batchSize) {
    const batch = validatorAddresses.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((validatorAddress) =>
        fetchSingleUserStake(userAddress, validatorAddress, client),
      ),
    );
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
