import {Types} from "aptos";
import {useQuery} from "@tanstack/react-query";
import {useGlobalState} from "../../global-config/GlobalConfig";

export function useGetAccountAPTBalance(
  address: Types.Address,
  coinType?: `0x${string}::${string}::${string}`, // 可选：要查的币，不传=APT
) {
  const [state] = useGlobalState();

  return useQuery<string, Error>({
    queryKey: ["coinBalance_rawView", {address, coinType}, state.network_value],
    retry: false,
    queryFn: async () => {
      const type = coinType ?? ("0x1::aptos_coin::AptosCoin" as const);

      // 取 REST 基地址（按你项目字段来，兜底到本地 8080）
      const baseUrl =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (state as any)?.network_value?.api_url ??
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (state as any)?.network_value?.node_url ??
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (state as any)?.sdk_v2_client?.config?.client?.baseUrl ??
        "http://127.0.0.1:8080";

      const resp = await fetch(`${baseUrl}/v1/view`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          function: "0x1::coin::balance",
          type_arguments: [type],
          arguments: [address],
        }),
      });
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} when calling /v1/view`);
      }
      const json = await resp.json();
      // /v1/view 返回形如 ["100000000"]
      const val = Array.isArray(json) ? json[0] : "0";
      return (val ?? "0").toString();
    },
  });
}