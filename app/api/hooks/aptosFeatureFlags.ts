/**
 * Names for known Aptos on-chain feature flags. The canonical list lives in
 * the `FeatureFlag` enum at
 * `aptos-core/types/src/on_chain_config/aptos_features.rs`; this file mirrors
 * those numeric IDs (1..=112 at time of writing) so the explorer can render
 * human-readable names without a runtime dependency on aptos-core.
 *
 * The on-chain `0x1::features::Features` resource stores enabled flags in a
 * little-endian byte vector — bit `(id % 8)` of byte `id / 8` is set when a
 * flag is enabled. Numeric IDs are stable; we keep this registry as a static
 * snapshot.
 *
 * **Adding a new flag**: append an entry here with the ID and short label
 * matching the Rust enum (Title Case). Unknown IDs that show up on chain are
 * surfaced as `Feature #N` so unmapped flags never go silently missing — but
 * keep this list complete so users see real names.
 *
 * **Deprecated flags**: kept here with a `(deprecated)` suffix so historical
 * bitmaps still decode to readable rows. Slots whose underscore-prefixed
 * Rust name indicates "rolled out, can no longer be disabled" are tagged
 * `(rolled out)` to communicate that they are intentionally always on.
 */

export type AptosFeatureFlag = {
  id: number;
  name: string;
};

export const APTOS_FEATURE_FLAGS: ReadonlyArray<AptosFeatureFlag> = [
  {id: 1, name: "Code Dependency Check"},
  {id: 2, name: "Treat Friend As Private"},
  {id: 3, name: "SHA-512 / RIPEMD-160 Natives"},
  {id: 4, name: "Aptos Stdlib Chain ID Native"},
  {id: 5, name: "VM Binary Format v6"},
  {id: 6, name: "Collect & Distribute Gas Fees (deprecated)"},
  {id: 7, name: "Multi-Ed25519 PK Validate v2"},
  {id: 8, name: "Blake2b-256 Native"},
  {id: 9, name: "Resource Groups"},
  {id: 10, name: "Multisig Accounts"},
  {id: 11, name: "Delegation Pools"},
  {id: 12, name: "Cryptography Algebra Natives"},
  {id: 13, name: "BLS12-381 Structures"},
  {id: 14, name: "Ed25519 Pubkey Validate Returns False"},
  {id: 15, name: "Struct Constructors"},
  {id: 16, name: "Periodical Reward Rate Decrease"},
  {id: 17, name: "Partial Governance Voting"},
  {id: 18, name: "Signature Checker v2 (rolled out)"},
  {id: 19, name: "Storage Slot Metadata"},
  {id: 20, name: "Charge Invariant Violation"},
  {id: 21, name: "Delegation Pool Partial Governance Voting"},
  {id: 22, name: "Gas Payer Enabled"},
  {id: 23, name: "Aptos Unique Identifiers"},
  {id: 24, name: "Bulletproofs Natives"},
  {id: 25, name: "Signer Native Format Fix"},
  {id: 26, name: "Module Events"},
  {id: 27, name: "Emit Fee Statement"},
  {id: 28, name: "Storage Deletion Refund"},
  {id: 29, name: "Signature Checker v2 Script Fix"},
  {id: 30, name: "Aggregator V2 API"},
  {id: 31, name: "Safer Resource Groups"},
  {id: 32, name: "Safer Metadata"},
  {id: 33, name: "Single-Sender Authenticator"},
  {id: 34, name: "Sponsored Automatic Account v1 Creation"},
  {id: 35, name: "Fee Payer Account Optional"},
  {id: 36, name: "Aggregator V2 Delayed Fields"},
  {id: 37, name: "Concurrent Token v2"},
  {id: 38, name: "Limit Max Identifier Length"},
  {id: 39, name: "Operator Beneficiary Change"},
  {id: 40, name: "VM Binary Format v7"},
  {id: 41, name: "Resource Groups Split in VM ChangeSet"},
  {id: 42, name: "Commission Change Delegation Pool"},
  {id: 43, name: "BN254 Structures"},
  {id: 44, name: "WebAuthn Signature"},
  {id: 45, name: "Reconfigure With DKG (deprecated)"},
  {id: 46, name: "Keyless Accounts"},
  {id: 47, name: "Keyless But ZK-less Accounts"},
  {id: 48, name: "Remove Detailed Error From Hash (deprecated)"},
  {id: 49, name: "JWK Consensus"},
  {id: 50, name: "Concurrent Fungible Assets"},
  {id: 51, name: "Refundable Bytes"},
  {id: 52, name: "Object Code Deployment"},
  {id: 53, name: "Max Object Nesting Check"},
  {id: 54, name: "Keyless Accounts With Passkeys"},
  {id: 55, name: "Multisig v2 Enhancement"},
  {id: 56, name: "Delegation Pool Allowlisting"},
  {id: 57, name: "Module Event Migration"},
  {id: 58, name: "Reject Unstable Bytecode (rolled out)"},
  {id: 59, name: "Transaction Context Extension"},
  {id: 60, name: "Coin → Fungible Asset Migration"},
  {id: 61, name: "Primary APT Fungible Store at User Address"},
  {id: 62, name: "Object Native Derived Address (rolled out)"},
  {id: 63, name: "Dispatchable Fungible Asset"},
  {id: 64, name: "New Accounts Default to FA APT Store"},
  {id: 65, name: "Operations Default to FA APT Store"},
  {id: 66, name: "Aggregator V2 Is-At-Least API (rolled out)"},
  {id: 67, name: "Concurrent Fungible Balance"},
  {id: 68, name: "Default to Concurrent Fungible Balance"},
  {id: 69, name: "Limit VM Type Size (rolled out)"},
  {id: 70, name: "Abort If Multisig Payload Mismatch"},
  {id: 71, name: "Disallow User Natives (rolled out)"},
  {id: 72, name: "Allow Serialized Script Args"},
  {id: 73, name: "Use Compatibility Checker v2 (rolled out)"},
  {id: 74, name: "Enable Enum Types"},
  {id: 75, name: "Enable Resource Access Control"},
  {id: 76, name: "Reject Unstable Bytecode for Script (rolled out)"},
  {id: 77, name: "Federated Keyless"},
  {id: 78, name: "Transaction Simulation Enhancement"},
  {id: 79, name: "Collection Owner"},
  {id: 80, name: "Native Memory Operations (rolled out)"},
  {id: 81, name: "Loader v2 (rolled out)"},
  {id: 82, name: "Disallow init_module to Publish Modules (rolled out)"},
  {id: 83, name: "Call Tree & Instruction VM Cache"},
  {id: 84, name: "Permissioned Signer"},
  {id: 85, name: "Account Abstraction"},
  {id: 86, name: "VM Binary Format v8"},
  {id: 87, name: "Bulletproofs Batch Natives"},
  {id: 88, name: "Derivable Account Abstraction"},
  {id: 89, name: "Enable Function Values"},
  {id: 90, name: "New Accounts Default to FA Store"},
  {id: 91, name: "Default Account Resource"},
  {id: 92, name: "JWK Consensus Per-Key Mode"},
  {id: 93, name: "Transaction Payload v2"},
  {id: 94, name: "Orderless Transactions"},
  {id: 95, name: "Lazy Loading"},
  {id: 96, name: "Calculate Transaction Fee For Distribution"},
  {id: 97, name: "Distribute Transaction Fee"},
  {id: 98, name: "Monotonically Increasing Counter"},
  {id: 99, name: "Capture Option (deprecated)"},
  {id: 100, name: "Trusted Code Optimizations"},
  {id: 101, name: "Enum Option"},
  {id: 102, name: "VM Binary Format v9"},
  {id: 103, name: "Framework Option"},
  {id: 104, name: "Session Continuation"},
  {id: 105, name: "Function Reflection"},
  {id: 106, name: "VM Binary Format v10"},
  {id: 107, name: "SLH-DSA-SHA2-128s Signature"},
  {id: 108, name: "Encrypted Transactions"},
  {id: 109, name: "Public Struct & Enum Args"},
  {id: 110, name: "Multisig Script"},
  {id: 111, name: "Transaction Limits"},
  {id: 112, name: "Versioned Transaction Validation"},
];

