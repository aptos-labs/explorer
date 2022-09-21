import {useGetAccountResources} from "./useGetAccountResources";
import {GlobalState, useGlobalState} from "../../GlobalState";
import {getTableItem} from "..";
import {TableItemRequest} from "aptos/dist/generated";
import {useEffect, useState} from "react";
import {UseQueryResult} from "react-query";
import {Types} from "aptos";
import {ResponseError} from "../client";

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
  data: Types.MoveResource[],
  state: GlobalState,
): Promise<number | null> {
  const coinInfo = data.find(
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

  useEffect(() => {
    if (accountResourcesResult.data !== undefined) {
      fetchTotalSupply(accountResourcesResult.data, state).then((data) => {
        data && setTotalSupply(data);
      });
    }
  }, [accountResourcesResult.data, state]);

  return totalSupply;
}
