import {englishT, type TFunction} from "../../i18n";

/**
 * NFT token detail tab titles (aligned with former route `head` metadata).
 */
export function getTokenTabHeadLabel(
  tab: string | undefined,
  t: TFunction = englishT,
): string {
  switch (tab ?? "overview") {
    case "activities":
      return t("tabs.token.activities");
    default:
      return t("tabs.token.overview");
  }
}
