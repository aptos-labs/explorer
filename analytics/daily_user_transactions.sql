-- only count successful user transactions
SELECT
  DATE(block_timestamp) as ds,
  COUNT(DISTINCT tx_version) as num_user_transactions
FROM `bigquery-public-data.crypto_aptos_mainnet_us.transactions`
WHERE tx_type = 'user'
AND success
AND DATE(block_timestamp) BETWEEN CURRENT_DATE -30 AND CURRENT_DATE -1
GROUP BY 1
ORDER BY 1
