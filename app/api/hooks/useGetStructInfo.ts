import {Types} from "aptos";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {getAccountModule} from "..";
import {ResponseError} from "../client";
import {useNetworkValue, useAptosClient} from "../../global-config";

export type StructField = {
  name: string;
  type: string;
};

export type StructInfo = {
  // Struct definition from ABI
  struct: Types.MoveStruct | null;
  // Fields from the struct
  fields: StructField[];
  // The full struct type string
  fullType: string;
  // Parsed components
  address: string | null;
  moduleName: string | null;
  structName: string | null;
};

// Parse a struct type string like "0x1::coin::WithdrawEvent" into parts
// Also handles generics like "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
function parseStructType(typeStr: string): {
  address: string;
  moduleName: string;
  structName: string;
  typeArgs: string[];
} | null {
  // Handle generics - extract the base type and type arguments
  const genericMatch = typeStr.match(/^([^<]+)(?:<(.+)>)?$/);
  if (!genericMatch) return null;

  const baseType = genericMatch[1];
  const typeArgsStr = genericMatch[2];

  const parts = baseType.split("::");
  if (parts.length !== 3) return null;

  // Parse type arguments (handle nested generics)
  const typeArgs: string[] = [];
  if (typeArgsStr) {
    let depth = 0;
    let current = "";
    for (let i = 0; i < typeArgsStr.length; i++) {
      const char = typeArgsStr[i];
      if (char === "<") {
        depth++;
        current += char;
      } else if (char === ">") {
        depth--;
        current += char;
      } else if (char === "," && depth === 0) {
        typeArgs.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    if (current.trim()) {
      typeArgs.push(current.trim());
    }
  }

  return {
    address: parts[0],
    moduleName: parts[1],
    structName: parts[2],
    typeArgs,
  };
}

/**
 * Hook to fetch struct information (field names and types) for a given struct type.
 */
export function useGetStructInfo(
  typeStr: string | null | undefined,
): UseQueryResult<StructInfo, ResponseError> {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();

  const parsed = typeStr ? parseStructType(typeStr) : null;

  return useQuery<StructInfo, ResponseError>({
    queryKey: [
      "structInfo",
      {
        address: parsed?.address,
        moduleName: parsed?.moduleName,
        structName: parsed?.structName,
      },
      networkValue,
    ],
    queryFn: async () => {
      if (!parsed) {
        return {
          struct: null,
          fields: [],
          fullType: typeStr || "",
          address: null,
          moduleName: null,
          structName: null,
        };
      }

      const {address, moduleName, structName} = parsed;

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

      // Find the struct in the ABI
      const struct =
        moduleAbi?.structs.find((s) => s.name === structName) ?? null;

      // Get fields from struct
      const fields: StructField[] =
        struct?.fields.map((f) => ({
          name: f.name,
          type: f.type,
        })) ?? [];

      return {
        struct,
        fields,
        fullType: typeStr || "",
        address,
        moduleName,
        structName,
      };
    },
    enabled: !!parsed,
    refetchOnWindowFocus: false,
    // Cache struct info for a long time since it rarely changes
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}
