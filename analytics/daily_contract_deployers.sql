SELECT
  DATE(c.block_timestamp) as ds,
  COUNT(DISTINCT s.signer) as distinct_deployers
FROM `bigquery-public-data.crypto_aptos_mainnet_us.changes` c
LEFT JOIN `bigquery-public-data.crypto_aptos_mainnet_us.signatures` s
USING (tx_version)
WHERE 1=1
AND change_type = 'write_module'
AND c.block_timestamp BETWEEN
  TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 30 DAY
  AND TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 1 DAY
AND s.block_timestamp BETWEEN
  TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 30 DAY
  AND TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 1 DAY
GROUP BY 1
ORDER BY 1
