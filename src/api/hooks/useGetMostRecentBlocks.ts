import {useGlobalState} from "../../global-config/GlobalConfig";
import {useEffect, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {getLedgerInfo, getRecentBlocks} from "..";
import {Types} from "aptos";

export function useGetMostRecentBlocks(count: number) {
  const [state] = useGlobalState();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recentBlocks, setRecentBlocks] = useState<Types.Block[]>([]);

  const {data: ledgerData} = useQuery({
    queryKey: ["ledgerInfo", state.network_value],
    queryFn: () => getLedgerInfo(state.aptos_client),
  });
  const currentBlockHeight = ledgerData?.block_height;

  useEffect(() => {
    if (currentBlockHeight !== undefined) {
      const fetchData = async () => {
        const blocks = await getRecentBlocks(
          parseInt(currentBlockHeight),
          count,
          state.aptos_client,
        );
        setRecentBlocks(blocks);
        setIsLoading(false);
      };
      fetchData();
    }
  }, [currentBlockHeight, state, count]);

  return {recentBlocks, isLoading};
}
