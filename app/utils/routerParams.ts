/**
 * Normalizes TanStack Router `_splat` (catch-all) to path segments.
 * Avoids calling `.split` on non-strings and tolerates array-shaped splats.
 */
export function pathSplatToSegments(raw: unknown): string[] {
  if (raw == null) {
    return [];
  }
  if (typeof raw === "string") {
    return raw.split("/").filter(Boolean);
  }
  if (Array.isArray(raw)) {
    const strings = raw.filter((x): x is string => typeof x === "string");
    return strings.join("/").split("/").filter(Boolean);
  }
  return [];
}
