import type {Types} from "~/types/aptos";

/** REST / indexer event type for `aptos_framework::code::PublishPackage`. */
export const PUBLISH_PACKAGE_EVENT_TYPE_SUFFIX = "::code::PublishPackage";

export type PublishPackageEventSummary = {
  codeAddress: string;
  isUpgrade: boolean;
};

export type ModuleWriteSetChangeRow = {
  kind: "write_module" | "delete_module";
  address: string;
  moduleName: string;
};

export type TransactionModuleSummary = {
  publishPackageEvents: PublishPackageEventSummary[];
  moduleChanges: ModuleWriteSetChangeRow[];
};

function isPublishPackageEventType(type: string): boolean {
  return type.endsWith(PUBLISH_PACKAGE_EVENT_TYPE_SUFFIX);
}

function readBool(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function parsePublishPackageEvents(
  events: Types.Event[],
): PublishPackageEventSummary[] {
  const out: PublishPackageEventSummary[] = [];
  for (const event of events) {
    if (!isPublishPackageEventType(event.type)) continue;
    const data =
      typeof event.data === "object" &&
      event.data !== null &&
      !Array.isArray(event.data)
        ? (event.data as Record<string, unknown>)
        : null;
    const rawAddr = data?.code_address;
    if (typeof rawAddr !== "string" || !rawAddr) continue;
    out.push({
      codeAddress: rawAddr,
      isUpgrade: readBool(data?.is_upgrade),
    });
  }
  return out;
}

function moduleNameFromWriteModule(
  change: Types.WriteSetChange & {type: "write_module"},
): string {
  const name = change.data?.abi?.name;
  if (typeof name === "string" && name.length > 0) return name;
  return "(module name unavailable)";
}

function parseModuleChangesFromWriteSet(
  changes: Types.WriteSetChange[],
): ModuleWriteSetChangeRow[] {
  const rows: ModuleWriteSetChangeRow[] = [];
  for (const change of changes) {
    if (change.type === "write_module") {
      rows.push({
        kind: "write_module",
        address: change.address,
        moduleName: moduleNameFromWriteModule(change),
      });
    } else if (change.type === "delete_module") {
      rows.push({
        kind: "delete_module",
        address: change.address,
        moduleName: change.module,
      });
    }
  }
  return rows;
}

/**
 * Summarizes package publish signals and module bytecode changes for a transaction.
 * Returns `null` when there is nothing to show (no matching events or write-set rows).
 */
export function getTransactionModuleSummary(
  transaction: Types.Transaction,
): TransactionModuleSummary | null {
  const changes = "changes" in transaction ? transaction.changes : [];
  const events = "events" in transaction ? transaction.events : [];

  const publishPackageEvents = parsePublishPackageEvents(events);
  const moduleChanges = parseModuleChangesFromWriteSet(changes);

  if (publishPackageEvents.length === 0 && moduleChanges.length === 0) {
    return null;
  }

  return {publishPackageEvents, moduleChanges};
}

export function transactionHasModuleSummary(
  transaction: Types.Transaction,
): boolean {
  return getTransactionModuleSummary(transaction) !== null;
}
