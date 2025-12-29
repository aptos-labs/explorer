import {Types} from "aptos";
import {UseQueryResult} from "@tanstack/react-query";
import {ResponseError} from "../client";
import {useGetAccountModule} from "./useGetAccountModule";
import {extractModuleMetadata} from "../../utils/tableItemParsing";

/**
 * Hook to fetch ABI for a table item based on resourceType
 */
export function useGetTableItemABI(
  resourceType?: string,
  accountAddress?: string,
): UseQueryResult<Types.MoveModule | null, ResponseError> {
  // Extract module metadata from resourceType
  const moduleMetadata = resourceType
    ? extractModuleMetadata(resourceType)
    : null;

  // Determine which address to use (from resourceType or accountAddress)
  const moduleAddress = moduleMetadata?.address || accountAddress || "";
  const moduleName = moduleMetadata?.moduleName || "";

  // Fetch the module ABI (will fail gracefully if address/name is empty)
  const {
    data: moduleBytecode,
    isLoading,
    error,
  } = useGetAccountModule(moduleAddress, moduleName);

  return {
    data: moduleBytecode?.abi || null,
    isLoading,
    error: error || undefined,
    isError: !!error,
    isSuccess: !isLoading && !error && !!moduleBytecode?.abi,
    refetch: async () => {
      // This will be handled by the underlying query
      return {data: moduleBytecode?.abi || null, error: error || undefined};
    },
  } as UseQueryResult<Types.MoveModule | null, ResponseError>;
}
