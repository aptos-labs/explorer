SELECT
  ds_utc as date,
  COUNT(DISTINCT
    CASE
      WHEN
        ds BETWEEN ds_utc - 29 AND ds_utc
      THEN
        signer
    END
  ) AS mau_signer_30
FROM (
  -- similar logic to daily_active_users 
  SELECT DISTINCT
    DATE(s.block_timestamp) as ds,
    signer
  FROM `bigquery-public-data.crypto_aptos_mainnet_us.signatures` s
  INNER JOIN `bigquery-public-data.crypto_aptos_mainnet_us.transactions` t
  USING (tx_version)
  WHERE 1=1
  -- using block_height saves very little time (and adds another col to scan)
  AND s.block_timestamp BETWEEN
    TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 61 DAY
    AND TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 1 DAY
  AND t.block_timestamp BETWEEN
    TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 61 DAY
    AND TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 1 DAY
  AND t.success
  AND (NOT is_fee_payer OR is_fee_payer IS NULL)
) a
CROSS JOIN (
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
WHERE ds BETWEEN ds_utc -30 AND ds_utc
GROUP BY 1
ORDER BY 1
