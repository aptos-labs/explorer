SELECT
  DATE(block_timestamp) as ds,
  COUNT(DISTINCT tx_version || '-' || change_index) as daily_contract_deployed
FROM `bigquery-public-data.crypto_aptos_mainnet_us.modules` 
WHERE DATE(block_timestamp) BETWEEN CURRENT_DATE -30 AND CURRENT_DATE -1
GROUP BY 1
ORDER BY 1
