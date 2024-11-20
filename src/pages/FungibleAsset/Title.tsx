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
import {usePageMetadata} from "../../components/hooks/usePageMetadata";
import {useGlobalState} from "../../global-config/GlobalConfig";

type FATitleProps = {
  address: string;
  coinData: CoinDescription | undefined;
  metadata: any | undefined;
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

  usePageMetadata({title: `Fungible Asset ${assetSymbol} (${address})`});

  const [state] = useGlobalState();
  const {level} = verifiedLevel(
    {
      id: address,
      known: !!coinData,
      symbol: assetSymbol,
      ...coinData,
    },
    state.network_name,
  );

  return (
    <Stack direction="column" spacing={2} marginX={1}>
      <Typography variant="h3">{title()}</Typography>
      <Stack direction="row" spacing={1}>
        <TitleHashButton hash={address} type={HashType.STRUCT} />
        {!isBannedType(level) && (
          <TitleHashButton hash={assetSymbol} type={HashType.SYMBOL} />
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
