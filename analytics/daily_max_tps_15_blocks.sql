-- might be slight differences due to how timestamp is truncated (ms vs us)
-- our target block is b
-- look 15 blocks in the future (a)
-- look 1 block in the past (c)
-- take the difference in version and subtract out 2 metadata txn per block

WITH bmt AS (
  SELECT
    TIMESTAMP_MICROS(block_unixtimestamp.seconds*1000000 + CAST(block_unixtimestamp.nanos/1e3 AS INT)) as block_timestamp,
    block_height,
    blockmetadata_tx_version AS version,
  FROM `bigquery-public-data.crypto_aptos_mainnet_us.blocks`
  WHERE
    DATE(block_timestamp) BETWEEN CURRENT_DATE -32
    AND CURRENT_DATE
)
SELECT
  ds,
  TRUNC(MAX(SAFE_DIVIDE(txn_cnt, m_seconds)), 0) AS max_tps_15_blocks,
FROM (
  SELECT
    b.block_height,
    (c.version - 1) - (a.version + 1) - (2*15) AS txn_cnt, -- remove non-user transactions
    TIMESTAMP_DIFF(c.block_timestamp, a.block_timestamp, MICROSECOND)/1000000 AS m_seconds,
    DATE(a.block_timestamp) AS ds
  FROM bmt AS b
  INNER JOIN bmt AS a
  ON b.block_height = a.block_height + (15 - 1)
  INNER JOIN bmt AS c
  ON b.block_height = c.block_height -1
)
WHERE
  ds BETWEEN CURRENT_DATE -30
  AND CURRENT_DATE -1
GROUP BY
  ds
ORDER BY
  ds
