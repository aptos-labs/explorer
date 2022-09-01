import {useGetAccountResources} from "../../../api/hooks/useGetAccountResources";
import {GlobalState, useGlobalState} from "../../../GlobalState";
import {getTableItem} from "../../../api";
import {TableItemRequest} from "aptos/dist/generated";
import {useEffect, useState} from "react";

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
  aggregatorData: AggregatorData,
  state: GlobalState,
): Promise<number | null> {
  const tableItemRequest = {
    key_type: "address",
    value_type: "u128",
    key: aggregatorData.key,
  } as TableItemRequest;

  const supplyLimit = await getTableItem(
    {
      tableHandle: aggregatorData.handle,
      data: tableItemRequest,
    },
    state.network_value,
  );

  // TODO: remove network check after AIT3
  return state.network_name === "ait3"
    ? parseInt(supplyLimit) - (Math.pow(2, 64) - 1)
    : parseInt(supplyLimit);
}

export function useGetCoinSupplyLimit(): number | null {
  const [state, _] = useGlobalState();
  const [totalSupply, setTotalSupply] = useState<number | null>(null);
  const accountResourcesResult = useGetAccountResources("0x1");

  if (!accountResourcesResult.data) {
    return null;
  }

  const coinInfo = accountResourcesResult.data.find(
    (resource) =>
      resource.type === "0x1::coin::CoinInfo<0x1::aptos_coin::AptosCoin>",
  );

  if (coinInfo === undefined || coinInfo.data === undefined) {
    return null;
  }

  const coinInfoData: CoinInfo = coinInfo.data as CoinInfo;
  const aggregatorData = coinInfoData?.supply?.vec[0]?.aggregator?.vec[0];

  if (aggregatorData === undefined) {
    return null;
  }

  useEffect(() => {
    if (aggregatorData !== undefined) {
      fetchTotalSupply(aggregatorData, state).then((data) => {
        data && setTotalSupply(data);
      });
    }
  }, [aggregatorData]);

  return totalSupply;
}
