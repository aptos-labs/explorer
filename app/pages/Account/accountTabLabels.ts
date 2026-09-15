import {englishT, type TFunction} from "../../i18n";

/**
 * Tab labels aligned with legacy route `head` titles for account and object pages.
 */
export function getAccountTabHeadLabel(
  tab: string | undefined,
  t: TFunction = englishT,
): string {
  switch (tab ?? "transactions") {
    case "transactions":
      return t("tabs.account.transactions");
    case "coins":
      return t("tabs.account.coins");
    case "tokens":
      return t("tabs.account.tokens");
    case "resources":
      return t("tabs.account.resources");
    case "modules":
      return t("tabs.account.modules");
    case "multisig":
      return t("tabs.account.multisig");
    case "info":
      return t("tabs.account.info");
    default:
      return t("tabs.account.info");
  }
}
