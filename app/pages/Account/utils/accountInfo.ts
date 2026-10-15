import type {Types} from "~/types/aptos";
import {isNotFoundError, type ResponseError} from "../../../api/client";

/**
 * AIP-115 stateless accounts have no `0x1::account::Account` resource.
 * The node reports sequence number 0 and an authentication key equal to the
 * address until a sequence-number transaction or key rotation creates the resource.
 */
export const STATELESS_SEQUENCE_NUMBER = "0";

export type AccountOnChainActivity = {
  holdsFunds: boolean;
  hasSentTransactions: boolean;
};

export type IndexerActivityResponse = {
  balances?: {amount?: number | string | null}[] | null;
  sent?: {version?: number | string | null}[] | null;
};

export type ActivityProbe = {
  enabled: boolean;
  graphqlSupported: boolean;
  indexer?: AccountOnChainActivity;
  indexerPending: boolean;
  indexerError: boolean;
  aptBalance?: string;
  aptPending: boolean;
  restSent?: boolean;
  restPending: boolean;
};

export function positiveBalance(
  amount: number | string | null | undefined,
): boolean {
  if (amount === null || amount === undefined || amount === "") return false;
  try {
    return BigInt(amount) > 0n;
  } catch {
    const parsed = Number(amount);
    return Number.isFinite(parsed) && parsed > 0;
  }
}

export function activityFromIndexer(
  data: IndexerActivityResponse | null | undefined,
): AccountOnChainActivity {
  const holdsFunds = (data?.balances ?? []).some((row) =>
    positiveBalance(row.amount),
  );
  const hasSentTransactions = (data?.sent ?? []).some(
    (row) => row.version !== null && row.version !== undefined,
  );
  return {holdsFunds, hasSentTransactions};
}

export function statelessAccountData(address: string): Types.AccountData {
  return {
    sequence_number: STATELESS_SEQUENCE_NUMBER,
    authentication_key: address,
  };
}

/**
 * Prefer the on-chain Account resource. When it is absent, show the AIP-115
 * defaults only if the address holds funds or has sent a transaction.
 */
export function displayedAccountData(
  address: string,
  onChain: Types.AccountData | undefined,
  activity: AccountOnChainActivity | undefined,
): Types.AccountData | undefined {
  if (onChain) return onChain;
  if (!address || !activity) return undefined;
  if (activity.holdsFunds || activity.hasSentTransactions) {
    return statelessAccountData(address);
  }
  return undefined;
}

/**
 * Combine indexer, APT view, and REST sender history.
 * A positive indexer hit resolves immediately. Otherwise wait for the probes
 * that can still prove activity.
 */
export function resolveAccountActivity(probe: ActivityProbe): {
  pending: boolean;
  activity: AccountOnChainActivity | undefined;
} {
  if (!probe.enabled) {
    return {pending: false, activity: undefined};
  }

  const indexerKnown =
    probe.graphqlSupported && !!probe.indexer && !probe.indexerError;
  const holdsFromIndexer = indexerKnown && !!probe.indexer?.holdsFunds;
  const sentFromIndexer = indexerKnown && !!probe.indexer?.hasSentTransactions;

  if ((holdsFromIndexer || sentFromIndexer) && !probe.indexerPending) {
    return {
      pending: false,
      activity: {
        holdsFunds: holdsFromIndexer || positiveBalance(probe.aptBalance),
        hasSentTransactions: sentFromIndexer || !!probe.restSent,
      },
    };
  }

  const indexerReady =
    !probe.graphqlSupported || probe.indexerError || !probe.indexerPending;
  const needRest = !probe.graphqlSupported || probe.indexerError;
  const restReady = !needRest || !probe.restPending;
  const aptReady = !probe.aptPending || positiveBalance(probe.aptBalance);

  if (!indexerReady || !restReady || !aptReady) {
    return {pending: true, activity: undefined};
  }

  return {
    pending: false,
    activity: {
      holdsFunds: holdsFromIndexer || positiveBalance(probe.aptBalance),
      hasSentTransactions: sentFromIndexer || !!probe.restSent,
    },
  };
}

/**
 * Page-level errors for a bad address, a failed layout probe, or a failed
 * resource list. A missing Account resource is not an error: stateless
 * accounts are valid and must not show "Account Not Found".
 */
export function selectAccountPageError(input: {
  addressError: ResponseError | null;
  layoutError: ResponseError | null;
  resourceError: ResponseError | null | undefined;
}): ResponseError | null {
  if (input.addressError) return input.addressError;
  if (input.layoutError) return input.layoutError;
  if (input.resourceError && !isNotFoundError(input.resourceError)) {
    return input.resourceError;
  }
  return null;
}
