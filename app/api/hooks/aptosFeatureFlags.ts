/**
 * Names for known Aptos on-chain feature flags. Sourced from
 * `aptos-move/framework/move-stdlib/sources/configs/features.move` in
 * `aptos-labs/aptos-core`.
 *
 * The on-chain `0x1::features::Features` resource stores enabled flags in a
 * little-endian byte vector — bit `(id % 8)` of byte `id / 8` is set when a
 * flag is enabled. Numeric IDs are stable; we keep this registry as a static
 * snapshot so the UI can render human-readable names.
 *
 * Adding a new flag: append an entry here with the ID and short label. Unknown
 * IDs that show up on chain are surfaced as `Feature #N` so unmapped flags
 * never go silently missing.
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
  {id: 20, name: "Charge Invariant Violation"},
  {id: 21, name: "Delegation Pool Partial Governance Voting"},
  {id: 22, name: "Fee Payer Enabled"},
  {id: 23, name: "Aptos Unique Identifiers"},
  {id: 24, name: "Bulletproofs Natives"},
  {id: 25, name: "Signer Native Format Fix"},
  {id: 26, name: "Module Events"},
  {id: 29, name: "Signature Checker v2 Script Fix"},
  {id: 34, name: "Sponsored Automatic Account Creation"},
  {id: 35, name: "Fee Payer Account Optional"},
  {id: 39, name: "Operator Beneficiary Change"},
  {id: 42, name: "Commission Change Delegation Pool"},
  {id: 43, name: "BN254 Structures"},
  {id: 45, name: "Reconfigure With DKG"},
  {id: 46, name: "Keyless Accounts"},
  {id: 47, name: "Keyless But ZK-less Accounts"},
  {id: 49, name: "JWK Consensus"},
  {id: 50, name: "Concurrent Fungible Assets"},
  {id: 53, name: "Max Object Nesting Check"},
  {id: 54, name: "Keyless Accounts With Passkeys"},
  {id: 55, name: "Multisig V2 Enhancement"},
  {id: 56, name: "Delegation Pool Allowlisting"},
  {id: 57, name: "Module Event Migration"},
  {id: 59, name: "Transaction Context Extension"},
  {id: 60, name: "Coin → Fungible Asset Migration"},
  {id: 67, name: "Concurrent Fungible Balance"},
  {id: 68, name: "Default Concurrent Fungible Balance"},
  {id: 70, name: "Abort If Multisig Payload Mismatch"},
  {id: 78, name: "Transaction Simulation Enhancement"},
  {id: 79, name: "Collection Owner"},
  {id: 80, name: "Native Memory Operations"},
  {id: 84, name: "Permissioned Signer"},
  {id: 85, name: "Account Abstraction"},
  {id: 86, name: "VM Binary Format v8"},
  {id: 87, name: "Bulletproofs Batch Natives"},
  {id: 88, name: "Derivable Account Abstraction"},
  {id: 90, name: "New Accounts Default to FA Store"},
  {id: 91, name: "Default Account Resource"},
  {id: 92, name: "JWK Consensus Per-Key Mode"},
  {id: 94, name: "Orderless Transactions"},
  {id: 96, name: "Calculate Transaction Fee For Distribution"},
  {id: 97, name: "Distribute Transaction Fee"},
  {id: 105, name: "Function Reflection"},
  {id: 107, name: "SLH-DSA-SHA2-128s Signature"},
  {id: 108, name: "Encrypted Transactions"},
  {id: 111, name: "Transaction Limits"},
];

const FEATURE_FLAG_NAME_BY_ID = new Map<number, string>(
  APTOS_FEATURE_FLAGS.map((f) => [f.id, f.name]),
);

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
