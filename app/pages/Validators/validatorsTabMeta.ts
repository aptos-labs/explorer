import {englishT, type TFunction} from "../../i18n";

/**
 * Validators list tab titles aligned with former route `head` metadata.
 */
export function validatorsTabHeadTitle(
  tab: string | undefined,
  t: TFunction = englishT,
): string {
  switch (tab ?? "all") {
    case "delegation":
    case "enhanced_delegation":
      return t("tabs.validators.delegation");
    default:
      return t("tabs.validators.all");
  }
}
