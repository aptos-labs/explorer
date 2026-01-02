import {useGetUserTransactionFunctionInfo} from "../../../api/hooks/useUserTransactionFunctionInfo";

const DAA_FUNCTION_INFOS = new Set([
  "0000000000000000000000000000000000000000000000000000000000000001::solana_derivable_account::authenticate",
  "0000000000000000000000000000000000000000000000000000000000000001::ethereum_derivable_account::authenticate",
]);

/**
 * Determines if an account is a Derivable Aptos Account (DAA) by checking
 * the first entry_function_payload transaction for abstract signature patterns
 * that indicate Solana or Ethereum derivable accounts.
 */
export function useIsDaaAccount(address: string): boolean {
  // Get the first user transaction function info to check if it's a known DAA type
  const {data: userTransactionFunctionInfos} =
    useGetUserTransactionFunctionInfo(1, address);

  // Check if this is a known DAA type (Solana or Ethereum derivable account)
  if (
    userTransactionFunctionInfos &&
    userTransactionFunctionInfos.length > 0 &&
    DAA_FUNCTION_INFOS.has(
      userTransactionFunctionInfos[0].signature.function_info,
    )
  ) {
    return true;
  }

  return false;
}
