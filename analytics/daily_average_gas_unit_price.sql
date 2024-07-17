-- include unsuccessful txns
SELECT
  DATE(block_timestamp) as ds,
  AVG(gas_unit_price) as avg_gas_unit_price
FROM `bigquery-public-data.crypto_aptos_mainnet_us.transactions`
WHERE tx_type = 'user'
-- AND success
AND DATE(block_timestamp) BETWEEN CURRENT_DATE -30 AND CURRENT_DATE -1
GROUP BY 1
ORDER BY 1
