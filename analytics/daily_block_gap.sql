WITH block_with_prev AS (
  -- get prev
  SELECT *, LAG(block_unixtimestamp) OVER (ORDER BY block_height) AS block_unixtimestamp_prev
  FROM `bigquery-public-data.crypto_aptos_mainnet_us.blocks`
  WHERE 1=1
  AND block_timestamp > TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY) - INTERVAL 30 DAY
  AND block_timestamp < TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY)
), block_time_diff AS (
  -- diff in nanos
  SELECT
    DATE(block_timestamp) AS block_day,
    block_height,
    IF(block_unixtimestamp.seconds = block_unixtimestamp_prev.seconds,
      block_unixtimestamp.nanos - block_unixtimestamp_prev.nanos,
      (block_unixtimestamp.seconds - block_unixtimestamp_prev.seconds)*1000000000 + block_unixtimestamp.nanos - block_unixtimestamp_prev.nanos
    ) AS diff_nanos
  FROM block_with_prev
  WHERE block_unixtimestamp_prev.seconds IS NOT NULL
), block_time_dist AS (
  -- get distribution of time between blocks, use APPROX_QUANTILES if too slow
  SELECT DISTINCT
    block_day,
    CAST(PERCENTILE_CONT(diff_nanos, 0.50) OVER (PARTITION BY block_day) AS INT64) as p50, -- linear interpolation
  FROM block_time_diff
), block_time_dist_approx AS (
  -- get distribution of time between blocks, this does not seem to be faster
  SELECT
    block_day,
    CAST(quantile[OFFSET(50)] AS INT64) as p50,
  FROM (
    SELECT block_day,
      APPROX_QUANTILES(diff_nanos, 100) AS quantile,
    FROM block_time_diff
    GROUP BY 1
  )
)

-- -- map back (not sure if needed)
-- SELECT
--   block_day,
--   block_height, -- target block
--   diff_nanos, -- target diff
-- FROM block_time_diff
-- LEFT JOIN block_time_dist
-- USING(block_day)
-- QUALIFY ROW_NUMBER() OVER (PARTITION BY block_day ORDER BY ABS(diff_nanos-p50)) = 1 -- find closest match
-- ORDER BY block_day

SELECT
  block_day,
  p50 AS block_time_diff_nanos,
FROM block_time_dist
ORDER BY block_day
