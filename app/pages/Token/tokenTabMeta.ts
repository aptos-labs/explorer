/**
 * NFT token detail tab titles (aligned with former route `head` metadata).
 */
export function getTokenTabHeadLabel(tab: string | undefined): string {
  switch (tab ?? "overview") {
    case "activities":
      return "Activities";
    default:
      return "Overview";
  }
}
