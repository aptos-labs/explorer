-- Accounts are typically created automatically on APT receipt
-- Accounts can also be created explicitly https://aptos.dev/network/blockchain/accounts
-- These accounts will have '0x1::account::Account' resource
-- With stateless accounts https://github.com/aptos-foundation/AIPs/blob/main/aips/aip-115.md
-- Also need to look at first time signers
SELECT
  DATE(min_block_timestamp) as ds,
  COUNT(DISTINCT address) as new_account_count
FROM (
  SELECT
    signer AS address,
    min(block_timestamp) as min_block_timestamp
  FROM `bigquery-public-data.crypto_aptos_mainnet_us.signatures` 
  WHERE 1=1
  GROUP BY 1

  UNION ALL

  SELECT  -- expensive scan
    address,
    min(block_timestamp) as min_block_timestamp
  FROM `bigquery-public-data.crypto_aptos_mainnet_us.resources` 
  WHERE 1=1
  AND type_str = '0x1::account::Account'
  GROUP BY 1  
)
WHERE min_block_timestamp BETWEEN
  TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 30 DAY
  AND TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 1 DAY
GROUP BY 1
ORDER BY 1
