import {APTOS_COIN, Types} from "aptos";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {ResponseError, withResponseError} from "../client";

import {
  AccountAddressInput,
  Aptos,
  InputViewFunctionData,
  TypeTagAddress,
  TypeTagU64,
} from "@aptos-labs/ts-sdk";
import {useQuery} from "@tanstack/react-query";

export async function getBalance(
  client: Aptos,
  address: AccountAddressInput,
  coinType?: `0x${string}::${string}::${string}`,
): Promise<string> {
  const typeArguments = coinType ? [coinType] : [APTOS_COIN];

  // TODO: Replace with native SDK call
  const payload: InputViewFunctionData = {
    function: "0x1::coin::balance",
    typeArguments,
    functionArguments: [address],
    abi: {
      parameters: [new TypeTagAddress()],
      typeParameters: [{constraints: []}],
      returnTypes: [new TypeTagU64()],
    },
  };
  return withResponseError(
    client.view<[string]>({payload}).then((res) => res[0]),
  );
}

export function useGetAccountAPTBalance(address: Types.Address) {
  const [state] = useGlobalState();
  const {data: balance} = useQuery<string, ResponseError>({
    queryKey: ["aptBalance", {address}, state.network_value],
    queryFn: () => getBalance(state.sdk_v2_client || new Aptos(), address),
    retry: false,
  });
  return balance;
}
