-- exclude fee payer
-- only successful txns
SELECT
  DATE(s.block_timestamp) as ds,
  COUNT(DISTINCT s.signer)
FROM `bigquery-public-data.crypto_aptos_mainnet_us.signatures` s
INNER JOIN `bigquery-public-data.crypto_aptos_mainnet_us.transactions` t
USING (tx_version)
WHERE DATE(s.block_timestamp) BETWEEN CURRENT_DATE -30 AND CURRENT_DATE -1
AND t.success
AND (NOT is_fee_payer OR is_fee_payer IS NULL)
GROUP BY 1
ORDER BY 1
