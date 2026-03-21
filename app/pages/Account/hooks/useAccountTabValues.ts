import {useGetIsGraphqlClientSupported} from "../../../api/hooks/useGraphqlClient";
import {useAccountTokenFlowTabEligible} from "../../../hooks/useAccountTokenFlowTabEligible";
import {AIP141_CONFIG} from "../../../utils/aip140";
import type {TabValue} from "../Tabs";

const TAB_VALUES_FULL: TabValue[] = [
  "transactions",
  "coins",
  "tokens",
  "resources",
  "modules",
  "info",
];

const TAB_VALUES: TabValue[] = ["transactions", "resources", "modules", "info"];

const TAB_VALUES_MULTISIG_FULL: TabValue[] = [
  "transactions",
  "multisig",
  "coins",
  "tokens",
  "resources",
  "modules",
  "info",
];

const TAB_VALUES_MULTISIG: TabValue[] = [
  "transactions",
  "multisig",
  "resources",
  "modules",
  "info",
];

const OBJECT_VALUES_FULL: TabValue[] = [
  "transactions",
  "coins",
  "tokens",
  "resources",
  "modules",
  "info",
];

const OBJECT_TAB_VALUES: TabValue[] = [
  "transactions",
  "resources",
  "modules",
  "info",
];

/**
 * Pure function to get the correct tab values for an account/object page.
 */
function insertTokenFlowTab(tabs: TabValue[]): void {
  const i = tabs.indexOf("coins");
  if (i >= 0) {
    tabs.splice(i + 1, 0, "token-flow");
    return;
  }
  const t = tabs.indexOf("transactions");
  if (t >= 0) {
    tabs.splice(t + 1, 0, "token-flow");
  }
}

export function getTabValues(
  isGraphqlClientSupported: boolean,
  isObject: boolean,
  isMultisig: boolean,
  showTokenFlowTab: boolean,
): TabValue[] {
  let tabs: TabValue[];
  if (isObject) {
    tabs = isGraphqlClientSupported
      ? [...OBJECT_VALUES_FULL]
      : [...OBJECT_TAB_VALUES];
  } else if (isMultisig) {
    tabs = isGraphqlClientSupported
      ? [...TAB_VALUES_MULTISIG_FULL]
      : [...TAB_VALUES_MULTISIG];
  } else {
    tabs = isGraphqlClientSupported ? [...TAB_VALUES_FULL] : [...TAB_VALUES];
  }
  if (AIP141_CONFIG.enabled && !isObject) {
    tabs.push("gas-impact");
  }
  if (showTokenFlowTab && isGraphqlClientSupported) {
    insertTokenFlowTab(tabs);
  }
  return tabs;
}

/**
 * Hook to get the correct tab values for an account/object page.
 * Use this when you already have isObject and isMultisig from parent component.
 */
export function useAccountTabValues(isObject: boolean, isMultisig: boolean) {
  const isGraphqlClientSupported = useGetIsGraphqlClientSupported();
  const showTokenFlowTab = useAccountTokenFlowTabEligible();
  return getTabValues(
    isGraphqlClientSupported,
    isObject,
    isMultisig,
    showTokenFlowTab,
  );
}
