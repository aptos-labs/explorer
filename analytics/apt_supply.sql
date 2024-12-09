-- supply changes on almost every version because gas is burned
-- should give same results as view function
-- doesn't include apt that could be refunded on delete
SELECT
    tx_version,
    '0x1::aptos_coin::AptosCoin' AS coin_type,
    CAST(JSON_VALUE(value.content) AS BIGNUMERIC) AS supply,
    block_timestamp,
FROM `bigquery-public-data.crypto_aptos_mainnet_us.table_items` 
WHERE 1=1 -- same for mainnet and testnet
AND address = '0x1b854694ae746cdbd8d44186ca4929b2b337df21d1c74633be19b2710552fdca' -- should be table_handle
AND '0x'|| LPAD(LTRIM(key.name, '0x'), 64, '0') = '0x0619dc29a0aac8fa146714058e8dd6d2d0f3bdf5f6331907bf91f3acd81e6935'
LIMIT 1000
