import {useQuery} from "@tanstack/react-query";
import {useNetworkValue, useSdkV2Client} from "../../global-config";
import {tryStandardizeAddress} from "../../utils";

export type AccountCoinActivity = {
  transaction_version: number;
  event_index: number;
  type: string;
  amount: number | null;
  asset_type: string;
};

const ACCOUNT_COIN_ACTIVITIES_QUERY = `
  query GetAccountCoinActivities($owner: String!, $asset: String!, $limit: Int!, $offset: Int!) {
    fungible_asset_activities(
      where: {
        owner_address: {_eq: $owner}
        asset_type: {_eq: $asset}
        type: {_neq: "0x1::aptos_coin::GasFeeEvent"}
      }
      limit: $limit
      offset: $offset
      order_by: [{transaction_version: desc}, {event_index: desc}]
    ) {
      transaction_version
      event_index
      type
      amount
      asset_type
    }
  }
`;

const ACCOUNT_COIN_ACTIVITIES_COUNT_QUERY = `
  query GetAccountCoinActivitiesCount($owner: String!, $asset: String!) {
    fungible_asset_activities_aggregate(
      where: {
        owner_address: {_eq: $owner}
        asset_type: {_eq: $asset}
        type: {_neq: "0x1::aptos_coin::GasFeeEvent"}
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

export function useGetAccountCoinActivities(
  address: string,
  assetType: string,
  limit: number,
  offset: number,
): {
  isLoading: boolean;
  error: Error | undefined;
  data: AccountCoinActivity[] | undefined;
} {
  const addr = tryStandardizeAddress(address);
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();

  const {isLoading, error, data} = useQuery({
    queryKey: [
      "accountCoinActivities",
      addr,
      assetType,
      limit,
      offset,
      networkValue,
    ],
    queryFn: () =>
      client.queryIndexer<{
        fungible_asset_activities: AccountCoinActivity[];
      }>({
        query: {
          query: ACCOUNT_COIN_ACTIVITIES_QUERY,
          variables: {owner: addr, asset: assetType, limit, offset},
        },
      }),
    enabled: !!addr && assetType.length > 0,
  });

  return {
    isLoading,
    error: error ? (error as Error) : undefined,
    data: data?.fungible_asset_activities,
  };
}

export function useGetAccountCoinActivitiesCount(
  address: string,
  assetType: string,
): number | undefined {
  const addr = tryStandardizeAddress(address);
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();

  const {data} = useQuery({
    queryKey: ["accountCoinActivitiesCount", addr, assetType, networkValue],
    queryFn: () =>
      client.queryIndexer<{
        fungible_asset_activities_aggregate: {aggregate: {count: number}};
      }>({
        query: {
          query: ACCOUNT_COIN_ACTIVITIES_COUNT_QUERY,
          variables: {owner: addr, asset: assetType},
        },
      }),
    enabled: !!addr && assetType.length > 0,
  });

  return data?.fungible_asset_activities_aggregate?.aggregate?.count;
}
