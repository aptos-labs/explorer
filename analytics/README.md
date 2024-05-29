# Analytics

The analytics and validators tab on explorer mainnet uses some external datasets stored as JSON.

This folder will hold the logic for generating these JSON from [google public dataset](https://console.cloud.google.com/marketplace/product/bigquery-public-data/crypto-aptos-mainnet-us)

## chain_stats.json (analytics)

### TPS

- max_tps_15_blocks_in_past_30_days
- daily_max_tps_15_blocks

### TXNs

- daily_user_transactions

### Gas

- daily_average_gas_unit_price
- daily_gas_from_user_transactions

### Contracts/modules

- daily_deployed_contracts
- daily_contract_deployers

### Active users

A subset of address on chain are accounts (have `0x1::account::Account` resource).
However, accounts can be created in many different ways.

New accounts are defined as those who received APT for the first time.

If an address signs a transactions, they are considered an active user.

- daily_new_accounts_created
- daily_active_users
- mau_signers

## validator_stats_v2.json

wip
