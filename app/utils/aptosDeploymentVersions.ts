/**
 * Maps on-chain gas schedule `feature_version` to Aptos framework release trains.
 *
 * Source of truth: `aptos-move/aptos-gas-schedule/src/ver.rs` in aptos-labs/aptos-core
 * (`gas_feature_versions` + `LATEST_GAS_FEATURE_VERSION`).
 *
 * The value in `0x1::gas_schedule::GasScheduleV2.feature_version` tracks gas-related
 * VM behavior — unlike `0x1::version::Version.major`, which is the blockchain
 * protocol major version (often shown as "v4"), not the framework semver.
 */
export const GAS_FEATURE_VERSION_TO_FRAMEWORK_RELEASE: Readonly<
  Record<number, string>
> = {
  11: "1.8",
  12: "1.9 (skipped)",
  13: "1.9",
  15: "1.10",
  16: "1.11",
  17: "1.12",
  18: "1.13",
  19: "1.14",
  20: "1.15",
  21: "1.16",
  22: "1.18",
  23: "1.19",
  24: "1.20",
  25: "1.21",
  26: "1.22",
  27: "1.23",
  28: "1.24",
  30: "1.26",
  31: "1.27",
  32: "1.28",
  33: "1.29",
  34: "1.30",
  35: "1.31",
  36: "1.32",
  37: "1.33",
  38: "1.34",
  39: "1.35",
  40: "1.36",
  41: "1.37",
  42: "1.38",
  43: "1.39",
  44: "1.40",
  45: "1.41",
  46: "1.42",
  47: "1.43",
  48: "1.44",
  49: "1.45",
  50: "1.46",
};

/**
 * IDs from `FeatureFlag` in aptos-core `types/src/on_chain_config/aptos_features.rs`
 * for **VM Binary Format vN** (Move module bytecode format). When flag K is enabled,
 * bytecode up to version K is accepted (flags roll forward cumulatively on production nets).
 */
const VM_BINARY_FORMAT_FLAG_IDS: ReadonlyArray<{
  flagId: number;
  formatVersion: number;
}> = [
  {flagId: 5, formatVersion: 6},
  {flagId: 40, formatVersion: 7},
  {flagId: 86, formatVersion: 8},
  {flagId: 102, formatVersion: 9},
  {flagId: 106, formatVersion: 10},
];

/** Move bytecode format versions 1–5 predate dedicated VM Binary Format feature flags. */
const BASE_BYTECODE_FORMAT_VERSION = 5;

/**
 * Highest Move bytecode format version enabled for this chain, derived from the
 * enabled **VM Binary Format v*** feature flags.
 */
export function maxBytecodeFormatVersionFromFlags(
  enabledFeatureIds: readonly number[],
): number {
  let max = BASE_BYTECODE_FORMAT_VERSION;
  for (const {flagId, formatVersion} of VM_BINARY_FORMAT_FLAG_IDS) {
    if (enabledFeatureIds.includes(flagId)) {
      max = Math.max(max, formatVersion);
    }
  }
  return max;
}

export function frameworkReleaseFromGasFeatureVersion(
  featureVersion: number,
): string | null {
  return GAS_FEATURE_VERSION_TO_FRAMEWORK_RELEASE[featureVersion] ?? null;
}
