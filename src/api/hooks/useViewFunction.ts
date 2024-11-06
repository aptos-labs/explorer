import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {ResponseError} from "../client";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {viewJson} from "../v2";
import {InputViewFunctionJsonData} from "@aptos-labs/ts-sdk";

export function useViewFunction<T>(
  functionName: `${string}::${string}::${string}`,
  typeArgs: `${string}::${string}::${string}`[],
  args: string[],
): UseQueryResult<T[], ResponseError> {
  const [state] = useGlobalState();

  const request: InputViewFunctionJsonData = {
    function: functionName,
    typeArguments: typeArgs,
    functionArguments: args,
  };

  return useQuery<T[], ResponseError>({
    queryKey: [
      "viewFunction",
      {functionName, typeArgs, args},
      state.network_value,
    ],
    queryFn: () => viewJson(request, state.sdk_v2_client),
    refetchOnWindowFocus: false,
  });
}
