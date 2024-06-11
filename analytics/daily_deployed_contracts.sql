SELECT
  DATE(t.block_timestamp) AS day,
  COUNT(DISTINCT t.tx_version ||'-' || t.change_index ) AS daily_contract_deployed
FROM `bigquery-public-data.crypto_aptos_mainnet_us.changes` AS t
WHERE t.change_type= 'write_module'
  AND DATE(t.block_timestamp) BETWEEN CURRENT_DATE -30 AND CURRENT_DATE -1
GROUP BY 1
ORDER BY 1