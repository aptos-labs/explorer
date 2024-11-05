import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {ResponseError} from "../../client";
import {useGlobalState} from "../../../global-config/GlobalConfig";
import {view} from "../../v2";
import {InputViewFunctionData, MoveValue} from "@aptos-labs/ts-sdk";

export function useViewFunction(
  functionName: `${string}::${string}::${string}`,
  typeArgs: string[],
  args: string[],
): UseQueryResult<MoveValue[], ResponseError> {
  const [state] = useGlobalState();

  const request: InputViewFunctionData = {
    function: functionName,
    typeArguments: typeArgs,
    functionArguments: args,
  };

  return useQuery<MoveValue[], ResponseError>({
    queryKey: [
      "viewFunction",
      {functionName, typeArgs, args},
      state.network_value,
    ],
    queryFn: () => view(request, state.sdk_v2_client),
    refetchOnWindowFocus: false,
  });
}
