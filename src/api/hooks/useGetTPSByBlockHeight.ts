import moment from "moment";
import {useEffect, useState} from "react";
import {Types} from "aptos";
import {useGetBlockByHeight} from "./useGetBlock";
import {parseTimestamp} from "../../pages/utils";

const TPS_FREQUENCY = 600; // calculate tps every 600 blocks

function calculateTps(startBlock: Types.Block, endBlock: Types.Block): number {
  const startTransactionVersion = parseInt(startBlock.last_version);
  const endTransactionVersion = parseInt(endBlock.last_version);

  const startTimestamp = parseTimestamp(startBlock.block_timestamp);
  const endTimestamp = parseTimestamp(endBlock.block_timestamp);
  const duration = moment.duration(endTimestamp.diff(startTimestamp));
  const durationInSec = duration.asSeconds();

  return (endTransactionVersion - startTransactionVersion) / durationInSec;
}

export function useGetTPSByBlockHeight(currentBlockHeight: number | undefined) {
  const blockHeight = currentBlockHeight ?? TPS_FREQUENCY;

  const [tps, setTps] = useState<number | null>(null);

  const {data: startBlock} = useGetBlockByHeight({
    height: blockHeight - TPS_FREQUENCY,
    withTransactions: false,
  });
  const {data: endBlock} = useGetBlockByHeight({
    height: blockHeight,
    withTransactions: false,
  });

  useEffect(() => {
    if (startBlock !== undefined && endBlock !== undefined) {
      setTps(calculateTps(startBlock, endBlock));
    }
  }, [startBlock, endBlock]);

  return {tps};
}
