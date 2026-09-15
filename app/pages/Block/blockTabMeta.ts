import {englishT, type TFunction} from "../../i18n";

/**
 * Block detail tab titles (aligned with former route `head` metadata).
 */
export function getBlockTabHeadLabel(
  tab: string | undefined,
  t: TFunction = englishT,
): string {
  switch (tab ?? "overview") {
    case "transactions":
      return t("tabs.block.transactions");
    default:
      return t("tabs.block.overview");
  }
}
