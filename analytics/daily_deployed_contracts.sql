SELECT
  DATE(t.block_timestamp) AS ds,
  COUNT(DISTINCT t.tx_version || '-' || t.change_index) AS daily_contract_deployed
FROM `bigquery-public-data.crypto_aptos_mainnet_us.changes` AS t
WHERE t.change_type= 'write_module'
AND t.block_timestamp BETWEEN
  TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 30 DAY
  AND TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 1 DAY
GROUP BY 1
ORDER BY 1
11
