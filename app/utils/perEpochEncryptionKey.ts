import {unwrapMoveOptionVec} from "./moveOption";

/** On-chain resource at `@aptos_framework` (Chunky DKG / encrypted transactions). */
export const PER_EPOCH_ENCRYPTION_KEY_RESOURCE =
  "0x1::decryption::PerEpochEncryptionKey" as const;

export type ParsedPerEpochEncryptionKey = {
  epoch: string;
  encryptionKeyHex: string | null;
  encryptionKeyByteLength: number | null;
};

export function isPerEpochEncryptionKeyResource(type: string): boolean {
  return type === PER_EPOCH_ENCRYPTION_KEY_RESOURCE;
}

function isUIntString(value: unknown): value is string {
  return typeof value === "string" && /^\d+$/.test(value);
}

function normalizeBytesToHex(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }
    if (trimmed.startsWith("0x") || trimmed.startsWith("0X")) {
      return trimmed.startsWith("0x") ? trimmed : `0x${trimmed.slice(2)}`;
    }
    if (/^[0-9a-fA-F]+$/.test(trimmed)) {
      return `0x${trimmed}`;
    }
    return null;
  }

  if (Array.isArray(value)) {
    const bytes: number[] = [];
    for (const item of value) {
      const n = typeof item === "string" ? Number.parseInt(item, 10) : item;
      if (!Number.isInteger(n) || n < 0 || n > 255) {
        return null;
      }
      bytes.push(n);
    }
    if (bytes.length === 0) {
      return null;
    }
    return `0x${bytes.map((b) => b.toString(16).padStart(2, "0")).join("")}`;
  }

  return null;
}

export function hexByteLength(hex: string): number | null {
  let body = hex.trim();
  if (body.startsWith("0x") || body.startsWith("0X")) {
    body = body.slice(2);
  }
  if (
    body.length === 0 ||
    body.length % 2 !== 0 ||
    !/^[0-9a-fA-F]*$/.test(body)
  ) {
    return null;
  }
  return body.length / 2;
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

  const rawKey = unwrapMoveOptionVec(record.encryption_key);
  const encryptionKeyHex =
    rawKey === null || rawKey === undefined
      ? null
      : normalizeBytesToHex(rawKey);

  return {
    epoch: record.epoch,
    encryptionKeyHex,
    encryptionKeyByteLength: encryptionKeyHex
      ? hexByteLength(encryptionKeyHex)
      : null,
  };
}
