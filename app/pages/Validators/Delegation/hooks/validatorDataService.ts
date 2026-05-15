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

const USER_DELEGATOR_POOLS_QUERY = `
  query GetUserDelegatorPools($address: String!) {
    delegator_distinct_pool(where: {delegator_address: {_eq: $address}}) {
      pool_address
    }
  }
`;

/**
 * Fetch the set of pool addresses the user has any delegation position in,
 * using the indexer. This is a single GraphQL request that lets us avoid
 * blasting ~150 sequential `get_stake` view calls (the cause of the
 * minute-long delay when the wallet is connected).
 */
async function getUserDelegatorPools(
  userAddress: Types.Address,
  networkName: NetworkName,
): Promise<Set<string>> {
  const normalizedUser = tryStandardizeAddress(userAddress) ?? userAddress;
  const client = getCachedV2Client(networkName);
  const data = await client.queryIndexer<{
    delegator_distinct_pool: Array<{pool_address: string}>;
  }>({
    query: {
      query: USER_DELEGATOR_POOLS_QUERY,
      variables: {address: normalizedUser},
    },
  });

  const pools = data?.delegator_distinct_pool ?? [];
  const result = new Set<string>();
  for (const pool of pools) {
    const normalized = tryStandardizeAddress(pool.pool_address);
    if (normalized) result.add(normalized);
  }
  return result;
}

/**
 * Fetch the user's stake for a single pool via the `get_stake` view function.
 */
async function fetchUserStakeForPool(
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
    if (!Array.isArray(response) || response.length === 0) return 0;
    let sum = 0;
    for (const stake of response) {
      sum += Number(stake.toString());
    }
    return Math.floor(sum) / 100000000;
  } catch (error) {
    console.error(
      `Error fetching user stake for validator ${validatorAddress}:`,
      error,
    );
    return 0;
  }
}

/**
 * Batch fetch user stakes for multiple validators.
 *
 * Uses the indexer to first identify the (typically small) subset of pools
 * the connected wallet has any position in, then issues one `get_stake`
 * view call per such pool in parallel. Validators the wallet has never
 * delegated to default to `0` without any view call.
 *
 * If the indexer query fails we fall back to returning zeros so the table
 * still renders even when the wallet is connected; the per-pool data will
 * surface on the individual validator page where view calls are scoped.
 */
export async function getBatchUserStakes(
  userAddress: Types.Address,
  validatorAddresses: Types.Address[],
  client: AptosClient,
  networkName: NetworkName,
): Promise<number[]> {
  if (!userAddress || !validatorAddresses.length) return [];

  let userPools: Set<string>;
  try {
    userPools = await getUserDelegatorPools(userAddress, networkName);
  } catch (error) {
    console.error(
      "Error fetching user delegator pools from indexer; defaulting to 0 stakes",
      error,
    );
    return validatorAddresses.map(() => 0);
  }

  if (userPools.size === 0) {
    return validatorAddresses.map(() => 0);
  }

  const stakeByPool = new Map<string, number>();
  const poolsToFetch = validatorAddresses
    .map((addr) => ({
      raw: addr,
      normalized: tryStandardizeAddress(addr),
    }))
    .filter(
      (entry): entry is {raw: Types.Address; normalized: string} =>
        !!entry.normalized && userPools.has(entry.normalized),
    );

  await Promise.all(
    poolsToFetch.map(async ({raw, normalized}) => {
      const stake = await fetchUserStakeForPool(userAddress, raw, client);
      stakeByPool.set(normalized, stake);
    }),
  );

  return validatorAddresses.map((addr) => {
    const normalized = tryStandardizeAddress(addr);
    if (!normalized) return 0;
    return stakeByPool.get(normalized) ?? 0;
  });
}
