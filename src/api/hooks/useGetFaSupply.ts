import {useGlobalState} from "../../global-config/GlobalConfig";
import {useEffect, useState} from "react";
import {useViewFunction} from "./useViewFunction";

export function useGetFASupply(address: string): bigint | null {
  const [state] = useGlobalState();
  const [supply, setSupply] = useState<bigint | null>(null);

  const {data} = useViewFunction(
    "0x1::fungible_asset::supply",
    ["0x1::object::ObjectCore"],
    [address],
  );

  useEffect(() => {
    if (data !== undefined) {
      const mappedData = data as [{vec: [string]}];
      const val = mappedData[0]?.vec[0];
      if (val !== undefined && val !== null) {
        setSupply(BigInt(val));
      }
    }
  }, [data, state]);

  return supply;
}
