import {useMemo} from "react";
import {Types} from "aptos";
import {useGetAccountTransactions} from "../../../api/hooks/useGetAccountTransactions";
import {TransactionTypeName} from "../../../components/TransactionType";

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
  // Get the first few transactions to find the first entry_function_payload
  const {data: transactions} = useGetAccountTransactions(address, 0, 10);

  const isDAA = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return false;
    }

    for (const transaction of transactions) {
      // Only check user transactions (not block metadata or other types)
      if (transaction.type !== TransactionTypeName.User) {
        continue;
      }

      const userTransaction = transaction as Types.Transaction_UserTransaction;

      // Ensure the transaction has a payload
      if (!("payload" in userTransaction)) {
        continue;
      }

      let payload: Types.TransactionPayload_EntryFunctionPayload | undefined;

      // Extract entry_function_payload if present
      if (userTransaction.payload.type === "entry_function_payload") {
        payload =
          userTransaction.payload as Types.TransactionPayload_EntryFunctionPayload;
      }

      if (payload) {
        // Check that the transaction has a signature object
        if (!("signature" in userTransaction)) {
          return false;
        }

        // Ensure signature exists, i.e not null or undefined
        if (!userTransaction.signature) {
          return false;
        }

        let transactionSignature:
          | Types.AccountSignature
          | Types.TransactionSignature
          | undefined;

        if (userTransaction.signature.type === "fee_payer_signature") {
          // should have a "sender" object
          // Ensure signature has a sender object
          if (!("sender" in userTransaction.signature)) {
            return false;
          }
          transactionSignature = userTransaction.signature.sender;
        } else if (userTransaction.signature.type === "single_sender") {
          // does not have a "sender" object
          transactionSignature = userTransaction.signature;
        }

        // Explorer use deprecated "aptos" package types, and so abstract signature is not part of its types
        // so need to cast to any to access function_info
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const functionInfo = (transactionSignature as any).function_info;

        // Check if this is a known DAA type (Solana or Ethereum derivable account)
        if (functionInfo && DAA_FUNCTION_INFOS.has(functionInfo)) {
          return true;
        }

        // If we found an entry_function_payload with abstract_signature
        // but it's not one of the known DAA function info, it's not a DAA
        return false;
      }
    }

    return false;
  }, [transactions]);

  return isDAA;
}
