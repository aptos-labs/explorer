import {useGlobalState} from "../../GlobalState";
import {useEffect, useState} from "react";
import {useQuery} from "react-query";
import {getLedgerInfo} from "..";
import {useGetTPSByBlockHeight} from "./useGetTPSByBlockHeight";

export function useGetTPS() {
  const [state, _] = useGlobalState();
  const [blockHeight, setBlockHeight] = useState<string | null>(null);
  const {tps} = useGetTPSByBlockHeight(blockHeight);

  const {data: ledgerData} = useQuery(
    ["ledgerInfo", state.network_value],
    () => getLedgerInfo(state.network_value),
    {refetchInterval: 1000},
  );
  const currentBlockHeight = ledgerData?.block_height;

  useEffect(() => {
    if (currentBlockHeight !== undefined) {
      setBlockHeight(currentBlockHeight);
    }
  }, [currentBlockHeight, state]);

  return {tps};
}
