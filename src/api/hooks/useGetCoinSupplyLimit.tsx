import {useGlobalState} from "../../global-config/GlobalConfig";
import {useEffect, useState} from "react";
import {useViewFunction} from "./useViewFunction";

export function useGetCoinSupplyLimit(coinType: string): bigint | null {
  const [state] = useGlobalState();
  const [totalSupply, setTotalSupply] = useState<bigint | null>(null);

  const {data} = useViewFunction("0x1::coin::supply", [coinType], []);

  useEffect(() => {
    if (data !== undefined) {
      const mappedData = data as [{vec: [string]}];
      const val = mappedData[0]?.vec[0];
      if (val !== undefined && val !== null) {
        setTotalSupply(BigInt(val));
      }
    }
  }, [data, state]);

  return totalSupply;
}
