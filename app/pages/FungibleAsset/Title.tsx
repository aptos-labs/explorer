import {Stack, Typography} from "@mui/material";
import React from "react";
import TitleHashButton, {HashType} from "../../components/TitleHashButton";
import {CoinDescription} from "../../api/hooks/useGetCoinList";
import {getAssetSymbol} from "../../utils";
import {
  isBannedType,
  VerifiedAsset,
  verifiedLevel,
} from "../../components/Table/VerifiedCell";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import {useNetworkName} from "../../global-config/GlobalConfig";
import {FaMetadata} from "../../api/hooks/useGetFaMetadata";

type FATitleProps = {
  address: string;
  coinData: CoinDescription | undefined;
  metadata: FaMetadata | undefined;
};

export default function FATitle({address, metadata, coinData}: FATitleProps) {
  function title() {
    return "Fungible Asset";
  }

  const assetSymbol =
    coinData?.panoraSymbol && metadata?.symbol !== coinData?.panoraSymbol
      ? getAssetSymbol(
          coinData?.panoraSymbol,
          coinData?.bridge,
          coinData?.symbol,
        )
      : metadata?.symbol;

  const networkName = useNetworkName();
  const {level} = verifiedLevel(
    {
      id: address,
      known: !!coinData,
      symbol: assetSymbol,
      ...coinData,
    },
    networkName,
  );

  return (
    <Stack direction="column" spacing={2} marginX={1}>
      <PageMetadata
        title={`Fungible Asset ${assetSymbol} (${address})`}
        description={`View ${assetSymbol || "fungible asset"} details on the Aptos blockchain. See token supply, holders, metadata, and transaction history.`}
      />
      <Typography variant="h3">{title()}</Typography>
      <Stack direction="row" spacing={1}>
        <TitleHashButton hash={address} type={HashType.STRUCT} />
        {!isBannedType(level) && (
          <TitleHashButton
            hash={assetSymbol ?? "Unknown"}
            type={HashType.SYMBOL}
          />
        )}
        <VerifiedAsset
          data={{
            id: address,
            known: !!coinData,
            banner: true,
            symbol: assetSymbol,
            ...coinData,
          }}
        />
      </Stack>
    </Stack>
  );
}
