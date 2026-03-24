/**
 * Coin detail tab titles (aligned with former route `head` metadata).
 */
export function getCoinTabHeadLabel(tab: string | undefined): string {
  switch (tab ?? "info") {
    case "holders":
      return "Holders";
    default:
      return "Info";
  }
}
