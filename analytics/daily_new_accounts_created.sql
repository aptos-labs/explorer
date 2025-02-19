-- This is an expensive scan
SELECT
  DATE(min_block_timestamp) as ds,
  COUNT(DISTINCT address) as new_account_count
FROM (
  SELECT
    address,
    min(block_timestamp) as min_block_timestamp
  FROM `bigquery-public-data.crypto_aptos_mainnet_us.resources` 
  WHERE 1=1
  AND type_str = '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
  GROUP BY 1
)
WHERE min_block_timestamp BETWEEN
  TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 30 DAY
  AND TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 1 DAY
GROUP BY 1
ORDER BY 1
