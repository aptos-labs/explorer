import {type UseQueryResult, useQuery} from "@tanstack/react-query";
import type {Types} from "~/types/aptos";
import {useAptosClient, useNetworkValue} from "../../global-config";
import {
  type AccountKeyTypeInfo,
  extractAccountKeyTypeFromSignature,
} from "../../pages/Account/utils/accountKeyType";
import type {ResponseError} from "../client";
import {getAccountTransactions} from "../index";

export type AccountKeyTypeResult = {
  /** Structured key type info derived from the latest sender transaction. */
  keyType: AccountKeyTypeInfo | null;
  /** Version of the transaction the key type was inferred from. */
  transactionVersion: string | null;
  /** Hash of the transaction the key type was inferred from. */
  transactionHash: string | null;
};

/**
 * Identify an account's key type by inspecting the most recent transaction it
 * submitted. The Aptos REST API does not expose the public-key scheme on the
 * account resource itself; the latest transaction's authenticator is the
 * authoritative on-chain signal.
 *
 * Behaviour:
 *  - When `sequenceNumber === 0` the account has never submitted a
 *    transaction; resolves with `keyType: null`.
 *  - Fetches a single transaction starting at `sequenceNumber - 1`.
 *  - Unwraps multi-agent / fee-payer wrappers and returns the sender
 *    authenticator's key type (Ed25519, Multi-Ed25519, Single Key, or
 *    MultiKey + sub-key types).
 */
export function useGetAccountKeyType(
  address: string,
  sequenceNumber: string | undefined,
  options?: {enabled?: boolean},
): UseQueryResult<AccountKeyTypeResult, ResponseError> {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();
  const enabled = options?.enabled ?? true;
  const seqNum =
    sequenceNumber !== undefined
      ? Number.parseInt(sequenceNumber, 10)
      : Number.NaN;
  const hasTransactions = Number.isFinite(seqNum) && seqNum > 0;

  return useQuery<AccountKeyTypeResult, ResponseError>({
    queryKey: ["accountKeyType", {address, sequenceNumber}, networkValue],
    queryFn: async (): Promise<AccountKeyTypeResult> => {
      if (!hasTransactions) {
        return {
          keyType: null,
          transactionVersion: null,
          transactionHash: null,
        };
      }
      const start = Math.max(seqNum - 1, 0);
      const transactions = await getAccountTransactions(
        {address, start, limit: 1},
        aptosClient,
      );
      const latest = transactions[0];
      if (!latest) {
        return {
          keyType: null,
          transactionVersion: null,
          transactionHash: null,
        };
      }
      const userTxn = latest as Partial<Types.Transaction_UserTransaction>;
      const keyType =
        extractAccountKeyTypeFromSignature(userTxn.signature) ?? null;
      return {
        keyType,
        transactionVersion: userTxn.version ?? null,
        transactionHash: userTxn.hash ?? null,
      };
    },
    enabled: enabled && !!address,
    // The latest sender transaction can change every time the account
    // submits a new transaction; keep a short stale window like the
    // related transactions list.
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: false,
  });
}
