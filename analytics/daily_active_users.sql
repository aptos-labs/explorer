-- exclude fee payer
-- only successful txns
SELECT
  DATE(s.block_timestamp) as ds,
  COUNT(DISTINCT s.signer) AS daily_active_user_count
FROM `bigquery-public-data.crypto_aptos_mainnet_us.signatures` s
INNER JOIN `bigquery-public-data.crypto_aptos_mainnet_us.transactions` t
USING (tx_version)
WHERE 1=1
AND s.block_timestamp BETWEEN
    TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 30 DAY
    AND TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 1 DAY
AND t.block_timestamp BETWEEN
    TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 30 DAY
    AND TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 1 DAY
AND t.success
AND (NOT is_fee_payer OR is_fee_payer IS NULL)
GROUP BY 1
ORDER BY 1
