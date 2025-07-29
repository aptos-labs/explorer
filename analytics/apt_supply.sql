-- supply changes on (almost) every version because gas is burned
-- adding coin and FA supply together should give same answer as 0x1::coin::supply view function with "0x1::aptos_coin::AptosCoin"
-- apt mint: validator and storage refund from delete
-- apt burn: gas fees
-- more details in 'APT mints and burns' section of https://medium.com/p/535e312946ad

SELECT
SUM(supply)/1e8 AS apt_supply
FROM (
SELECT -- coins
    tx_version,
    block_height,
    block_timestamp,
    '0x1::aptos_coin::AptosCoin' AS coin_type, -- coin supply from aggregator
    CAST(JSON_VALUE(value.content) AS BIGNUMERIC) AS supply,
FROM `bigquery-public-data.crypto_aptos_mainnet_us.table_items` 
WHERE 1=1 -- same for mainnet and testnet
AND address = '0x1b854694ae746cdbd8d44186ca4929b2b337df21d1c74633be19b2710552fdca' -- should be table_handle
AND '0x'|| LPAD(LTRIM(key.name, '0x'), 64, '0') = '0x0619dc29a0aac8fa146714058e8dd6d2d0f3bdf5f6331907bf91f3acd81e6935'
AND DATE(block_timestamp) = CURRENT_DATE() -- optimization
QUALIFY ROW_NUMBER() OVER (ORDER BY tx_version DESC) = 1 -- latest

UNION ALL

SELECT -- FA
  tx_version,
  block_height,
  block_timestamp,
  address AS coin_type, -- fa supply from resource
  CAST(JSON_VALUE(resource, '$.current.value') AS BIGNUMERIC) AS supply,
FROM `bigquery-public-data.crypto_aptos_mainnet_us.resources` r
WHERE type_str ='0x1::fungible_asset::ConcurrentSupply'
AND address ='0x000000000000000000000000000000000000000000000000000000000000000a'
AND DATE(block_timestamp) = CURRENT_DATE() -- optimization
QUALIFY ROW_NUMBER() OVER (ORDER BY tx_version DESC) = 1 -- latest
)
