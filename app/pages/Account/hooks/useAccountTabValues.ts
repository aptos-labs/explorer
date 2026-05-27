import {useGetIsGraphqlClientSupported} from "../../../api/hooks/useGraphqlClient";
import type {TabValue} from "../Tabs";

const TAB_VALUES_FULL: TabValue[] = [
  "transactions",
  "portfolio",
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
  "portfolio",
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

// Objects (`/object/{address}`) currently do not show the Portfolio tab because
// "object as Decibel user" is not a real shape — the Decibel portfolio section
// queries `dex_accounts::primary_subaccount(owner_addr)` which is only valid for
// user accounts. Wallet asset listing (`coins`) covers the on-chain balance case.
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
export function getTabValues(
  isGraphqlClientSupported: boolean,
  isObject: boolean,
  isMultisig: boolean,
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
  return tabs;
}

/**
 * Hook to get the correct tab values for an account/object page.
 * Use this when you already have isObject and isMultisig from parent component.
 */
export function useAccountTabValues(isObject: boolean, isMultisig: boolean) {
  const isGraphqlClientSupported = useGetIsGraphqlClientSupported();
  return getTabValues(isGraphqlClientSupported, isObject, isMultisig);
}
