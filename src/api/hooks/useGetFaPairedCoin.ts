import {useViewFunction} from "./useViewFunction";

export function useGetFaPairedCoin(address: string): string | null {
  const {data} = useViewFunction("0x1::coin::paired_coin", [], [address]);

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
      return (
        val.account_address +
        "::" +
        hexToUtf8(val.module_name) +
        "::" +
        hexToUtf8(val.struct_name)
      );
    }
  }

  return null;
}

function hexToUtf8(hexWith0x: string): string {
  return Buffer.from(hexWith0x.slice(2), "hex").toString("utf8");
}
