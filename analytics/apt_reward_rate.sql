-- started off using StakingConfig and swapped to StakingRewardsConfig around 9/2023
-- modified by https://governance.aptosfoundation.org/proposal/37
-- reward rate stays the same for short epochs (when AIP ends epoch early)
SELECT
    tx_version,
    block_height,
    IF(tx_version = 0, TIMESTAMP '2022-10-12 21:22:39', block_timestamp) AS block_timestamp,
    type_str AS resource_type,
    CASE
        WHEN type_str = '0x1::staking_config::StakingConfig'
        THEN CAST(JSON_EXTRACT_SCALAR(resource, '$.rewards_rate') AS INT64) / CAST(JSON_EXTRACT_SCALAR(resource, '$.rewards_rate_denominator') AS INT64)
        WHEN type_str = '0x1::staking_config::StakingRewardsConfig'
        THEN CAST(JSON_EXTRACT_SCALAR(resource, '$.rewards_rate.value') AS INT64)/POW(2,64)
    END AS reward_rate_per_epoch, -- pct increase per epoch,
    CASE
        WHEN type_str = '0x1::staking_config::StakingConfig'
        THEN CAST(JSON_EXTRACT_SCALAR(resource, '$.rewards_rate') AS INT64) / CAST(JSON_EXTRACT_SCALAR(resource, '$.rewards_rate_denominator') AS INT64)
        WHEN type_str = '0x1::staking_config::StakingRewardsConfig'
        THEN CAST(JSON_EXTRACT_SCALAR(resource, '$.rewards_rate.value') AS INT64)/POW(2,64)
    END *12*365 AS reward_rate_per_year_approx -- approx apr
FROM `bigquery-public-data.crypto_aptos_mainnet_us.resources` r
WHERE 1=1
AND ((type_str = '0x1::staking_config::StakingConfig' AND tx_version < 1710875717)
OR (type_str = '0x1::staking_config::StakingRewardsConfig')
)
ORDER BY tx_version
