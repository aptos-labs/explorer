/**
 * Minimal IndexerClient replacing the legacy `aptos` IndexerClient.
 *
 * Uses graphql-request (already in the project) to execute the same
 * GraphQL queries the explorer needs.  Only implements the methods
 * actually called by the codebase.
 */

import {GraphQLClient, gql} from "graphql-request";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface IndexerClientConfig {
  HEADERS?: Record<string, string>;
  TOKEN?: string;
}

export class IndexerClient {
  private readonly client: GraphQLClient;

  constructor(endpoint: string, config?: IndexerClientConfig) {
    const headers: Record<string, string> = {...config?.HEADERS};
    if (config?.TOKEN) {
      headers["Authorization"] = `Bearer ${config.TOKEN}`;
    }
    this.client = new GraphQLClient(endpoint, {headers});
  }

  // ------------------------------------------------------------------
  // Token counts
  // ------------------------------------------------------------------
  async getAccountTokensCount(ownerAddress: string) {
    const query = gql`
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
    return this.client.request<{
      current_token_ownerships_v2_aggregate: {
        aggregate: {count: number};
      };
    }>(query, {owner: ownerAddress});
  }

  // ------------------------------------------------------------------
  // Owned tokens
  // ------------------------------------------------------------------
  async getOwnedTokens(
    ownerAddress: string,
    extraArgs?: {
      options?: {limit?: number; offset?: number};
      orderBy?: any[];
    },
  ) {
    const query = gql`
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
    return this.client.request<{
      current_token_ownerships_v2: any[];
    }>(query, {
      owner: ownerAddress,
      limit: extraArgs?.options?.limit,
      offset: extraArgs?.options?.offset,
      order_by: extraArgs?.orderBy,
    });
  }

  // ------------------------------------------------------------------
  // Token data
  // ------------------------------------------------------------------
  async getTokenData(tokenDataId: string) {
    const query = gql`
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
    return this.client.request<{
      current_token_datas_v2: any[];
    }>(query, {token_data_id: tokenDataId});
  }

  // ------------------------------------------------------------------
  // Token owners
  // ------------------------------------------------------------------
  async getTokenOwnersData(
    tokenDataId: string,
    _propertyVersion?: number,
    _extraArgs?: any,
  ) {
    const query = gql`
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
    return this.client.request<{
      current_token_ownerships_v2: any[];
    }>(query, {token_data_id: tokenDataId});
  }

  // ------------------------------------------------------------------
  // Token activities count
  // ------------------------------------------------------------------
  async getTokenActivitiesCount(tokenDataId: string) {
    const query = gql`
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
    return this.client.request<{
      token_activities_v2_aggregate: {
        aggregate: {count: number};
      };
    }>(query, {token_id: tokenDataId});
  }
}
