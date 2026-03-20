/**
 * Tab labels aligned with legacy route `head` titles for account and object pages.
 */
export function getAccountTabHeadLabel(tab: string | undefined): string {
  switch (tab ?? "transactions") {
    case "transactions":
      return "Transactions";
    case "coins":
      return "Assets";
    case "tokens":
      return "NFTs";
    case "resources":
      return "Resources";
    case "modules":
      return "Modules";
    case "multisig":
      return "Multisig";
    case "gas-impact":
      return "Gas Impact";
    case "info":
      return "Info";
    default:
      return "Info";
  }
}
