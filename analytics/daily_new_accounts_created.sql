-- Accounts are typically created automatically on APT receipt
-- Accounts can also be created explicitly https://aptos.dev/network/blockchain/accounts
-- These accounts will have '0x1::account::Account' resource
-- With stateless accounts https://github.com/aptos-foundation/AIPs/blob/main/aips/aip-115.md
-- Also need to look at first time signers
WITH first_signer_or_account AS (
  SELECT
    signer AS address,
    min(DATE(block_timestamp)) as block_date
  FROM `bigquery-public-data.crypto_aptos_mainnet_us.signatures` 
  WHERE 1=1
  GROUP BY 1

  UNION ALL

  SELECT
    address,
    min(DATE(block_timestamp)) as block_date
  FROM `bigquery-public-data.crypto_aptos_mainnet_us.resources` 
  WHERE 1=1
  AND type_str = '0x1::account::Account'
  GROUP BY 1
)

SELECT
  min_block_date as ds,
  COUNT(DISTINCT address) as new_account_count
FROM (
  SELECT
    address,
    min(block_date) as min_block_date
  FROM first_signer_or_account
  GROUP BY 1
)
WHERE 1=1
AND min_block_date >= (CURRENT_DATE() - INTERVAL 30 DAY)
AND min_block_date < CURRENT_DATE()
GROUP BY 1
ORDER BY 1
