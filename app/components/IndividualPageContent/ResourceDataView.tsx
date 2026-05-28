import type React from "react";
import PerEpochEncryptionKeyView from "./PerEpochEncryptionKeyView";
import JsonViewCard from "./JsonViewCard";
import {
  isPerEpochEncryptionKeyResource,
  parsePerEpochEncryptionKeyData,
} from "../../utils/perEpochEncryptionKey";

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

  return <JsonViewCard data={data} />;
}
