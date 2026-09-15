import {englishT, type TFunction} from "../../i18n";

/**
 * Coin detail tab titles (aligned with former route `head` metadata).
 */
export function getCoinTabHeadLabel(
  tab: string | undefined,
  t: TFunction = englishT,
): string {
  switch (tab ?? "info") {
    case "transactions":
      return t("tabs.coin.transactionsShort");
    case "holders":
      return t("tabs.coin.holdersShort");
    default:
      return t("tabs.coin.info");
  }
}
