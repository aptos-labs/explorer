-- Look at signers instead of '0x1::account::Account' to include
-- for stateless accounts: https://github.com/aptos-foundation/AIPs/blob/main/aips/aip-115.md
SELECT
  DATE(min_block_timestamp) as ds,
  COUNT(DISTINCT signer) as new_account_count
FROM (
  SELECT
    signer,
    min(block_timestamp) as min_block_timestamp
  FROM `bigquery-public-data.crypto_aptos_mainnet_us.signatures` 
  WHERE 1=1
  GROUP BY 1
)
WHERE min_block_timestamp BETWEEN
  TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 30 DAY
  AND TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 1 DAY
GROUP BY 1
ORDER BY 1
