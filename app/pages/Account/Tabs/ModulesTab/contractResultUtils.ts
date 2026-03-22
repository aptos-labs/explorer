/**
 * Returns a clipboard-ready string for a struct field value.
 *
 * Strings are returned raw (no JSON escaping), primitives are stringified,
 * and objects/arrays are pretty-printed as JSON. Handles edge cases like
 * undefined, null, bigint, symbols, and non-serialisable values gracefully.
 */
export function getFieldCopyValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }

  try {
    const json = JSON.stringify(value, null, 2);
    return json !== undefined ? json : String(value);
  } catch {
    return String(value);
  }
}

/**
 * Type guard: returns true when value is a plain object (struct), false for
 * arrays, primitives, and null.
 */
export function isStructResult(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
