WITH end_of_epoch AS (
    SELECT
        tx_version, -- end of epoch version
        block_timestamp,
        CAST(JSON_VALUE(data, "$.epoch") AS INT) AS epoch_next
    FROM `bigquery-public-data.crypto_aptos_mainnet_us.events`
    WHERE 1=1
    AND event_type = '0x1::reconfiguration::NewEpochEvent'
), validator_set AS (
    SELECT
        tx_version, -- for ValidatorSet
        block_height, -- for ValidatorSet
        epoch_next AS epoch, -- voting power is for next epoch
        CAST(JSON_VALUE(val, '$.config.validator_index') AS INT64) as idx,
        '0x' || LPAD(LTRIM(JSON_VALUE(val, '$.addr'), '0x'), 64, '0') as pool_address,
        CAST(JSON_VALUE(val, '$.voting_power') as INT64) as voting_power,
    FROM `bigquery-public-data.crypto_aptos_mainnet_us.resources` r,
    UNNEST(JSON_QUERY_ARRAY(resource, '$.active_validators')) as val
    INNER JOIN end_of_epoch
    USING(tx_version)
    WHERE type_str = '0x1::stake::ValidatorSet'
    AND date(r.block_timestamp) = '2024-06-29' -- debug
), validator_perf AS (
    -- every block has this, get the last one for an epoch
    SELECT
        r.tx_version,
        block_height,
        epoch_next-1 AS epoch,
        idx,
        CAST(JSON_VALUE(val, '$.successful_proposals') AS INT64) as n_success,
        CAST(JSON_VALUE(val, '$.failed_proposals') AS INT64) as n_failure,
    FROM `bigquery-public-data.crypto_aptos_mainnet_us.resources` r,
    UNNEST(JSON_QUERY_ARRAY(resource, '$.validators')) AS val WITH OFFSET AS idx
    INNER JOIN end_of_epoch
    ON r.tx_version = end_of_epoch.tx_version -1
    WHERE type_str = '0x1::stake::ValidatorPerformance'
    AND date(r.block_timestamp) = '2024-06-29' -- debug
), staking_reward AS (
    SELECT
        e.address AS pool_address, -- same as pool_address in data
        e.tx_version,
        e.event_index,
        -- e.block_timestamp,
        -- '0x'|| LPAD(LTRIM(JSON_VALUE(data, '$.pool_address'), '0x'), 64, '0') AS pool_address,
        CAST(JSON_VALUE(e.data, '$.rewards_amount') AS BIGNUMERIC) AS reward_amount,
    FROM `bigquery-public-data.crypto_aptos_mainnet_us.events` e
    WHERE event_type = '0x1::stake::DistributeRewardsEvent'
), validator_status AS (
    SELECT
        epoch_next-1 AS epoch,
        tx_version,
        r.block_height,
        r.block_timestamp,
        change_index,
        address AS pool_address,
        '0x'|| LPAD(LTRIM(JSON_VALUE(resource, '$.delegated_voter'), '0x'), 64, '0') AS delegated_voter,
        CAST(JSON_VALUE(resource, '$.active.value') AS BIGINT) AS active_pool,
        CAST(JSON_VALUE(resource, '$.inactive.value') AS BIGINT) AS inactive_pool,
        CAST(JSON_VALUE(resource, '$.pending_active.value') AS BIGINT) AS pending_active_pool,
        CAST(JSON_VALUE(resource, '$.pending_inactive.value') AS BIGINT) AS pending_inactive_pool,
        TIMESTAMP_SECONDS(CAST(JSON_VALUE(resource, '$.locked_until_secs') AS BIGINT)) AS lockup_end_timestamp,
    FROM `bigquery-public-data.crypto_aptos_mainnet_us.resources` r
    INNER JOIN end_of_epoch
    USING(tx_version)
    WHERE type_str = '0x1::stake::StakePool'
), gov_vote_record AS (
    -- not joined in
    SELECT
        tx_version AS start_txn,
        COALESCE(LEAD(tx_version) OVER (PARTITION BY validator_id ORDER BY tx_version ASC), 99999999999) AS next_txn,
        validator_id,
        COUNT(proposal_id) OVER (PARTITION BY validator_id ORDER BY tx_version ASC) AS proposals_voted_on,
    FROM (
        SELECT
        MIN(tx_version) AS tx_version,
        '0x' || LPAD(LTRIM(JSON_VALUE(data, '$.stake_pool'), '0x'), 64, '0') AS validator_id,
        JSON_VALUE(data, '$.proposal_id') AS proposal_id
        FROM `bigquery-public-data.crypto_aptos_mainnet_us.events`
        WHERE event_type = '0x1::aptos_governance::VoteEvent'
        GROUP BY ALL
    )
)
SELECT
    v.epoch,
    v.tx_version,
    v.block_height, -- partitioned on this
    v.block_timestamp,
    v.pool_address,
    v.delegated_voter,
    -- state at end of epoch
    v.active_pool, -- includes rewards
    v.inactive_pool,
    v.pending_active_pool,
    v.pending_inactive_pool,
    --
    COALESCE(sr.reward_amount, 0) AS reward_amount,
    vs.voting_power, -- this is amount as beginning of epoch, multiple by reward_rate_per_epoch to get max reward_amount
    vp.n_success,
    vp.n_failure,
    v.lockup_end_timestamp, -- pool's lockup schedule
    --
    v.change_index, -- from stakepool resource
    sr.event_index, -- from reward event
    vs.idx AS validator_index, -- from validator set
FROM validator_status v
LEFT JOIN staking_reward sr
USING (tx_version, pool_address)
LEFT JOIN validator_set vs
USING (epoch, pool_address)
LEFT JOIN validator_perf vp
ON vs.epoch = vp.epoch AND vs.idx = vp.idx
