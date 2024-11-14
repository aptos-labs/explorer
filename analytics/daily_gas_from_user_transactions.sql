-- only successful txns
SELECT
  DATE(block_timestamp) as ds,
  SUM(gas_used * gas_unit_price) / 1e8 as gas_cost -- in APT
FROM `bigquery-public-data.crypto_aptos_mainnet_us.transactions`
WHERE tx_type = 'user'
AND success
AND block_timestamp BETWEEN
  TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 30 DAY
  AND TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 1 DAY
GROUP BY 1
ORDER BY 1
