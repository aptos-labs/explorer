import type {CoinPropertyOverrideMap} from "../coinPropertyOverrides";

/**
 * Manual FA property overrides for Mainnet.
 *
 * See `app/data/coinPropertyOverrides.ts` for the format and semantics.
 */
export const mainnetCoinPropertyOverrides: CoinPropertyOverrideMap = {
  // Propbase PROPS: the issuer has confirmed the mint/burn/freeze
  // capabilities are not exercisable, so we display the chips as disabled
  // even though the on-chain refs would otherwise mark them as available.
  "0xe50684a338db732d8fb8a3ac71c4b8633878bd0193bca5de2ebc852a83b35099::propbase_coin::PROPS":
    {
      mintable: false,
      burnable: false,
      freezable: false,
    },
};
