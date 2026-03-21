import type {Aptos} from "@aptos-labs/ts-sdk";
import {
  activityTypesForDirection,
  buildEdgesFromBatches,
  type FaActivityRow,
  type FlowDirection,
  type TokenFlowEdge,
} from "../utils/tokenFlowGraph";
import {tryStandardizeAddress} from "../utils";

const SEED_QUERY = `
query TokenFlowSeedActivities(
  $owner: String!
  $asset: String!
  $types: [String!]!
  $from: timestamptz!
  $to: timestamptz!
  $limit: Int!
) {
  fungible_asset_activities(
    where: {
      _and: [
        { owner_address: { _eq: $owner } }
        { asset_type: { _eq: $asset } }
        { type: { _in: $types } }
        { transaction_timestamp: { _gte: $from, _lte: $to } }
      ]
    }
    order_by: { transaction_version: desc }
    limit: $limit
  ) {
    transaction_version
    transaction_timestamp
    owner_address
    type
    amount
  }
}
`;

const BATCH_QUERY = `
query TokenFlowBatch($asset: String!, $versions: [bigint!]!) {
  fungible_asset_activities(
    where: {
      _and: [
        { asset_type: { _eq: $asset } }
        { transaction_version: { _in: $versions } }
      ]
    }
  ) {
    transaction_version
    transaction_timestamp
    owner_address
    type
    amount
  }
}
`;

type SeedResponse = {
  fungible_asset_activities: FaActivityRow[];
};

type BatchResponse = {
  fungible_asset_activities: FaActivityRow[];
};

const BATCH_SIZE = 40;

export type FetchTokenFlowGraphInput = {
  owner: string;
  assetType: string;
  direction: FlowDirection;
  fromIso: string;
  toIso: string;
  /** Cap seed rows from indexer (each may share txn version). */
  seedLimit: number;
};

function uniqueVersions(rows: FaActivityRow[], max: number): number[] {
  const seen = new Set<number>();
  for (const r of rows) {
    seen.add(r.transaction_version);
    if (seen.size >= max) {
      break;
    }
  }
  return [...seen];
}

async function fetchBatch(
  client: Aptos,
  asset: string,
  versions: number[],
): Promise<FaActivityRow[]> {
  if (versions.length === 0) {
    return [];
  }
  const data = await client.queryIndexer<BatchResponse>({
    query: {
      query: BATCH_QUERY,
      variables: {
        asset,
        versions,
      },
    },
  });
  return data.fungible_asset_activities ?? [];
}

export async function fetchTokenFlowEdgesFromIndexer(
  client: Aptos,
  input: FetchTokenFlowGraphInput,
): Promise<TokenFlowEdge[]> {
  const owner = tryStandardizeAddress(input.owner) ?? input.owner;
  const asset = input.assetType.trim();
  const types = activityTypesForDirection(input.direction);

  const seed = await client.queryIndexer<SeedResponse>({
    query: {
      query: SEED_QUERY,
      variables: {
        owner,
        asset,
        types,
        from: input.fromIso,
        to: input.toIso,
        limit: input.seedLimit,
      },
    },
  });

  const seedRows = seed.fungible_asset_activities ?? [];
  const versions = uniqueVersions(seedRows, input.seedLimit);

  const batches = new Map<number, FaActivityRow[]>();
  for (let i = 0; i < versions.length; i += BATCH_SIZE) {
    const slice = versions.slice(i, i + BATCH_SIZE);
    const batchRows = await fetchBatch(client, asset, slice);
    for (const row of batchRows) {
      const v = row.transaction_version;
      const list = batches.get(v) ?? [];
      list.push(row);
      batches.set(v, list);
    }
  }

  return buildEdgesFromBatches({
    center: owner,
    direction: input.direction,
    batches,
  });
}
