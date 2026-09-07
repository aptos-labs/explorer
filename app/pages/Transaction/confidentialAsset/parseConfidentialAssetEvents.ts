import type {Types} from "~/types/aptos";
import {extractEntryFunctionPayload} from "../../../utils/cliCommand";

export const CONFIDENTIAL_ASSET_MODULE = "0x1::confidential_asset";

export const CONFIDENTIAL_ASSET_EVENT_TYPES = {
  transferred: `${CONFIDENTIAL_ASSET_MODULE}::Transferred`,
  deposited: `${CONFIDENTIAL_ASSET_MODULE}::Deposited`,
  withdrawn: `${CONFIDENTIAL_ASSET_MODULE}::Withdrawn`,
  registered: `${CONFIDENTIAL_ASSET_MODULE}::Registered`,
  rolledOver: `${CONFIDENTIAL_ASSET_MODULE}::RolledOver`,
  normalized: `${CONFIDENTIAL_ASSET_MODULE}::Normalized`,
  keyRotated: `${CONFIDENTIAL_ASSET_MODULE}::KeyRotated`,
} as const;

export type ConfidentialAssetSubAction =
  | "transfer"
  | "deposit"
  | "withdraw"
  | "register"
  | "rollover"
  | "normalize"
  | "key_rotation";

export type ConfidentialAssetAction = {
  actionType: "confidential asset";
  subAction: ConfidentialAssetSubAction;
  metadata: string;
  from?: string;
  to?: string;
  addr?: string;
  amount?: string;
};

function extractObjectInner(arg: unknown): string {
  if (typeof arg === "object" && arg !== null && "inner" in arg) {
    return (arg as {inner: string}).inner;
  }
  return String(arg);
}

function parseMetadata(data: Record<string, unknown>): string | undefined {
  const assetType = data.asset_type;
  if (assetType === undefined || assetType === null) {
    return undefined;
  }
  const metadata = extractObjectInner(assetType);
  return metadata.length > 0 ? metadata : undefined;
}

function makeAction(
  subAction: ConfidentialAssetSubAction,
  metadata: string,
  fields: Omit<
    ConfidentialAssetAction,
    "actionType" | "subAction" | "metadata"
  >,
): ConfidentialAssetAction {
  return {
    actionType: "confidential asset",
    subAction,
    metadata,
    ...fields,
  };
}

export function parseConfidentialTransferEvent(
  event: Types.Event,
): ConfidentialAssetAction | undefined {
  if (event.type !== CONFIDENTIAL_ASSET_EVENT_TYPES.transferred) {
    return undefined;
  }

  const data = event.data as Record<string, unknown>;
  const metadata = parseMetadata(data);
  const from = data.from;
  const to = data.to;
  if (
    !metadata ||
    typeof from !== "string" ||
    typeof to !== "string" ||
    from.length === 0 ||
    to.length === 0
  ) {
    return undefined;
  }

  return makeAction("transfer", metadata, {from, to});
}

export function parseConfidentialDepositEvent(
  event: Types.Event,
): ConfidentialAssetAction | undefined {
  if (event.type !== CONFIDENTIAL_ASSET_EVENT_TYPES.deposited) {
    return undefined;
  }

  const data = event.data as Record<string, unknown>;
  const metadata = parseMetadata(data);
  const addr = data.addr;
  const amount = data.amount;
  if (
    !metadata ||
    typeof addr !== "string" ||
    addr.length === 0 ||
    (amount !== undefined &&
      amount !== null &&
      typeof amount !== "string" &&
      typeof amount !== "number")
  ) {
    return undefined;
  }

  return makeAction("deposit", metadata, {
    addr,
    amount:
      amount !== undefined && amount !== null ? String(amount) : undefined,
  });
}

export function parseConfidentialWithdrawEvent(
  event: Types.Event,
): ConfidentialAssetAction | undefined {
  if (event.type !== CONFIDENTIAL_ASSET_EVENT_TYPES.withdrawn) {
    return undefined;
  }

  const data = event.data as Record<string, unknown>;
  const metadata = parseMetadata(data);
  const from = data.from;
  const to = data.to;
  const amount = data.amount;
  if (
    !metadata ||
    typeof from !== "string" ||
    typeof to !== "string" ||
    from.length === 0 ||
    to.length === 0 ||
    (amount !== undefined &&
      amount !== null &&
      typeof amount !== "string" &&
      typeof amount !== "number")
  ) {
    return undefined;
  }

  return makeAction("withdraw", metadata, {
    from,
    to,
    amount:
      amount !== undefined && amount !== null ? String(amount) : undefined,
  });
}

export function parseConfidentialRegisterEvent(
  event: Types.Event,
): ConfidentialAssetAction | undefined {
  if (event.type !== CONFIDENTIAL_ASSET_EVENT_TYPES.registered) {
    return undefined;
  }

  const data = event.data as Record<string, unknown>;
  const metadata = parseMetadata(data);
  const addr = data.addr;
  if (!metadata || typeof addr !== "string" || addr.length === 0) {
    return undefined;
  }

  return makeAction("register", metadata, {addr});
}

