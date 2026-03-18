/**
 * AIP-141 Gas Impact Analysis
 *
 * AIP-141 proposes a 10x gas cost increase on Aptos. These utilities help
 * determine which transactions would exceed their max gas limit under the
 * new pricing.
 *
 * Enablement is driven by the on-chain gas schedule version
 * (`0x1::gas_schedule::GasScheduleV2.feature_version`). Once the gas
 * schedule version reaches `aip141GasScheduleVersion`, AIP-141 is live
 * and the UI switches to "executed / current impact" messaging.
 *
 * There are three eras to consider:
 *  1. Before the 100x gas reduction — transactions used the old (high) gas
 *     schedule. AIP-141's net effect on these is actually a ~10x *decrease*
 *     (100x down then 10x up), so they should NOT be flagged.
 *  2. After the 100x gas reduction but before AIP-141 — transactions use
 *     the reduced schedule. The 10x multiplier projects what gas would look
 *     like once AIP-141 is live.
 *  3. After AIP-141 enablement — gas is already raised. The 10x multiplier
 *     checks whether a further 10x increase would exceed the limit.
 */

export const AIP141_CONFIG = {
  /** Set to false to disable all AIP-141 UI across the app */
  enabled: true,
  /** The gas cost multiplier to project */
  gasMultiplier: 10n,
  /**
   * Mainnet ledger version at which the 100x gas reduction took effect.
   * Transactions *before* this version used the old high-gas schedule and
   * should not be flagged (AIP-141 would net-reduce their gas).
   * Set to 0n to treat all transactions as post-reduction (default).
   */
  gasReductionVersion: 0n,
  /**
   * The gas schedule `feature_version` at which AIP-141 takes effect.
   * The next gas schedule version bump enables AIP-141. When the on-chain
   * gas schedule version is >= this value, AIP-141 is considered live.
   * Set to 0 while the target version is unknown.
   */
  aip141GasScheduleVersion: 0,
};

/** @deprecated Use AIP141_CONFIG instead */
export const AIP140_CONFIG = AIP141_CONFIG;

/**
 * Returns true when AIP-141 is live based on the current on-chain gas
 * schedule version compared to the configured target.
 */
export function isAip141Executed(currentGasScheduleVersion: number): boolean {
  if (AIP141_CONFIG.aip141GasScheduleVersion === 0) return false;
  return currentGasScheduleVersion >= AIP141_CONFIG.aip141GasScheduleVersion;
}

/**
 * Returns true when a transaction's gas usage — projected through the
 * AIP-141 multiplier — would exceed its max gas amount.
 *
 * Pass the transaction `version` so that pre-gas-reduction transactions
 * (which would actually *benefit* from AIP-141) are excluded.
 */
export function wouldExceedGasLimit(
  gasUsed: string,
  maxGasAmount: string,
  version?: string,
): boolean {
  if (!AIP141_CONFIG.enabled) return false;
  try {
    if (
      version &&
      AIP141_CONFIG.gasReductionVersion > 0n &&
      BigInt(version) < AIP141_CONFIG.gasReductionVersion
    ) {
      return false;
    }

    const projected = BigInt(gasUsed) * AIP141_CONFIG.gasMultiplier;
    return projected > BigInt(maxGasAmount);
  } catch {
    return false;
  }
}
