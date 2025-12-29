import {Types} from "aptos";
import {useQuery, UseQueryOptions, UseQueryResult} from "@tanstack/react-query";
import {ResponseError} from "../client";
import {
  useNetworkValue,
  useAptosClient,
} from "../../global-config/GlobalConfig";
import {view} from "../index";

export type UseViewFunctionOptions = Pick<
  UseQueryOptions<Types.MoveValue[], ResponseError>,
  "enabled" | "gcTime" | "staleTime"
>;

export function useViewFunction(
  functionName: string,
  typeArgs: string[],
  args: string[],
  options: UseViewFunctionOptions = {},
): UseQueryResult<Types.MoveValue[], ResponseError> {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();

  const request: Types.ViewRequest = {
    function: functionName,
    type_arguments: typeArgs,
    arguments: args,
  };

  return useQuery<Types.MoveValue[], ResponseError>({
    queryKey: ["viewFunction", {functionName, typeArgs, args}, networkValue],
    queryFn: () => view(request, aptosClient),
    refetchOnWindowFocus: false,
    ...options,
  });
}