const FEATURE_FLAG_NAME_BY_ID = new Map<number, string>(
  APTOS_FEATURE_FLAGS.map((f) => [f.id, f.name]),
);

export function hasStaticFeatureFlagLabel(id: number): boolean {
  return FEATURE_FLAG_NAME_BY_ID.has(id);
}

export function getFeatureFlagName(id: number): string {
  return FEATURE_FLAG_NAME_BY_ID.get(id) ?? `Feature #${id}`;
}

/**
 * Decode the hex-encoded feature bitmap stored at
 * `0x1::features::Features.features` into the list of enabled feature IDs.
 *
 * The bitmap is a `vector<u8>` rendered by the node API as `"0x..."`. Bit
 * `(id % 8)` of byte `id / 8` is set when feature `id` is enabled.
 */
export function decodeFeatureBitmap(hex: string): number[] {
  const cleaned = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (cleaned.length === 0 || cleaned.length % 2 !== 0) return [];
  const enabled: number[] = [];
  for (let byteIndex = 0; byteIndex < cleaned.length / 2; byteIndex++) {
    const byte = parseInt(cleaned.slice(byteIndex * 2, byteIndex * 2 + 2), 16);
    if (Number.isNaN(byte)) return [];
    for (let bit = 0; bit < 8; bit++) {
      if ((byte & (1 << bit)) !== 0) {
        enabled.push(byteIndex * 8 + bit);
      }
    }
  }
  return enabled;
}
