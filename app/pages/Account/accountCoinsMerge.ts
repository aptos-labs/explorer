import {tryStandardizeAddress} from "../../utils";

/** Coin type for native APT in `0x1::coin` (matches `getBalance` default). */
export const APT_MOVE_COIN_TYPE = "0x1::aptos_coin::AptosCoin";

const SYNTHETIC_APT_METADATA = {
  name: "Aptos Coin",
  decimals: 8,
  symbol: "APT",
  token_standard: "v1",
} as const;

export type FaBalanceRow = {
  amount: number;
  asset_type: string;
  metadata: {
    name: string;
    decimals: number;
    symbol: string;
    token_standard: string;
  } | null;
};

function isAptIndexerAssetType(assetType: string): boolean {
  if (assetType === APT_MOVE_COIN_TYPE) {
    return true;
  }
  const std = tryStandardizeAddress(assetType);
  const aptFa = tryStandardizeAddress("0xa");
  return Boolean(std && aptFa && std === aptFa);
}

function enrichAptRowMissingMetadata(row: FaBalanceRow): FaBalanceRow {
  if (row.metadata !== null || !isAptIndexerAssetType(row.asset_type)) {
    return row;
  }
  return {
    ...row,
    metadata: {...SYNTHETIC_APT_METADATA},
  };
}

/**
 * When the indexer has no row for native APT (or returns APT with null metadata),
 * merge in the on-chain `0x1::coin::balance` result so the Assets tab matches the sidebar card.
 */
export function mergeOnChainAptIntoIndexerRows(
  indexerRows: FaBalanceRow[],
  onChainAptOctas: string | undefined,
): FaBalanceRow[] {
  const enriched = indexerRows.map(enrichAptRowMissingMetadata);

  if (onChainAptOctas === undefined) {
    return enriched;
  }

  let octas: bigint;
  try {
    octas = BigInt(onChainAptOctas);
  } catch {
    return enriched;
  }

  if (octas <= 0n) {
    return enriched;
  }

  const hasApt = enriched.some((r) => isAptIndexerAssetType(r.asset_type));
  if (hasApt) {
    return enriched;
  }

  const amountNum = Number(octas);
  if (!Number.isSafeInteger(amountNum)) {
    return enriched;
  }

  return [
    {
      asset_type: APT_MOVE_COIN_TYPE,
      amount: amountNum,
      metadata: {...SYNTHETIC_APT_METADATA},
    },
    ...enriched,
  ];
}
