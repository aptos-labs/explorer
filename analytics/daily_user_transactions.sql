-- only count successful user transactions
SELECT
  DATE(block_timestamp) as ds,
  COUNT(DISTINCT tx_version) as num_user_transactions
FROM `bigquery-public-data.crypto_aptos_mainnet_us.transactions`
WHERE tx_type = 'user'
AND success
AND block_timestamp BETWEEN
  TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 30 DAY
  AND TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 1 DAY
GROUP BY 1
ORDER BY 1
