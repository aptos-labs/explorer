/**
 * Types for defunct protocols and withdrawal plugins.
 *
 * A defunct protocol is one that is no longer actively maintained or operating.
 * Withdrawal plugins allow users to recover funds from defunct protocols,
 * with the constraint that at least 90% of withdrawn funds must go to the
 * original owner / requester.
 */

export type DefunctProtocolCategory =
  | "DEX"
  | "Lending"
  | "Liquid Staking"
  | "Bridge"
  | "NFT Marketplace"
  | "DeFi"
  | "Other";

export type DefunctProtocolStatus = "defunct" | "deprecated" | "winding_down";

export interface DefunctProtocol {
  /** On-chain address of the protocol */
  address: string;
  /** Human-readable protocol name */
  name: string;
  category: DefunctProtocolCategory;
  status: DefunctProtocolStatus;
  /** Brief description of what the protocol did */
  description: string;
  /** When the protocol was marked defunct (ISO date) */
  defunctDate?: string;
  /** External URL for more information (docs, post-mortem, etc.) */
  infoUrl?: string;
}

/**
 * Represents a withdrawal plugin for a defunct protocol.
 *
 * The withdrawal plugin enables users to recover their funds from
 * a defunct protocol. The core invariant is that at least
 * MIN_OWNER_WITHDRAWAL_PERCENT (90%) of the withdrawn amount
 * must be sent to the original owner / requester.
 */
export interface WithdrawalPlugin {
  /** Address of the defunct protocol this plugin targets */
  protocolAddress: string;
  /** Move entry function to call for withdrawal (e.g. "0x1::module::withdraw") */
  entryFunction: string;
  /** Human-readable description of the withdrawal process */
  description: string;
  /** Type arguments required for the entry function */
  typeArguments?: string[];
  /**
   * Percentage of funds that must go to the original owner.
   * Must be >= MIN_OWNER_WITHDRAWAL_PERCENT (90).
   */
  ownerPercentage: number;
}

/** At least 90% of withdrawn funds must go to the original owner. */
export const MIN_OWNER_WITHDRAWAL_PERCENT = 90;

/**
 * Validates that a withdrawal plugin meets the 90% owner requirement.
 * Returns an object with a `valid` flag and an optional `error` message
 * describing why validation failed.
 */
export function validateWithdrawalPlugin(plugin: WithdrawalPlugin): {
  valid: boolean;
  error?: string;
} {
  if (plugin.ownerPercentage < MIN_OWNER_WITHDRAWAL_PERCENT) {
    return {
      valid: false,
      error: `Owner must receive at least ${MIN_OWNER_WITHDRAWAL_PERCENT}% of withdrawn funds. Got ${plugin.ownerPercentage}%.`,
    };
  }
  if (plugin.ownerPercentage > 100) {
    return {
      valid: false,
      error: `Owner percentage cannot exceed 100%. Got ${plugin.ownerPercentage}%.`,
    };
  }
  if (!plugin.entryFunction) {
    return {
      valid: false,
      error: "Entry function is required.",
    };
  }
  if (!plugin.protocolAddress) {
    return {
      valid: false,
      error: "Protocol address is required.",
    };
  }
  return {valid: true};
}
