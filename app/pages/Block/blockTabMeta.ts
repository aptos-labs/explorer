/**
 * Block detail tab titles (aligned with former route `head` metadata).
 */
export function getBlockTabHeadLabel(tab: string | undefined): string {
  switch (tab ?? "overview") {
    case "transactions":
      return "Transactions";
    default:
      return "Overview";
  }
}
