import {GlobalState, useGlobalState} from "../../global-config/GlobalConfig";
import {getTableItem} from "..";
import {Types} from "aptos";
import {useEffect, useState} from "react";
import {useGetAccountResource} from "./useGetAccountResource";

interface CoinInfo {
  decimals: number;
  name: string;
  supply: {
    vec: [
      {
        aggregator: {
          vec: [AggregatorData];
        };
        integer: {
          vec: [];
        };
      },
    ];
  };
  symbol: string;
}

interface AggregatorData {
  handle: string;
  key: string;
  limit: string;
}

async function fetchTotalSupply(
  data: CoinInfo,
  state: GlobalState,
): Promise<number | null> {
  const aggregatorData = data?.supply?.vec[0]?.aggregator?.vec[0];

  if (aggregatorData === undefined) {
    return null;
  }

  const tableItemRequest = {
    key_type: "address",
    value_type: "u128",
    key: aggregatorData.key,
  } as Types.TableItemRequest;

  const supplyLimit = await getTableItem(
    {
      tableHandle: aggregatorData.handle,
      data: tableItemRequest,
    },
    state.network_value,
  );

  return parseInt(supplyLimit);
}

export function useGetCoinSupplyLimit(): number | null {
  const [state] = useGlobalState();
  const [totalSupply, setTotalSupply] = useState<number | null>(null);
  const {data: coinInfo} = useGetAccountResource(
    "0x1",
    "0x1::coin::CoinInfo<0x1::aptos_coin::AptosCoin>",
  );

  useEffect(() => {
    if (coinInfo?.data !== undefined) {
      fetchTotalSupply(coinInfo?.data as CoinInfo, state).then((data) => {
        data && setTotalSupply(data);
      });
    }
  }, [coinInfo?.data, state]);

  return totalSupply;
}
