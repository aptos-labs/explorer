import {useViewFunction} from "./useViewFunction";
import {Hex} from "@aptos-labs/ts-sdk";

const TEXT_DECODER = new TextDecoder();

export function useGetFaPairedCoin(address: string): {
  isLoading: boolean;
  data: string | null;
} {
  const {isLoading, data} = useViewFunction(
    "0x1::coin::paired_coin",
    [],
    [address],
  );

  if (data !== undefined) {
    const mappedData = data as [
      {
        vec: [
          {account_address: string; module_name: string; struct_name: string},
        ];
      },
    ];
    const val = mappedData[0]?.vec[0];
    if (val !== undefined && val !== null) {
      return {
        isLoading,
        data:
          val.account_address +
          "::" +
          hexToUtf8(val.module_name) +
          "::" +
          hexToUtf8(val.struct_name),
      };
    }
  }

  return {isLoading, data: null};
}

function hexToUtf8(hexWith0x: string): string {
  return TEXT_DECODER.decode(Hex.fromHexString(hexWith0x).toUint8Array());
}
