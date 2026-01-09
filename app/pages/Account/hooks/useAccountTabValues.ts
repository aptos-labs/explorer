import {useGetIsGraphqlClientSupported} from "../../../api/hooks/useGraphqlClient";
import {useGetAccountResources} from "../../../api/hooks/useGetAccountResources";
import {objectCoreResource} from "../../../constants";
import {TabValue} from "../Tabs";

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
 * Hook to get the correct tab values for an account/object page.
 * Considers: isGraphqlClientSupported, isObject, isMultisig
 */
export function useAccountTabValues(address: string, isObjectRoute = false) {
  const isGraphqlClientSupported = useGetIsGraphqlClientSupported();
  const {data: resourceData} = useGetAccountResources(address, {retry: false});

  const objectData = resourceData?.find((r) => r.type === objectCoreResource);
  const multisigData = resourceData?.find(
    (r) => r.type === "0x1::multisig_account::MultisigAccount",
  );

  const isObject = isObjectRoute || !!objectData;
  const isMultisig = !!multisigData;

  let tabValues: TabValue[];
  if (isObject) {
    tabValues = isGraphqlClientSupported
      ? OBJECT_VALUES_FULL
      : OBJECT_TAB_VALUES;
  } else if (isMultisig) {
    tabValues = isGraphqlClientSupported
      ? TAB_VALUES_MULTISIG_FULL
      : TAB_VALUES_MULTISIG;
  } else {
    tabValues = isGraphqlClientSupported ? TAB_VALUES_FULL : TAB_VALUES;
  }

  return {tabValues, isObject, isMultisig};
}
