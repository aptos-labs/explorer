import {Types} from "aptos";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {ResponseError} from "../client";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {view} from "../index";

export function useViewFunction(
  functionName: string,
  typeArgs: string[],
  args: string[],
): UseQueryResult<Types.MoveValue[], ResponseError> {
  const [state] = useGlobalState();

  const request: Types.ViewRequest = {
    function: functionName,
    type_arguments: typeArgs,
    arguments: args,
  };

  return useQuery<Types.MoveValue[], ResponseError>({
    queryKey: [
      "viewFunction",
      {functionName, typeArgs, args},
      state.network_value,
    ],
    queryFn: () => view(request, state.aptos_client),
    refetchOnWindowFocus: false,
  });
}
