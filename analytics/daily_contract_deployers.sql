SELECT
  DATE(c.block_timestamp) as ds,
  COUNT(DISTINCT s.signer) as distinct_signers
FROM `bigquery-public-data.crypto_aptos_mainnet_us.changes` c
LEFT JOIN `bigquery-public-data.crypto_aptos_mainnet_us.signatures` s
USING (tx_version)
WHERE 1=1
AND change_type = 'write_module'
AND DATE(c.block_timestamp) BETWEEN CURRENT_DATE -30 AND CURRENT_DATE -1
GROUP BY 1
ORDER BY 1
