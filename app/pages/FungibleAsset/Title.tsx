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

  // Truncate address for title readability
  const shortAddress = `${address.slice(0, 10)}...${address.slice(-8)}`;

  return (
    <Stack direction="column" spacing={2} marginX={1}>
      <PageMetadata
        title={
          assetSymbol
            ? `${assetSymbol} - Fungible Asset`
            : `Fungible Asset ${shortAddress}`
        }
        description={`View ${assetSymbol || "fungible asset"} on Aptos. ${metadata?.name ? `${metadata.name}. ` : ""}See token supply, decimals, holders, metadata, and transaction history.`}
        type="coin"
        keywords={[
          "fungible asset",
          "FA",
          "token",
          assetSymbol || "",
          metadata?.name || "",
          "cryptocurrency",
        ].filter(Boolean)}
        canonicalPath={`/fungible_asset/${address}`}
        image={metadata?.icon_uri || coinData?.logoUrl}
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
