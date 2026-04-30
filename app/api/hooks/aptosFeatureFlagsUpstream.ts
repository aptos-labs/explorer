/**
 * Fetches aptos-core's `FeatureFlag` Rust enum and maps numeric IDs to display
 * names when the explorer's static table in `aptosFeatureFlags.ts` is behind.
 *
 * Uses jsDelivr (CORS-friendly) as a mirror of GitHub raw content.
 */

const APTOS_FEATURES_RUST_URL =
  "https://cdn.jsdelivr.net/gh/aptos-labs/aptos-core@main/types/src/on_chain_config/aptos_features.rs";

/**
 * Parse `pub enum FeatureFlag { ... }` variant lines of the form `NAME = N,`.
 * Doc comments and attributes (`///`, `#[...]`) are skipped.
 */
export function parseRustFeatureFlagEnumSource(
  source: string,
): Map<number, string> {
  const decl = "pub enum FeatureFlag";
  const declIdx = source.indexOf(decl);
  if (declIdx === -1) return new Map();

  const openBrace = source.indexOf("{", declIdx);
  if (openBrace === -1) return new Map();

  let depth = 1;
  let closeBrace = -1;
  for (let i = openBrace + 1; i < source.length; i++) {
    const ch = source[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        closeBrace = i;
        break;
      }
    }
  }
  if (closeBrace === -1) return new Map();

  const body = source.slice(openBrace + 1, closeBrace);
  const lines = body.split("\n");
  const idToTitle = new Map<number, string>();

  const variantLine =
    /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(\d+)\s*,?\s*(?:\/\/.*)?$/;

  for (const line of lines) {
    const trimmed = line.trimStart();
    if (
      trimmed.startsWith("//") ||
      trimmed.startsWith("#[") ||
      trimmed === "" ||
      trimmed === ","
    ) {
      continue;
    }
    const m = line.match(variantLine);
    if (m) {
      const rustName = m[1];
      const id = Number(m[2]);
      if (!Number.isNaN(id)) {
        idToTitle.set(id, rustEnumVariantToTitleCase(rustName));
      }
    }
  }

  return idToTitle;
}

/** `FOO_BAR` / `_FOO` → Title Case label aligned with static registry style */
export function rustEnumVariantToTitleCase(rustName: string): string {
  const trimmed = rustName.replace(/^_+/, "");
  return trimmed
    .split("_")
    .filter((part) => part.length > 0)
    .map((part) => {
      const lower = part.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

export async function fetchAptosFeatureFlagNamesFromUpstream(): Promise<
  Map<number, string>
> {
  const res = await fetch(APTOS_FEATURES_RUST_URL);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch aptos-core feature flags (${res.status} ${res.statusText})`,
    );
  }
  const text = await res.text();
  return parseRustFeatureFlagEnumSource(text);
}
