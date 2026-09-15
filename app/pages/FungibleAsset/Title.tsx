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
import {useTranslation} from "../../i18n";
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
  const {t} = useTranslation();
  function title() {
    return t("pages.fa.entity");
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
  const tabHead = getFungibleAssetTabHeadLabel(pathTab, t);
  const baseMetaTitle = assetSymbol
    ? t("pages.fa.named", {symbol: assetSymbol})
    : t("pages.fa.metaTitleShort", {id: displayAddr});
  const metadataTitle = canonicalAddress
    ? t("pages.fa.metaTitle", {tab: tabHead, id: displayAddr})
    : baseMetaTitle;
  const metadataDescription = canonicalAddress
    ? t("pages.fa.metaDescription", {
        tab: tabHead,
        address: canonicalAddress,
      })
    : t("pages.fa.metaDescriptionFallback", {
        symbol: assetSymbol || t("pages.fa.entity").toLowerCase(),
      });

  return (
    <Stack
      direction="column"
      spacing={2}
      sx={{
        marginX: 1,
      }}
    >
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
            hash={assetSymbol ?? t("common.unknown")}
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
