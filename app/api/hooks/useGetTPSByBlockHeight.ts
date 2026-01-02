import moment from "moment";
import {useGetBlockByHeight} from "./useGetBlock";
import {parseTimestamp} from "../../pages/utils";
import {Block} from "@aptos-labs/ts-sdk";

const TPS_FREQUENCY = 600; // calculate tps every 600 blocks

function calculateTps(startBlock: Block, endBlock: Block): number | null {
  // Ensure blocks have required data
  if (!startBlock?.block_timestamp || !endBlock?.block_timestamp) {
    return null;
  }
  if (!startBlock?.last_version || !endBlock?.last_version) {
    return null;
  }

  const startTransactionVersion = parseInt(startBlock.last_version);
  const endTransactionVersion = parseInt(endBlock.last_version);

  const startTimestamp = parseTimestamp(startBlock.block_timestamp);
  const endTimestamp = parseTimestamp(endBlock.block_timestamp);
  const duration = moment.duration(endTimestamp.diff(startTimestamp));
  const durationInSec = duration.asSeconds();

  if (durationInSec <= 0) {
    return null;
  }

  return (endTransactionVersion - startTransactionVersion) / durationInSec;
}

export function useGetTPSByBlockHeight(currentBlockHeight: number | undefined) {
  const blockHeight = currentBlockHeight ?? TPS_FREQUENCY;

  const {data: startBlock} = useGetBlockByHeight({
    height: blockHeight - TPS_FREQUENCY,
    withTransactions: false,
  });
  const {data: endBlock} = useGetBlockByHeight({
    height: blockHeight,
    withTransactions: false,
  });

  // Calculate tps during render instead of using useEffect
  const tps =
    startBlock !== undefined && endBlock !== undefined
      ? calculateTps(startBlock, endBlock)
      : null;

  return {tps};
}
