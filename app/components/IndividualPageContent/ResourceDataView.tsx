import type React from "react";
import {
  isConfidentialAssetGlobalConfigResource,
  parseConfidentialAssetGlobalConfigData,
} from "../../utils/confidentialAssetGlobalConfig";
import {
  isPerBlockDecryptionKeyResource,
  parsePerBlockDecryptionKeyData,
} from "../../utils/perBlockDecryptionKey";
import {
  isPerEpochEncryptionKeyResource,
  parsePerEpochEncryptionKeyData,
} from "../../utils/perEpochEncryptionKey";
import ConfidentialAssetGlobalConfigView from "./ConfidentialAssetGlobalConfigView";
import JsonViewCard from "./JsonViewCard";
import PerBlockDecryptionKeyView from "./PerBlockDecryptionKeyView";
import PerEpochEncryptionKeyView from "./PerEpochEncryptionKeyView";

type ResourceDataViewProps = {
  resourceType: string;
  data: unknown;
};

/**
 * Picks a structured viewer for known framework resources; falls back to JSON.
 */
export default function ResourceDataView({
  resourceType,
  data,
}: ResourceDataViewProps): React.JSX.Element {
  if (isPerEpochEncryptionKeyResource(resourceType)) {
    const parsed = parsePerEpochEncryptionKeyData(data);
    if (parsed) {
      return <PerEpochEncryptionKeyView parsed={parsed} rawData={data} />;
    }
  }

  if (isPerBlockDecryptionKeyResource(resourceType)) {
    const parsed = parsePerBlockDecryptionKeyData(data);
    if (parsed) {
      return <PerBlockDecryptionKeyView parsed={parsed} rawData={data} />;
    }
  }

  if (isConfidentialAssetGlobalConfigResource(resourceType)) {
    const parsed = parseConfidentialAssetGlobalConfigData(data);
    if (parsed) {
      return (
        <ConfidentialAssetGlobalConfigView parsed={parsed} rawData={data} />
      );
    }
  }

  return <JsonViewCard data={data} />;
}
