/**
 * Validators list tab titles aligned with former route `head` metadata.
 */
export function validatorsTabHeadTitle(tab: string | undefined): string {
  switch (tab ?? "all") {
    case "delegation":
    case "enhanced_delegation":
      return "Delegation Nodes";
    default:
      return "All Nodes";
  }
}
