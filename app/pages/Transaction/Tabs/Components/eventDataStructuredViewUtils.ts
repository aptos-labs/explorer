import {tryStandardizeAddress} from "../../../../utils";

export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

/**
 * Detects `{ inner: "0x..." }` object-wrapped addresses from JSON event data.
 */
export function tryObjectAddressInner(
  obj: Record<string, unknown>,
): string | undefined {
  if (Object.keys(obj).length !== 1) return undefined;
  const inner = obj.inner;
  if (typeof inner !== "string") return undefined;
  return tryStandardizeAddress(inner) !== undefined ? inner : undefined;
}

export function sortedKeys(data: Record<string, unknown>): string[] {
  return Object.keys(data).sort((a, b) => a.localeCompare(b));
}
