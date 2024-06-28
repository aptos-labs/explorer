SELECT
  ds_utc as ds,
  COUNT(DISTINCT
    CASE
      WHEN
        ds BETWEEN ds_utc - 29 AND ds_utc
      THEN
        signer
    END
  ) AS mau_signer_30
FROM (
SELECT *
FROM
  UNNEST(
    GENERATE_DATE_ARRAY(
      CURRENT_DATE()-30,
      CURRENT_DATE()-1,
      INTERVAL 1 DAY
    )
  ) AS ds_utc
) d
CROSS JOIN (
  -- similar logic to daily_active_users 
  SELECT
    DATE(s.block_timestamp) as ds,
    signer
  FROM `bigquery-public-data.crypto_aptos_mainnet_us.signatures` s
  INNER JOIN `bigquery-public-data.crypto_aptos_mainnet_us.transactions` t
  USING (tx_version)
  WHERE DATE(s.block_timestamp) BETWEEN CURRENT_DATE -61 AND CURRENT_DATE -1
  AND t.success
  AND (NOT is_fee_payer OR is_fee_payer IS NULL)
) a
WHERE ds BETWEEN ds_utc -30 AND ds_utc
GROUP BY 1
ORDER BY 1
