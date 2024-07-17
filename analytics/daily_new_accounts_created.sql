-- This is an expensive query
SELECT
  DATE(min_block_timestamp) as ds,
  COUNT(DISTINCT address) as c
FROM (
  SELECT address, min(block_timestamp) as min_block_timestamp
  FROM `bigquery-public-data.crypto_aptos_mainnet_us.resources` 
  WHERE 1=1
  AND type_str = '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
  GROUP BY 1
)
WHERE DATE(min_block_timestamp) BETWEEN CURRENT_DATE -30 AND CURRENT_DATE -1
GROUP BY 1
ORDER BY 1
