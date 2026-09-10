import * as React from "react";
import {useGetAssetMetadata} from "../../../../api/hooks/useGetAssetMetadata";
import type {CoinDescription} from "../../../../api/hooks/useGetCoinList";
import HashButton, {HashType} from "../../../../components/HashButton";
import {findCoinData} from "../../utils";

export function FungibleAssetChip({
  metadata,
  coinData,
}: {
  metadata: string;
  coinData: {data: CoinDescription[]} | undefined;
}) {
  const assetCoin = findCoinData(coinData?.data ?? [], metadata);

  return (
    <HashButton
      hash={metadata}
      type={HashType.FUNGIBLE_ASSET}
      img={assetCoin?.logoUrl}
      size="small"
    />
  );
}

export function FungibleAssetAmount({
  metadata,
  amount,
  coinData,
}: {
  metadata: string;
  amount: string;
  coinData: {data: CoinDescription[]} | undefined;
}) {
  const {data: assetMetadata} = useGetAssetMetadata(metadata);
  const assetCoin = findCoinData(coinData?.data ?? [], metadata);
  const decimals = assetCoin?.decimals ?? assetMetadata?.decimals ?? 0;
  const displayAmount = Number(amount) / 10 ** decimals;

  return (
    <React.Fragment>
      {displayAmount}
      <FungibleAssetChip metadata={metadata} coinData={coinData} />
    </React.Fragment>
  );
}
