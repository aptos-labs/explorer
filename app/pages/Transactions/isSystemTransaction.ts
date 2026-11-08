import type {Types} from "~/types/aptos";

/**
 * Chain-generated transactions with no sender, payload, or transfer amount.
 * Pending transactions are user-submitted and must not count as system.
 */
export function isSystemTransaction(transaction: Types.Transaction): boolean {
  switch (transaction.type) {
    case "genesis_transaction":
    case "block_metadata_transaction":
    case "state_checkpoint_transaction":
    case "block_epilogue_transaction":
    case "validator_transaction":
      return true;
    case "user_transaction":
    case "pending_transaction":
      return false;
    default: {
      // Compile-time exhaustiveness only: the API may return newer types.
      const _unhandled: never = transaction;
      return false;
    }
  }
}
