import {unwrapMoveOptionVec} from "./moveOption";

export function isUIntString(value: unknown): value is string {
  return typeof value === "string" && /^\d+$/.test(value);
}

export function normalizeBytesToHex(value: unknown): string | null {
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

/** Unwraps `option::Option<vector<u8>>` (or similar bytes) from REST JSON. */
export function parseOptionBytesHex(optionField: unknown): string | null {
  const raw = unwrapMoveOptionVec(optionField);
  if (raw === null || raw === undefined) {
    return null;
  }
  return normalizeBytesToHex(raw);
}
