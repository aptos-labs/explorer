import {Types} from "aptos";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {getAccountModule, getAccountResource} from "..";
import {ResponseError} from "../client";
import {useNetworkValue, useAptosClient} from "../../global-config";
import {
  transformCode,
  extractFunctionParamNames,
  extractFunctionTypeParamNames,
} from "../../utils";

export type FunctionInfo = {
  // Function from ABI
  fn: Types.MoveFunction | null;
  // Parameter types from ABI (with signer removed if entry function)
  paramTypes: string[];
  // Parameter names extracted from source code
  paramNames: string[] | null;
  // Type parameter names extracted from source code
  typeParamNames: string[] | null;
  // Full parameter info combining names and types
  params: Array<{
    name: string | null;
    type: string;
    index: number;
  }>;
  // Return types from ABI
  returnTypes: string[];
  // Whether the function has a signer parameter (first param)
  hasSigner: boolean;
  // The decoded source code (if available)
  sourceCode: string | null;
};

// Parse a function string like "0x1::coin::transfer" into parts
function parseFunctionString(functionStr: string): {
  address: string;
  moduleName: string;
  functionName: string;
} | null {
  const parts = functionStr.split("::");
  if (parts.length !== 3) return null;
  return {
    address: parts[0],
    moduleName: parts[1],
    functionName: parts[2],
  };
}

// Remove signer params from parameter list
function removeSignerParams(params: string[]): string[] {
  return params.filter((p) => p !== "signer" && p !== "&signer");
}

// Check if a function has a signer parameter
function hasSigner(params: string[]): boolean {
  return params.some((p) => p === "signer" || p === "&signer");
}

/**
 * Hook to fetch function information (ABI + source code) for a given function string.
 * Returns parameter names, types, and other function metadata.
 */
export function useGetFunctionInfo(
  functionStr: string | null | undefined,
): UseQueryResult<FunctionInfo, ResponseError> {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();

  const parsed = functionStr ? parseFunctionString(functionStr) : null;

  return useQuery<FunctionInfo, ResponseError>({
    queryKey: [
      "functionInfo",
      {
        address: parsed?.address,
        moduleName: parsed?.moduleName,
        functionName: parsed?.functionName,
      },
      networkValue,
    ],
    queryFn: async () => {
      if (!parsed) {
        return {
          fn: null,
          paramTypes: [],
          paramNames: null,
          typeParamNames: null,
          params: [],
          returnTypes: [],
          hasSigner: false,
          sourceCode: null,
        };
      }

      const {address, moduleName, functionName} = parsed;

      // Fetch module ABI
      let moduleAbi: Types.MoveModule | null = null;
      try {
        const moduleData = await getAccountModule(
          {address, moduleName},
          aptosClient,
        );
        moduleAbi = moduleData.abi ?? null;
      } catch {
        // Module might not exist or be accessible
      }

      // Find the function in the ABI
      const fn =
        moduleAbi?.exposed_functions.find((f) => f.name === functionName) ??
        null;

      // Get parameter types from ABI
      const allParamTypes = fn?.params ?? [];
      const fnHasSigner = hasSigner(allParamTypes);
      const paramTypes = removeSignerParams(allParamTypes);

      // Try to get source code for parameter names
      let sourceCode: string | null = null;
      let paramNames: string[] | null = null;
      let typeParamNames: string[] | null = null;

      try {
        // Fetch package registry to get source code
        const registry = await getAccountResource(
          {address, resourceType: "0x1::code::PackageRegistry"},
          aptosClient,
        );

        const registryData = registry?.data as {
          packages?: Array<{
            modules: Array<{name: string; source: string}>;
          }>;
        };

        // Find the module source
        for (const pkg of registryData?.packages ?? []) {
          const moduleSource = pkg.modules.find((m) => m.name === moduleName);
          if (moduleSource?.source) {
            sourceCode = transformCode(moduleSource.source);
            if (sourceCode) {
              // Extract parameter names
              const extractedNames = extractFunctionParamNames(
                sourceCode,
                functionName,
              );
              // If function has signer, remove the first param name
              if (extractedNames && fnHasSigner) {
                paramNames = extractedNames.slice(1);
              } else {
                paramNames = extractedNames;
              }

              // Extract type parameter names
              typeParamNames = extractFunctionTypeParamNames(
                sourceCode,
                functionName,
              );
            }
            break;
          }
        }
      } catch {
        // Source code might not be available
      }

      // Combine names and types
      const params = paramTypes.map((type, index) => ({
        name: paramNames?.[index] ?? null,
        type,
        index,
      }));

      return {
        fn,
        paramTypes,
        paramNames,
        typeParamNames,
        params,
        returnTypes: fn?.return ?? [],
        hasSigner: fnHasSigner,
        sourceCode,
      };
    },
    enabled: !!parsed,
    refetchOnWindowFocus: false,
    // Cache function info for a long time since it rarely changes
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}
