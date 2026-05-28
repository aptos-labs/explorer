import {isUIntString, parseOptionBytesHex} from "./moveResourceBytes";

export const PER_BLOCK_DECRYPTION_KEY_RESOURCE =
  "0x1::decryption::PerBlockDecryptionKey" as const;

export type ParsedPerBlockDecryptionKey = {
  epoch: string;
  round: string;
  decryptionKeyHex: string | null;
};

export function isPerBlockDecryptionKeyResource(type: string): boolean {
  return type === PER_BLOCK_DECRYPTION_KEY_RESOURCE;
}

export function parsePerBlockDecryptionKeyData(
  data: unknown,
): ParsedPerBlockDecryptionKey | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }
  const record = data as Record<string, unknown>;
  if (!isUIntString(record.epoch) || !isUIntString(record.round)) {
    return null;
  }

  return {
    epoch: record.epoch,
    round: record.round,
    decryptionKeyHex: parseOptionBytesHex(record.decryption_key),
  };
}
