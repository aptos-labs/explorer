/**
 * AIP-140 Gas Impact Analysis
 *
 * AIP-140 proposes a 10x gas cost increase on Aptos. These utilities help
 * determine which transactions would exceed their max gas limit under the
 * new pricing.
 */

export const AIP140_CONFIG = {
  /** Set to false to disable all AIP-140 UI across the app */
  enabled: true,
  /** The proposed gas cost multiplier */
  gasMultiplier: 10n,
};

/**
 * Returns true if a transaction's gas usage, multiplied by the AIP-140
 * gas multiplier, would exceed its max gas amount.
 *
 * Only meaningful for user transactions which have both gas_used and
 * max_gas_amount fields.
 */
export function wouldExceedGasLimit(
  gasUsed: string,
  maxGasAmount: string,
): boolean {
  if (!AIP140_CONFIG.enabled) return false;
  try {
    const projected = BigInt(gasUsed) * AIP140_CONFIG.gasMultiplier;
    return projected > BigInt(maxGasAmount);
  } catch {
    return false;
  }
}
