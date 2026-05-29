/**
 * Internal tab identifiers that represent a transaction's per-type "Overview"
 * view. These are the first tab returned by `getTabValues` for each
 * transaction type. They have no explicit URL segment: the overview is served
 * from the canonical base path `/txn/:txnHashOrVersion` (no `/userTxnOverview`,
 * `/blockMetadataOverview`, … suffix). Legacy URLs that still carry one of
 * these segments are redirected back to the base path.
 */
export const OVERVIEW_TAB_VALUES: ReadonlySet<string> = new Set([
  "userTxnOverview",
  "blockMetadataOverview",
  "blockEpilogueOverview",
  "stateCheckpointOverview",
  "pendingTxnOverview",
  "genesisTxnOverview",
  "validatorTxnOverview",
  "unknown",
]);

/** Whether a tab segment is an overview view that should live at the base path. */
export function isOverviewTab(tab: string | undefined): boolean {
  return tab !== undefined && OVERVIEW_TAB_VALUES.has(tab);
}

/**
 * Transaction detail tab titles (aligned with former route `head` metadata).
 */
export function getTransactionTabHeadLabel(tab: string | undefined): string {
  switch (tab) {
    case "decibelDetail":
      return "Decibel";
    case "balanceChange":
      return "Balance Change";
    case "events":
      return "Events";
    case "payload":
      return "Payload";
    case "modules":
      return "Modules";
    case "changes":
      return "Changes";
    default:
      return "Overview";
  }
}
