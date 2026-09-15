import {englishT, type TFunction} from "../../i18n";

/**
 * Transaction detail tab titles (aligned with former route `head` metadata).
 */
export function getTransactionTabHeadLabel(
  tab: string | undefined,
  t: TFunction = englishT,
): string {
  switch (tab) {
    case "decibelDetail":
      return t("tabs.transaction.decibelDetail");
    case "payments":
      return t("tabs.transaction.payments");
    case "balanceChange":
      return t("tabs.transaction.balanceChange");
    case "trace":
      return t("tabs.transaction.trace");
    case "events":
      return t("tabs.transaction.events");
    case "payload":
      return t("tabs.transaction.payload");
    case "modules":
      return t("tabs.transaction.modules");
    case "changes":
      return t("tabs.transaction.changes");
    default:
      return t("tabs.transaction.overview");
  }
}
