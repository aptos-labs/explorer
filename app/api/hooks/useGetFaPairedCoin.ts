import {Hex} from "@aptos-labs/ts-sdk";
import {type UseQueryResult, useQuery} from "@tanstack/react-query";
import type {Types} from "~/types/aptos";
import {useAptosClient, useNetworkValue} from "../../global-config";
import {isValidAccountAddress} from "../../pages/utils";
import type {ResponseError} from "../client";
import {view} from "../index";

const TEXT_DECODER = new TextDecoder();

export function useGetFaPairedCoin(
  address: string,
): UseQueryResult<string | null, ResponseError> {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();
  const request: Types.ViewRequest = {
    function: "0x1::coin::paired_coin",
    type_arguments: [],
    arguments: [address],
  };

  return useQuery<string | null, ResponseError>({
    queryKey: ["pairedCoin", address, networkValue],
    queryFn: async () => {
      if (!isValidAccountAddress(address)) {
        return null;
      }

      const data = await view(request, aptosClient);
      if (data === undefined) {
        return null;
      }

      const mappedData = data as [
        {
          vec: [
            {
              account_address: string;
              module_name: string;
              struct_name: string;
            },
          ];
        },
      ];
      const val = mappedData[0]?.vec[0];
      if (val === undefined || val === null) {
        return null;
      }

      return `${val.account_address}::${hexToUtf8(val.module_name)}::${hexToUtf8(val.struct_name)}`;
    },
    enabled: isValidAccountAddress(address),
  });
}

function hexToUtf8(hexWith0x: string): string {
  return TEXT_DECODER.decode(Hex.fromHexString(hexWith0x).toUint8Array());
}
