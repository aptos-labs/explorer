import type {FaProperties} from "../api/hooks/useGetFaProperties";

/**
 * Manual override for the FA properties chips ("Mintable", "Burnable",
 * "Freezable", "Dispatchable") shown on Coin and Fungible Asset detail pages.
 *
 * These overrides exist for assets where the on-chain resources do not
 * accurately reflect the issuer's actual capabilities — for example, a coin
 * issuer may have permanently destroyed their `MintRef` / `BurnRef` /
 * `TransferRef` capabilities such that, despite the coin originally being
 * mintable on-chain, the issuer can no longer mint, burn, or freeze accounts
 * holding the token. In those cases, defaulting to the resource-derived flags
 * is misleading, so we let the explorer ship a curated truth.
 *
 * Overrides are partial — only the keys you set will replace the derived
 * values. Anything you omit falls back to whatever was derived from
 * resources.
 *
 * Keys can be either:
 * - a coin struct, e.g.
 *   `0xe50684a338db732d8fb8a3ac71c4b8633878bd0193bca5de2ebc852a83b35099::propbase_coin::PROPS`,
 *   or
 * - a fungible asset metadata object address, e.g.
 *   `0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b`.
 */
export type FaPropertyOverride = Partial<FaProperties>;

export type CoinPropertyOverrideMap = Record<string, FaPropertyOverride>;

/**
 * Look up an override by coin struct first, then by FA metadata address.
 * Returns `null` when no override is configured for either key.
 */
export function lookupCoinPropertyOverride(
  overrides: CoinPropertyOverrideMap,
  keys: {coinStruct?: string | null; faAddress?: string | null},
): FaPropertyOverride | null {
  const {coinStruct, faAddress} = keys;
  if (coinStruct && overrides[coinStruct]) {
    return overrides[coinStruct];
  }
  if (faAddress && overrides[faAddress]) {
    return overrides[faAddress];
  }
  return null;
}
