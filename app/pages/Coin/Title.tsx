import {Stack, Typography} from "@mui/material";
import type {CoinDescription} from "../../api/hooks/useGetCoinList";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import {
  isBannedType,
  VerifiedAsset,
  verifiedLevel,
} from "../../components/Table/VerifiedCell";
import TitleHashButton, {HashType} from "../../components/TitleHashButton";
import {useNetworkName} from "../../global-config/GlobalConfig";
import {useTranslation} from "../../i18n";
import {getAssetSymbol} from "../../utils";
import {getCoinTabHeadLabel} from "./coinTabMeta";

type CoinTitleProps = {
  struct: string;
  coinData?: CoinDescription;
  symbol?: string;
  pathTab?: string;
};

export default function CoinTitle({
  struct,
  coinData,
  symbol,
  pathTab,
}: CoinTitleProps) {
  const {t} = useTranslation();
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
    return t("pages.coins.entity");
  }

  // Truncate struct for title readability
  const shortStruct =
    struct.length > 40
      ? `${struct.slice(0, 20)}...${struct.slice(-15)}`
      : struct;

  const tab = pathTab ?? "info";
  const hasStruct = Boolean(struct.trim());
  const canonicalPath = hasStruct ? `/coin/${struct}/${tab}` : "/coins";
  const tabHead = getCoinTabHeadLabel(pathTab, t);
  const baseMetaTitle = assetSymbol
    ? t("pages.coins.metaTitleSymbol", {symbol: assetSymbol})
    : t("pages.coins.metaTitleShort", {struct: shortStruct});
  const metadataTitle = struct
    ? t("pages.coins.metaTitle", {tab: tabHead, struct})
    : baseMetaTitle;
  const metadataDescription = struct
    ? t("pages.coins.metaDescription", {tab: tabHead, struct})
    : t("pages.coins.metaDescriptionFallback", {
        symbol: assetSymbol || t("pages.coins.entity").toLowerCase(),
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
        type="coin"
        keywords={[
          "coin",
          "token",
          assetSymbol || "",
          coinData?.name || "",
          "cryptocurrency",
          "fungible token",
        ].filter(Boolean)}
        canonicalPath={canonicalPath}
        image={coinData?.logoUrl}
      />
      <Typography variant="h3" component="h1">
        {title()}
      </Typography>
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
