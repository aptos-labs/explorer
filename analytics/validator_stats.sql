-- logic below is approximate for a specific epoch (7176)
-- logic will not work for incomplete epochs (ex AIP proposal)
-- bmt = block_metadata_transaction
WITH target_epoch AS (
  -- use this for filtering
  SELECT
    MIN(block_timestamp) as bt_min,
    MAX(block_timestamp) as bt_max,
    MIN(tx_version) as tx_min,
    MAX(tx_version) as tx_max -- should be last bmt in epoch which is special
  FROM `bigquery-public-data.crypto_aptos_mainnet_us.events`
  WHERE event_type = '0x1::block::NewBlockEvent'
  AND JSON_EXTRACT_SCALAR(data, '$.epoch') = "7176"
), validator_set AS (
  -- parse the first ValidatorSet change, should all be the same within epoch
  SELECT
    CAST(JSON_EXTRACT_SCALAR(e, '$.config.validator_index') AS INT64) as idx,
    '0x' || LPAD(LTRIM(JSON_EXTRACT_SCALAR(e, '$.addr'), '0x'), 64, '0') as validator_id,
    CAST(JSON_EXTRACT_SCALAR(e, '$.voting_power') as INT64) as voting_power,
  FROM (
    SELECT
    JSON_EXTRACT_ARRAY(resource, '$.active_validators') as validator_ar
    FROM `bigquery-public-data.crypto_aptos_mainnet_us.resources`
    WHERE type_str = '0x1::stake::ValidatorSet'
    AND tx_version = (
      SELECT min(tx_version)
      FROM `bigquery-public-data.crypto_aptos_mainnet_us.resources` r
      CROSS JOIN target_epoch
      WHERE type_str = '0x1::stake::ValidatorSet'
      AND tx_version >= tx_min
      AND tx_version <= tx_max
    )
  ),
  UNNEST(validator_ar) as e
), operators AS (
  -- parse last bmt for 0x1::stake::StakePool
  SELECT
    r.address as validator_id,
    JSON_EXTRACT_SCALAR(r.resource, '$.operator_address') as operator_id,
    JSON_EXTRACT_SCALAR(r.resource, '$.active.value') as active_value
  FROM validator_set v
  LEFT JOIN `bigquery-public-data.crypto_aptos_mainnet_us.resources` r
  ON v.validator_id = r.address
  WHERE type_str = '0x1::stake::StakePool' 
  AND r.tx_version = (SELECT tx_max FROM target_epoch)
), rewards AS (
  -- parse last bmt for 0x1::stake::DistributeRewardsEvent
  SELECT
    address as validator_id,
    CAST(JSON_EXTRACT_SCALAR(data, '$.rewards_amount') as INT64) as rewards_amount
  FROM `bigquery-public-data.crypto_aptos_mainnet_us.events`
  WHERE event_type = '0x1::stake::DistributeRewardsEvent'
  AND tx_version = (SELECT tx_max FROM target_epoch)
), rate AS (
  -- currently 15741285*POW(10,-12)
  -- hardcode tx_version for performance
  SELECT
    tx_version,
    CAST(JSON_EXTRACT_SCALAR(resource, '$.rewards_rate.value') AS INT64)/POW(2,64) as rewards_rate,
  FROM `bigquery-public-data.crypto_aptos_mainnet_us.resources` r
  WHERE type_str = '0x1::staking_config::StakingRewardsConfig'
  -- type_str = '0x1::staking_config::StakingConfig' -- this is deprecated
  AND tx_version = 294070106 -- update to rate for epoch
), validator_perf AS (
  -- validator performance is in 2nd to last bmt
  SELECT
      ROW_NUMBER() OVER (PARTITION BY tx_version)-1 as rn, -- this is iffy
      JSON_EXTRACT_SCALAR(e, '$.failed_proposals') as failed,
      JSON_EXTRACT_SCALAR(e, '$.successful_proposals') as successful
  FROM (
    SELECT
    tx_version,
    JSON_EXTRACT_ARRAY(resource, '$.validators') as validator_ar
    FROM `bigquery-public-data.crypto_aptos_mainnet_us.resources`
    WHERE type_str = '0x1::stake::ValidatorPerformance'
    AND tx_version = (
      -- second to last bmt
      SELECT MAX(tx_version)
      FROM `bigquery-public-data.crypto_aptos_mainnet_us.events`
      CROSS JOIN target_epoch
      WHERE event_type = '0x1::block::NewBlockEvent'
      AND tx_version < tx_max
      AND tx_version > tx_min
    )
  ),
  UNNEST(validator_ar) as e
), gov_vote_record AS (
  -- governance vote counter (all time until end of epoch)
  SELECT
    '0x' || LPAD(LTRIM(JSON_EXTRACT_SCALAR(data, '$.stake_pool'), '0x'), 64, '0') AS validator_id,
    COUNT(DISTINCT JSON_EXTRACT_SCALAR(data, '$.proposal_id')) AS total_governance_votes
  FROM `bigquery-public-data.crypto_aptos_mainnet_us.events`
  WHERE event_type = '0x1::aptos_governance::VoteEvent'
  AND tx_version < (SELECT tx_max FROM target_epoch)
  GROUP BY validator_id
)


SELECT
  idx,
  validator_id,
  operator_id,
  voting_power,
  -- rewards
  rewards_amount,
  voting_power*rewards_rate as max_reward,
  rewards_amount/(voting_power*rewards_rate)*100 as rewards_growth,
  -- proposals
  failed,
  successful,
  -- gov (all time until end of epoch)
  total_governance_votes
FROM validator_set
LEFT JOIN operators
USING (validator_id)
LEFT JOIN rewards
USING (validator_id)
CROSS JOIN rate
LEFT JOIN validator_perf
ON validator_perf.rn = validator_set.idx
LEFT JOIN gov_vote_record
USING (validator_id)
