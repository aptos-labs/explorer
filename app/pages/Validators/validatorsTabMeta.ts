/**
 * Validators list tab titles aligned with former route `head` metadata.
 */
export function validatorsTabHeadTitle(tab: string | undefined): string {
  switch (tab ?? "all") {
    case "delegation":
      return "Delegation Nodes";
    case "enhanced_delegation":
      return "Enhanced Delegation";
    default:
      return "All Nodes";
  }
}
