import {gql} from "graphql-request";

/**
 * GraphQL queries for the Aptos Explorer
 * These replace the Apollo Client queries used in the original codebase
 */

// Account Queries
export const GET_ACCOUNT_COINS = gql`
  query GetAccountCoins($address: String!, $offset: Int, $limit: Int) {
    current_fungible_asset_balances(
      where: {owner_address: {_eq: $address}, amount: {_gt: "0"}}
      offset: $offset
      limit: $limit
      order_by: [{amount: desc}]
    ) {
      asset_type
      amount
      metadata {
        asset_type
        name
        symbol
        decimals
        icon_uri
      }
    }
  }
`;

export const GET_ACCOUNT_TOKENS = gql`
  query GetAccountTokens($address: String!, $offset: Int, $limit: Int) {
    current_token_ownerships_v2(
      where: {owner_address: {_eq: $address}, amount: {_gt: "0"}}
      offset: $offset
      limit: $limit
      order_by: [{last_transaction_timestamp: desc}]
    ) {
      token_data_id
      amount
      current_token_data {
        token_name
        collection_id
        token_uri
        description
        current_collection {
          collection_name
          creator_address
        }
      }
      last_transaction_timestamp
    }
  }
`;

// Transaction Queries
export const GET_USER_TRANSACTIONS = gql`
  query GetUserTransactions($limit: Int!, $start_version: bigint) {
    user_transactions(
      limit: $limit
      where: {version: {_lt: $start_version}}
      order_by: {version: desc}
    ) {
      version
      sender
      entry_function_id_str
      timestamp
    }
  }
`;

export const GET_ACCOUNT_TRANSACTIONS = gql`
  query GetAccountTransactions($address: String!, $limit: Int!, $offset: Int) {
    account_transactions(
      where: {account_address: {_eq: $address}}
      limit: $limit
      offset: $offset
      order_by: {transaction_version: desc}
    ) {
      transaction_version
    }
  }
`;

// Validator Queries
export const GET_DELEGATED_STAKING_POOLS = gql`
  query GetDelegatedStakingPools($limit: Int, $offset: Int) {
    delegated_staking_pools(
      limit: $limit
      offset: $offset
      order_by: {staking_pool_address: asc}
    ) {
      staking_pool_address
      current_staking_pool_voter {
        voter_address
        operator_address
      }
    }
  }
`;

export const GET_NUMBER_OF_DELEGATORS = gql`
  query GetNumberOfDelegators($poolAddress: String!) {
    num_active_delegator_per_pool(
      where: {
        pool_address: {_eq: $poolAddress}
        num_active_delegator: {_gt: "0"}
      }
    ) {
      num_active_delegator
    }
  }
`;

// Block Queries
export const GET_LATEST_BLOCKS = gql`
  query GetLatestBlocks($limit: Int!) {
    block_metadata_transactions(limit: $limit, order_by: {version: desc}) {
      block_height
      version
      timestamp
      epoch
      round
      proposer
    }
  }
`;

// Coin/Token Queries
export const GET_COIN_ACTIVITIES = gql`
  query GetCoinActivities($coinType: String!, $limit: Int!, $offset: Int) {
    fungible_asset_activities(
      where: {asset_type: {_eq: $coinType}}
      limit: $limit
      offset: $offset
      order_by: {transaction_timestamp: desc}
    ) {
      transaction_version
      owner_address
      amount
      type
      transaction_timestamp
    }
  }
`;

export const GET_COIN_HOLDERS = gql`
  query GetCoinHolders($coinType: String!, $limit: Int!, $offset: Int) {
    current_fungible_asset_balances(
      where: {asset_type: {_eq: $coinType}, amount: {_gt: "0"}}
      limit: $limit
      offset: $offset
      order_by: {amount: desc}
    ) {
      owner_address
      amount
    }
  }
`;

// Analytics Queries
export const GET_DAILY_USER_TRANSACTIONS = gql`
  query GetDailyUserTransactions($startDate: date!, $endDate: date!) {
    daily_user_transactions(
      where: {date: {_gte: $startDate, _lte: $endDate}}
      order_by: {date: asc}
    ) {
      date
      num_user_transactions
    }
  }
`;

export const GET_DAILY_ACTIVE_USERS = gql`
  query GetDailyActiveUsers($startDate: date!, $endDate: date!) {
    daily_active_users(
      where: {date: {_gte: $startDate, _lte: $endDate}}
      order_by: {date: asc}
    ) {
      date
      num_active_users
    }
  }
`;

// Fungible Asset Queries
export const GET_FUNGIBLE_ASSET_METADATA = gql`
  query GetFungibleAssetMetadata($assetType: String!) {
    fungible_asset_metadata(where: {asset_type: {_eq: $assetType}}) {
      asset_type
      name
      symbol
      decimals
      icon_uri
      project_uri
      creator_address
      supply_aggregator_table_handle_v1
      supply_aggregator_table_key_v1
    }
  }
`;

export const GET_FA_SUPPLY = gql`
  query GetFaSupply($assetType: String!) {
    current_fungible_asset_balances_aggregate(
      where: {asset_type: {_eq: $assetType}}
    ) {
      aggregate {
        sum {
          amount
        }
      }
    }
  }
`;

// ANS Queries
export const GET_ANS_NAME = gql`
  query GetAnsName($address: String!) {
    current_aptos_names(
      where: {owner_address: {_eq: $address}, is_primary: {_eq: true}}
      limit: 1
    ) {
      domain
      subdomain
    }
  }
`;

export const GET_ANS_ADDRESS = gql`
  query GetAnsAddress($domain: String!, $subdomain: String) {
    current_aptos_names(
      where: {domain: {_eq: $domain}, subdomain: {_eq: $subdomain}}
      limit: 1
    ) {
      owner_address
    }
  }
`;