export function parseConfidentialRolloverEvent(
  event: Types.Event,
): ConfidentialAssetAction | undefined {
  if (event.type !== CONFIDENTIAL_ASSET_EVENT_TYPES.rolledOver) {
    return undefined;
  }

  const data = event.data as Record<string, unknown>;
  const metadata = parseMetadata(data);
  const addr = data.addr;
  if (!metadata || typeof addr !== "string" || addr.length === 0) {
    return undefined;
  }

  return makeAction("rollover", metadata, {addr});
}

export function parseConfidentialNormalizeEvent(
  event: Types.Event,
): ConfidentialAssetAction | undefined {
  if (event.type !== CONFIDENTIAL_ASSET_EVENT_TYPES.normalized) {
    return undefined;
  }

  const data = event.data as Record<string, unknown>;
  const metadata = parseMetadata(data);
  const addr = data.addr;
  if (!metadata || typeof addr !== "string" || addr.length === 0) {
    return undefined;
  }

  return makeAction("normalize", metadata, {addr});
}

export function parseConfidentialKeyRotationEvent(
  event: Types.Event,
): ConfidentialAssetAction | undefined {
  if (event.type !== CONFIDENTIAL_ASSET_EVENT_TYPES.keyRotated) {
    return undefined;
  }

  const data = event.data as Record<string, unknown>;
  const metadata = parseMetadata(data);
  const addr = data.addr;
  if (!metadata || typeof addr !== "string" || addr.length === 0) {
    return undefined;
  }

  return makeAction("key_rotation", metadata, {addr});
}

export const confidentialAssetEventParsers = [
  parseConfidentialTransferEvent,
  parseConfidentialDepositEvent,
  parseConfidentialWithdrawEvent,
  parseConfidentialRegisterEvent,
  parseConfidentialRolloverEvent,
  parseConfidentialNormalizeEvent,
  parseConfidentialKeyRotationEvent,
] as const;

function actionDedupeKey(action: ConfidentialAssetAction): string {
  const parts = [
    action.subAction,
    action.metadata,
    action.from ?? "",
    action.to ?? "",
    action.addr ?? "",
    action.amount ?? "",
  ];
  return parts.join("|");
}

export function hasConfidentialAssetSubAction(
  actions: ConfidentialAssetAction[],
  subAction: ConfidentialAssetSubAction,
): boolean {
  return actions.some((action) => action.subAction === subAction);
}

export function parseConfidentialAssetFromPayload(
  transaction: Types.Transaction,
  existingActions: ConfidentialAssetAction[] = [],
): ConfidentialAssetAction[] {
  if (
    !("sender" in transaction) ||
    !("success" in transaction) ||
    !transaction.success
  ) {
    return [];
  }

  const payload = extractEntryFunctionPayload(transaction);
  if (!payload) {
    return [];
  }

  const args = payload.arguments;
  const sender = (transaction as {sender: string}).sender;
  const fn = payload.function;
  const results: ConfidentialAssetAction[] = [];

  if (
    fn === `${CONFIDENTIAL_ASSET_MODULE}::confidential_transfer_raw` &&
    !hasConfidentialAssetSubAction(existingActions, "transfer")
  ) {
    if (args.length >= 2) {
      const metadata = extractObjectInner(args[0]);
      const to = String(args[1]);
      if (metadata && to) {
        results.push(makeAction("transfer", metadata, {from: sender, to}));
      }
    }
  }

  if (
    fn === `${CONFIDENTIAL_ASSET_MODULE}::deposit` &&
    !hasConfidentialAssetSubAction(existingActions, "deposit")
  ) {
    if (args.length >= 2) {
      const metadata = extractObjectInner(args[0]);
      const amount = String(args[1]);
      if (metadata) {
        results.push(makeAction("deposit", metadata, {addr: sender, amount}));
      }
    }
  }

  if (
    fn === `${CONFIDENTIAL_ASSET_MODULE}::withdraw_to_raw` &&
    !hasConfidentialAssetSubAction(existingActions, "withdraw")
  ) {
    if (args.length >= 4) {
      const metadata = extractObjectInner(args[1]);
      const to = String(args[2]);
      const amount = String(args[3]);
      if (metadata && to) {
        results.push(
          makeAction("withdraw", metadata, {from: sender, to, amount}),
        );
      }
    }
  }

  if (
    fn === `${CONFIDENTIAL_ASSET_MODULE}::register_raw` &&
    !hasConfidentialAssetSubAction(existingActions, "register")
  ) {
    if (args.length >= 2) {
      const metadata = extractObjectInner(args[1]);
      if (metadata) {
        results.push(makeAction("register", metadata, {addr: sender}));
      }
    }
  }

  if (
    fn === `${CONFIDENTIAL_ASSET_MODULE}::rollover_pending_balance` &&
    !hasConfidentialAssetSubAction(existingActions, "rollover")
  ) {
    if (args.length >= 2) {
      const metadata = extractObjectInner(args[1]);
      if (metadata) {
        results.push(makeAction("rollover", metadata, {addr: sender}));
      }
    }
  }

  const existingKeys = new Set(existingActions.map(actionDedupeKey));
  return results.filter((action) => !existingKeys.has(actionDedupeKey(action)));
}
