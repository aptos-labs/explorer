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
    case "changes":
      return "Changes";
    default:
      return "Overview";
  }
}
