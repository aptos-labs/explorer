import {tryStandardizeAddress} from "./utils";

export type FlowDirection = "inbound" | "outbound";

export type TokenFlowEdge = {
  id: string;
  source: string;
  target: string;
  version: number;
  amount: string;
  timestamp: string | null;
};

export type FaActivityRow = {
  transaction_version: number;
  transaction_timestamp?: string | null;
  owner_address: string;
  type: string;
  amount: number | null;
};

const DEPOSIT_TYPES = new Set([
  "0x1::fungible_asset::Deposit",
  "0x1::coin::DepositEvent",
]);

const WITHDRAW_TYPES = new Set([
  "0x1::fungible_asset::Withdraw",
  "0x1::coin::WithdrawEvent",
]);

export function activityTypesForDirection(direction: FlowDirection): string[] {
  return direction === "inbound" ? [...DEPOSIT_TYPES] : [...WITHDRAW_TYPES];
}

export function signedActivityAmount(row: FaActivityRow): bigint {
  const raw = BigInt(row.amount ?? 0);
  if (WITHDRAW_TYPES.has(row.type)) {
    return -raw;
  }
  if (DEPOSIT_TYPES.has(row.type)) {
    return raw;
  }
  return BigInt(0);
}

function normalizeOwner(addr: string): string {
  return tryStandardizeAddress(addr) ?? addr;
}

/**
 * Build per-owner net balance delta for one asset within a single transaction.
 */
export function netByOwnerForAsset(rows: FaActivityRow[]): Map<string, bigint> {
  const map = new Map<string, bigint>();
  for (const row of rows) {
    const owner = normalizeOwner(row.owner_address);
    const delta = signedActivityAmount(row);
    if (delta === BigInt(0)) {
      continue;
    }
    map.set(owner, (map.get(owner) ?? BigInt(0)) + delta);
  }
  return map;
}

/**
 * Pick the primary counterparty for a transfer involving `center`.
 */
export function pickCounterpartyAddress(
  center: string,
  netByOwner: Map<string, bigint>,
): string | undefined {
  const c = normalizeOwner(center);
  const cNet = netByOwner.get(c) ?? BigInt(0);
  if (cNet === BigInt(0)) {
    return undefined;
  }

  const entries = [...netByOwner.entries()].filter(([o]) => o !== c);
  if (cNet < BigInt(0)) {
    const gainers = entries
      .filter(([, n]) => n > BigInt(0))
      .sort((a, b) => {
        if (b[1] === a[1]) {
          return a[0].localeCompare(b[0]);
        }
        return b[1] > a[1] ? 1 : -1;
      });
    return gainers[0]?.[0];
  }

  const losers = entries
    .filter(([, n]) => n < BigInt(0))
    .sort((a, b) => {
      if (a[1] === b[1]) {
        return a[0].localeCompare(b[0]);
      }
      return a[1] < b[1] ? -1 : 1;
    });
  return losers[0]?.[0];
}

export function buildEdgesFromBatches(args: {
  center: string;
  direction: FlowDirection;
  batches: Map<number, FaActivityRow[]>;
}): TokenFlowEdge[] {
  const {center, direction, batches} = args;
  const c = normalizeOwner(center);
  const edges: TokenFlowEdge[] = [];

  for (const [version, rows] of batches) {
    const net = netByOwnerForAsset(rows);
    const counterparty = pickCounterpartyAddress(c, net);
    if (!counterparty) {
      continue;
    }

    const cNet = net.get(c) ?? BigInt(0);
    const magnitude =
      cNet < BigInt(0) ? -cNet : cNet > BigInt(0) ? cNet : BigInt(0);
    if (magnitude === BigInt(0)) {
      continue;
    }

    const ts =
      rows.find((r) => r.transaction_timestamp)?.transaction_timestamp ?? null;

    if (direction === "outbound" && cNet < BigInt(0)) {
      edges.push({
        id: `${version}:${c}:${counterparty}`,
        source: c,
        target: counterparty,
        version,
        amount: magnitude.toString(),
        timestamp: ts,
      });
    } else if (direction === "inbound" && cNet > BigInt(0)) {
      edges.push({
        id: `${version}:${counterparty}:${c}`,
        source: counterparty,
        target: c,
        version,
        amount: magnitude.toString(),
        timestamp: ts,
      });
    }
  }

  return edges;
}
