import {useGlobalState} from "../../global-config/GlobalConfig";
import {useEffect, useState} from "react";
import {useViewFunction} from "./useViewFunction";

export function useGetCoinSupplyLimit(
  coinType: `${string}::${string}::${string}`,
): bigint | null {
  const [state] = useGlobalState();
  const [totalSupply, setTotalSupply] = useState<bigint | null>(null);

  const {data} = useViewFunction<{vec: [string]}>(
    "0x1::coin::supply",
    [coinType],
    [],
  );

  useEffect(() => {
    if (data !== undefined) {
      const val = data[0]?.vec[0];
      if (val !== undefined && val !== null) {
        setTotalSupply(BigInt(val));
      }
    }
  }, [data, state]);

  return totalSupply;
}
