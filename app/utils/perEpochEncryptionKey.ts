import {isUIntString, parseOptionBytesHex} from "./moveResourceBytes";

/** On-chain resource at `@aptos_framework` (Chunky DKG / encrypted transactions). */
export const PER_EPOCH_ENCRYPTION_KEY_RESOURCE =
  "0x1::decryption::PerEpochEncryptionKey" as const;

export type ParsedPerEpochEncryptionKey = {
  epoch: string;
  encryptionKeyHex: string | null;
};

export function isPerEpochEncryptionKeyResource(type: string): boolean {
  return type === PER_EPOCH_ENCRYPTION_KEY_RESOURCE;
}

export function parsePerEpochEncryptionKeyData(
  data: unknown,
): ParsedPerEpochEncryptionKey | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }
  const record = data as Record<string, unknown>;
  if (!isUIntString(record.epoch)) {
    return null;
  }

  return {
    epoch: record.epoch,
    encryptionKeyHex: parseOptionBytesHex(record.encryption_key),
  };
}
