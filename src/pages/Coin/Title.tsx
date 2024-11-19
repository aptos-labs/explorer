import {Stack, Typography} from "@mui/material";
import React, {useEffect} from "react";
import TitleHashButton, {HashType} from "../../components/TitleHashButton";
import {CoinDescription} from "../../api/hooks/useGetCoinList";
import {getAssetSymbol} from "../../utils";
import {
  isBannedType,
  VerifiedAsset,
  verifiedLevel,
} from "../../components/Table/VerifiedCell";

type CoinTitleProps = {
  struct: string;
  coinData?: CoinDescription;
  symbol?: string;
};

export default function CoinTitle({struct, coinData, symbol}: CoinTitleProps) {
  const assetSymbol = getAssetSymbol(
    coinData?.panoraSymbol,
    coinData?.bridge,
    symbol,
  );

  const {level} = verifiedLevel({
    id: struct,
    known: !!coinData,
    symbol: assetSymbol,
    ...coinData,
  });

  useEffect(() => {
    document.title = `Aptos Explorer: Fungible Asset ${assetSymbol} (${struct})`;
  }, [struct, assetSymbol]);

  function title() {
    return `Coin`;
  }

  return (
    <Stack direction="column" spacing={2} marginX={1}>
      <Typography variant="h3">{title()}</Typography>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          "& > *": {
            flexShrink: "0", // Prevent elements from shrinking
          },
        }}
      >
        <TitleHashButton hash={struct} type={HashType.STRUCT} />
        {!isBannedType(level) && (
          <TitleHashButton hash={assetSymbol} type={HashType.SYMBOL} />
        )}
        <VerifiedAsset
          data={{
            id: struct,
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
