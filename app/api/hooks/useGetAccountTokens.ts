import {useNetworkValue, useSdkV2Client} from "../../global-config";
import {useQuery} from "@tanstack/react-query";
import {tryStandardizeAddress} from "../../utils";
import {GetTokenActivityResponse} from "@aptos-labs/ts-sdk";

/* eslint-disable @typescript-eslint/no-explicit-any */

// --- Inlined queries from former IndexerClient ---

const ACCOUNT_TOKENS_COUNT_QUERY = `
  query GetAccountTokensCount($owner: String!) {
    current_token_ownerships_v2_aggregate(
      where: {owner_address: {_eq: $owner}, amount: {_gt: "0"}}
    ) {
      aggregate {
        count
      }
    }
  }
`;

const OWNED_TOKENS_QUERY = `
  query GetOwnedTokens(
    $owner: String!
    $limit: Int
    $offset: Int
    $order_by: [current_token_ownerships_v2_order_by!]
  ) {
    current_token_ownerships_v2(
      where: {owner_address: {_eq: $owner}, amount: {_gt: 0}}
      limit: $limit
      offset: $offset
      order_by: $order_by
    ) {
      token_data_id
      token_standard
      amount
      owner_address
      last_transaction_version
      last_transaction_timestamp
      current_token_data {
        token_data_id
        token_name
        token_uri
        token_standard
        description
        current_collection {
          collection_id
          collection_name
          creator_address
          uri
        }
      }
    }
  }
`;

const TOKEN_DATA_QUERY = `
  query GetTokenData($token_data_id: String!) {
    current_token_datas_v2(where: {token_data_id: {_eq: $token_data_id}}) {
      token_data_id
      token_name
      token_uri
      token_standard
      largest_property_version_v1
      token_properties
      last_transaction_version
      last_transaction_timestamp
      description
      current_collection {
        collection_id
        collection_name
        creator_address
        current_supply
        max_supply
        uri
        description
      }
    }
  }
`;

const TOKEN_OWNERS_QUERY = `
  query GetTokenOwnersData($token_data_id: String!) {
    current_token_ownerships_v2(
      where: {token_data_id: {_eq: $token_data_id}, amount: {_gt: "0"}}
    ) {
      owner_address
      amount
      token_data_id
      token_standard
      last_transaction_version
    }
  }
`;

const TOKEN_ACTIVITIES_COUNT_QUERY = `
  query GetTokenActivitiesCount($token_id: String!) {
    token_activities_v2_aggregate(
      where: {token_data_id: {_eq: $token_id}}
    ) {
      aggregate {
        count
      }
    }
  }
`;

// --- Type for owned tokens ---

export type TokenOwnership = {
  token_data_id: string;
  token_standard: string;
  amount: number;
  owner_address: string;
  last_transaction_version: number;
  last_transaction_timestamp: string;
  property_version_v1?: string;
  table_type_v1?: string;
  current_token_data: {
    token_data_id: string;
    token_name: string;
    token_uri: string;
    token_standard: string;
    description: string;
    collection_id?: string;
    current_collection: {
      collection_id: string;
      collection_name: string;
      creator_address: string;
      uri: string;
    };
  };
};

// --- Hooks ---

export function useGetAccountTokensCount(address: string) {
  const networkValue = useNetworkValue();
  const client = useSdkV2Client();
  const addr64Hash = tryStandardizeAddress(address);
  return useQuery({
    queryKey: ["account_tokens_count", {addr64Hash}, networkValue],
    queryFn: async () => {
      const response = await client.queryIndexer<{
        current_token_ownerships_v2_aggregate: {
          aggregate: {count: number};
        };
      }>({
        query: {
          query: ACCOUNT_TOKENS_COUNT_QUERY,
          variables: {owner: addr64Hash},
        },
      });
      return (
        response?.current_token_ownerships_v2_aggregate?.aggregate?.count ?? 0
      );
    },
    enabled: !!addr64Hash,
  });
}

export function useGetAccountTokens(
  address: string,
  limit: number,
  offset?: number,
) {
  const networkValue = useNetworkValue();
  const client = useSdkV2Client();
  const addr64Hash = tryStandardizeAddress(address);
  return useQuery<TokenOwnership[]>({
    queryKey: ["account_tokens", {addr64Hash, limit, offset}, networkValue],
    queryFn: async () => {
      const response = await client.queryIndexer<{
        current_token_ownerships_v2: TokenOwnership[];
      }>({
        query: {
          query: OWNED_TOKENS_QUERY,
          variables: {
            owner: addr64Hash,
            limit,
            offset,
            order_by: [
              {last_transaction_version: "desc"},
              {token_data_id: "desc"},
            ],
          },
        },
      });
      return response?.current_token_ownerships_v2 ?? [];
    },
    enabled: !!addr64Hash,
  });
}

export function useGetTokenData(tokenDataId?: string) {
  const networkValue = useNetworkValue();
  const client = useSdkV2Client();
  return useQuery({
    queryKey: ["token_data", {tokenDataId}, networkValue],
    queryFn: async () => {
      const response = await client.queryIndexer<{
        current_token_datas_v2: any[];
      }>({
        query: {
          query: TOKEN_DATA_QUERY,
          variables: {token_data_id: tokenDataId!},
        },
      });
      return response?.current_token_datas_v2;
    },
    enabled: !!tokenDataId,
  });
}

export function useGetTokenOwners(tokenDataId?: string) {
  const networkValue = useNetworkValue();
  const client = useSdkV2Client();
  return useQuery({
    queryKey: ["token_owners", {tokenDataId}, networkValue],
    queryFn: async () => {
      const response = await client.queryIndexer<{
        current_token_ownerships_v2: any[];
      }>({
        query: {
          query: TOKEN_OWNERS_QUERY,
          variables: {token_data_id: tokenDataId!},
        },
      });
      return response?.current_token_ownerships_v2 ?? [];
    },
    enabled: !!tokenDataId,
  });
}

export function useGetTokenActivitiesCount(tokenDataId: string) {
  const networkValue = useNetworkValue();
  const client = useSdkV2Client();
  return useQuery({
    queryKey: ["token_activities_count", {tokenDataId}, networkValue],
    queryFn: async () => {
      const response = await client.queryIndexer<{
        token_activities_v2_aggregate: {
          aggregate: {count: number};
        };
      }>({
        query: {
          query: TOKEN_ACTIVITIES_COUNT_QUERY,
          variables: {token_id: tokenDataId},
        },
      });
      return response?.token_activities_v2_aggregate?.aggregate?.count ?? 0;
    },
    enabled: !!tokenDataId,
  });
}

export function useGetTokenActivities(
  tokenDataId: string,
  limit: number,
  offset?: number,
) {
  const networkValue = useNetworkValue();
  const sdkV2Client = useSdkV2Client();
  return useQuery({
    queryKey: ["token_activities", {tokenDataId, limit, offset}, networkValue],
    queryFn: async () => {
      const response: GetTokenActivityResponse =
        await sdkV2Client.getDigitalAssetActivity({
          digitalAssetAddress: tokenDataId,
          options: {
            limit,
            offset,
            orderBy: [
              {
                transaction_version: "desc",
              },
            ],
          },
        });
      return response;
    },
  });
}
