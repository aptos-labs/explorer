import {useQuery} from "@tanstack/react-query";
import type {Types} from "~/types/aptos";
import {
  useAptosClient,
  useNetworkValue,
  useSdkV2Client,
} from "../../global-config";
import {tryStandardizeAddress} from "../../utils";
import {getTransaction} from "../index";

export interface ObjectRefs {
  hasTransferRef: boolean;
  hasDeleteRef: boolean;
  hasExtendRef: boolean;
  creationTransactionVersion: number | null;
}

const OBJECT_CREATION_TX_QUERY = `
  query ObjectCreationTransaction($address: String) {
    account_transactions(
      where: {account_address: {_eq: $address}}
      order_by: {transaction_version: asc}
      limit: 1
    ) {
      transaction_version
    }
  }
`;

export type RefKey = "transfer" | "delete" | "extend";

function classifyRefFromKeyPath(keyPath: string[]): Set<RefKey> {
  const found = new Set<RefKey>();
  const hasKey = (pattern: RegExp) => keyPath.some((k) => pattern.test(k));

  if (hasKey(/transfer(?!_event)/i)) {
    found.add("transfer");
  }
  if (hasKey(/delete/i)) {
    found.add("delete");
  }
  if (hasKey(/extend/i)) {
    found.add("extend");
  }

  // AptosToken stores DeleteRef as burn_ref.self (not burn_ref.inner)
  if (hasKey(/burn/i) && !hasKey(/^inner$/)) {
    found.add("delete");
  }

  return found;
}

export function scanForRefs(
  data: unknown,
  objectAddress: string,
  keyPath: string[],
): Set<RefKey> {
  const found = new Set<RefKey>();

  if (data === null || data === undefined || typeof data !== "object") {
    return found;
  }

  if (Array.isArray(data)) {
    for (const item of data) {
      for (const ref of scanForRefs(item, objectAddress, keyPath)) {
        found.add(ref);
      }
    }
    return found;
  }

  const record = data as Record<string, unknown>;

  if (
    "self" in record &&
    typeof record.self === "string" &&
    Object.keys(record).length <= 2
  ) {
    const normalizedSelf = tryStandardizeAddress(record.self);
    if (normalizedSelf === objectAddress) {
      for (const ref of classifyRefFromKeyPath(keyPath)) {
        found.add(ref);
      }
    }
    return found;
  }

  if ("vec" in record && Array.isArray(record.vec)) {
    for (const item of record.vec) {
      for (const ref of scanForRefs(item, objectAddress, keyPath)) {
        found.add(ref);
      }
    }
  }

  for (const [key, value] of Object.entries(record)) {
    if (key === "vec") continue;
    for (const ref of scanForRefs(value, objectAddress, [...keyPath, key])) {
      found.add(ref);
    }
  }

  return found;
}

export function detectRefsInTransaction(
  transaction: Types.Transaction,
  objectAddress: string,
): Omit<ObjectRefs, "creationTransactionVersion"> {
  const result = {
    hasTransferRef: false,
    hasDeleteRef: false,
    hasExtendRef: false,
  };

  if (!("changes" in transaction)) {
    return result;
  }

  const changes = (transaction as {changes: Types.WriteSetChange[]}).changes;
  const allFoundRefs = new Set<RefKey>();

  for (const change of changes) {
    if (change.type !== "write_resource" && change.type !== "create_resource") {
      continue;
    }

    const c = change as {address: string; data: {type: string; data: unknown}};
    const refs = scanForRefs(c.data.data, objectAddress, []);
    for (const ref of refs) {
      allFoundRefs.add(ref);
    }
  }

  result.hasTransferRef = allFoundRefs.has("transfer");
  result.hasDeleteRef = allFoundRefs.has("delete");
  result.hasExtendRef = allFoundRefs.has("extend");

  return result;
}

const NO_REFS: ObjectRefs = {
  hasTransferRef: false,
  hasDeleteRef: false,
  hasExtendRef: false,
  creationTransactionVersion: null,
};

export function useGetObjectRefs(
  address: string,
  options?: {enabled?: boolean},
): {
  data: ObjectRefs | undefined;
  isLoading: boolean;
  error: unknown;
} {
  const enabled = options?.enabled ?? true;
  const normalizedAddress = tryStandardizeAddress(address);
  const sdkClient = useSdkV2Client();
  const aptosClient = useAptosClient();
  const networkValue = useNetworkValue();

  const {
    data: creationData,
    isLoading: creationLoading,
    isSuccess: creationSuccess,
    error: creationError,
  } = useQuery({
    queryKey: ["objectCreationTx", normalizedAddress, networkValue],
    queryFn: () =>
      sdkClient.queryIndexer<{
        account_transactions: {transaction_version: number}[];
      }>({
        query: {
          query: OBJECT_CREATION_TX_QUERY,
          variables: {address: normalizedAddress},
        },
      }),
    enabled: enabled && !!normalizedAddress,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });

  const creationVersion =
    creationData?.account_transactions?.[0]?.transaction_version ?? null;

  const hasCreationTx = creationVersion !== null;

  const {
    data: refsData,
    isLoading: refsLoading,
    error: refsError,
  } = useQuery({
    queryKey: ["objectRefs", normalizedAddress, creationVersion, networkValue],
    queryFn: async (): Promise<ObjectRefs> => {
      if (!hasCreationTx || !normalizedAddress) {
        return NO_REFS;
      }

      const tx = await getTransaction(
        {txnHashOrVersion: creationVersion},
        aptosClient,
      );
      const refs = detectRefsInTransaction(tx, normalizedAddress);

      return {
        ...refs,
        creationTransactionVersion: creationVersion,
      };
    },
    enabled: enabled && !!normalizedAddress && creationSuccess,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });

  return {
    data: refsData,
    isLoading: enabled ? creationLoading || refsLoading : false,
    error: creationError || refsError,
  };
}
