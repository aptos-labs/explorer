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

  const networkName = useNetworkName();
  const {level} = verifiedLevel(
    {
      id: struct,
      known: !!coinData,
      symbol: assetSymbol,
      ...coinData,
    },
    networkName,
  );

  function title() {
    return `Coin`;
  }

  // Truncate struct for title readability
  const shortStruct =
    struct.length > 40
      ? `${struct.slice(0, 20)}...${struct.slice(-15)}`
      : struct;

  return (
    <Stack direction="column" spacing={2} marginX={1}>
      <PageMetadata
        title={
          assetSymbol ? `${assetSymbol} - Aptos Coin` : `Coin ${shortStruct}`
        }
        description={`View ${assetSymbol || "coin"} on Aptos. ${coinData?.name ? `${coinData.name}. ` : ""}See token supply, holders, price, transactions, and market information.`}
        type="coin"
        keywords={[
          "coin",
          "token",
          assetSymbol || "",
          coinData?.name || "",
          "cryptocurrency",
          "fungible token",
        ].filter(Boolean)}
        canonicalPath={`/coin/${struct}`}
        image={coinData?.logoUrl}
      />
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
