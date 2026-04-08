import {Stack, Typography} from "@mui/material";
import type {CoinDescription} from "../../api/hooks/useGetCoinList";
import type {FaMetadata} from "../../api/hooks/useGetFaMetadata";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import {
  isBannedType,
  VerifiedAsset,
  verifiedLevel,
} from "../../components/Table/VerifiedCell";
import TitleHashButton, {HashType} from "../../components/TitleHashButton";
import {useNetworkName} from "../../global-config/GlobalConfig";
import {
  getAssetSymbol,
  truncateAddress,
  tryStandardizeAddress,
} from "../../utils";
import {getFungibleAssetTabHeadLabel} from "./fungibleAssetTabMeta";

type FATitleProps = {
  address: string;
  coinData: CoinDescription | undefined;
  metadata: FaMetadata | undefined;
  pathTab?: string;
};

export default function FATitle({
  address,
  metadata,
  coinData,
  pathTab,
}: FATitleProps) {
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

  const canonicalAddress = tryStandardizeAddress(address) ?? address;
  const displayAddr = truncateAddress(canonicalAddress);
  const tab = pathTab ?? "info";
  const hasCanonicalAddress = Boolean(canonicalAddress.trim());
  const canonicalPath = hasCanonicalAddress
    ? `/fungible_asset/${canonicalAddress}/${tab}`
    : "/coins";
  const tabHead = getFungibleAssetTabHeadLabel(pathTab);
  const baseMetaTitle = assetSymbol
    ? `${assetSymbol} - Fungible Asset`
    : `Fungible Asset ${displayAddr}`;
  const metadataTitle = canonicalAddress
    ? `${tabHead} | Fungible Asset ${displayAddr}`
    : baseMetaTitle;
  const metadataDescription = canonicalAddress
    ? `View ${tabHead.toLowerCase()} for fungible asset ${canonicalAddress} on the Aptos blockchain.`
    : `View ${assetSymbol || "fungible asset"} on Aptos. ${metadata?.name ? `${metadata.name}. ` : ""}See token supply, decimals, holders, metadata, and transaction history.`;

  return (
    <Stack direction="column" spacing={2} sx={{marginX: 1}}>
      <PageMetadata
        title={metadataTitle}
        description={metadataDescription}
        type="fungible_asset"
        keywords={[
          "fungible asset",
          "FA",
          "token",
          assetSymbol || "",
          metadata?.name || "",
          "cryptocurrency",
        ].filter(Boolean)}
        canonicalPath={canonicalPath}
        image={metadata?.icon_uri || coinData?.logoUrl}
      />
      <Typography variant="h3" component="h1">
        {title()}
      </Typography>
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
