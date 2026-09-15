import {englishT, type TFunction} from "../../i18n";

/**
 * Fungible asset detail tab titles (aligned with former route `head` metadata).
 */
export function getFungibleAssetTabHeadLabel(
  tab: string | undefined,
  t: TFunction = englishT,
): string {
  switch (tab ?? "info") {
    case "transactions":
      return t("tabs.fa.transactionsShort");
    case "holders":
      return t("tabs.fa.holdersShort");
    default:
      return t("tabs.fa.info");
  }
}
