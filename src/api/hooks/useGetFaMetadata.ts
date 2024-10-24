import {useGlobalState} from "../../global-config/GlobalConfig";
import {useEffect, useState} from "react";
import {useViewFunction} from "./useViewFunction";

type FaMetadata = {
  name: string;
  symbol: string;
  decimals: number;
  icon_uri: string;
  project_uri: string;
};

export function useGetFaMetadata(address: string): FaMetadata | null {
  const [state] = useGlobalState();
  const [metadata, setMetadata] = useState<FaMetadata | null>(null);

  const {data} = useViewFunction(
    "0x1::fungible_asset::metadata",
    ["0x1::object::ObjectCore"],
    [address],
  );

  useEffect(() => {
    if (data !== undefined) {
      const mappedData = data as [FaMetadata];
      const val = mappedData[0];
      if (val !== undefined && val !== null) {
        setMetadata(val);
      }
    }
  }, [data, state]);

  return metadata;
}
