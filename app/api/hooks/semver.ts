/**
 * Tiny SemVer helpers used by the releases tracker.
 *
 * We deliberately do not pull in a SemVer dependency — the only operations we
 * need are "is this a stable release (no pre-release suffix)?" and a
 * descending sort that respects standard SemVer ordering for the major/minor/
 * patch components and treats unparseable inputs as the lowest precedence so
 * they fall to the bottom rather than crashing.
 */

const SEMVER_RE =
  /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/;

export type ParsedSemver = {
  major: number;
  minor: number;
  patch: number;
  /** Empty string when the version has no pre-release suffix. */
  prerelease: string;
};

export function parseSemver(version: string): ParsedSemver | null {
  const m = version.trim().match(SEMVER_RE);
  if (!m) return null;
  return {
    major: parseInt(m[1], 10),
    minor: parseInt(m[2], 10),
    patch: parseInt(m[3], 10),
    prerelease: m[4] ?? "",
  };
}

/**
 * A version is "stable" when it parses as SemVer and has no pre-release
 * suffix. This excludes everything like `-rc.1`, `-alpha`, `-beta.0`,
 * `-zeta.0`, `-side-effect-free.0`, etc.
 *
 * Non-SemVer strings (e.g. unusual GitHub tags) return `false`. Callers that
 * know their tag scheme can pre-strip a known prefix before calling.
 */
export function isStableSemver(version: string): boolean {
  const parsed = parseSemver(version);
  return parsed !== null && parsed.prerelease === "";
}

/**
 * Compare two version strings for descending sort (newest first).
 *
 * Stable versions sort above pre-release versions of the same major.minor.patch.
 * Strings that fail to parse sort to the very bottom but never throw.
 */
export function compareSemverDesc(a: string, b: string): number {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  if (pa === null && pb === null) return a.localeCompare(b);
  if (pa === null) return 1;
  if (pb === null) return -1;

  if (pa.major !== pb.major) return pb.major - pa.major;
  if (pa.minor !== pb.minor) return pb.minor - pa.minor;
  if (pa.patch !== pb.patch) return pb.patch - pa.patch;

  // Same numeric components. Pre-release suffix lowers precedence (per SemVer
  // §11.4) — for descending sort that means stable comes first.
  if (pa.prerelease === "" && pb.prerelease !== "") return -1;
  if (pa.prerelease !== "" && pb.prerelease === "") return 1;
  // Both have a suffix, or both are stable. Localized string compare keeps
  // ordering stable and predictable without trying to fully implement
  // SemVer §11 dot-separated identifier ordering (which we don't need).
  return pb.prerelease.localeCompare(pa.prerelease);
}
