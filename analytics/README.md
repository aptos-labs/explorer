# Analytics

The analytics and validators tab on explorer mainnet uses some external datasets stored as JSON.

This folder will hold the logic for generating these JSON from [google public dataset](https://console.cloud.google.com/marketplace/product/bigquery-public-data/crypto-aptos-mainnet-us)

## chain_stats.json (analytics)

### TPS

- [daily_max_tps_15_blocks](daily_max_tps_15_blocks.sql)
- [max_tps_15_blocks_in_past_30_days](max_tps_15_blocks_in_past_30_days.sql)

### TXNs

- [daily_user_transactions](daily_user_transactions.sql)

### Gas

- [daily_average_gas_unit_price](daily_average_gas_unit_price.sql)
- [daily_gas_from_user_transactions](daily_gas_from_user_transactions.sql)

### Contracts/modules

- [daily_deployed_contracts])(daily_deployed_contracts.sql)
- [daily_contract_deployers](daily_contract_deployers.sql)

### Active users

A subset of address on chain are accounts (have `0x1::account::Account` resource).
Accounts can be created in many different ways (direct call to create account, first APT receipt, first signature, etc).

We define new accounts as addresses that received APT for the first time.

If an address signs a transactions, they are considered an active user.

- [daily_new_accounts_created])(daily_new_accounts_created.sql)
- [daily_active_users])(daily_active_users.sql)
- [mau_signers])(mau_signers.sql)

## validator_stats_v2.json

Approx logic in [validator_stats](validator_stats.sql).
Truth is obtained by calling view function.

Using bq data, hard to filter on current state since only have data on change.

location_stats uses IP (not recorded on chain)
