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

  const tab = pathTab ?? "info";
  const hasStruct = Boolean(struct.trim());
  const canonicalPath = hasStruct ? `/coin/${struct}/${tab}` : "/coins";
  const tabHead = getCoinTabHeadLabel(pathTab);
  const baseMetaTitle = assetSymbol
    ? `${assetSymbol} - Aptos Coin`
    : `Coin ${shortStruct}`;
  const metadataTitle = struct ? `${tabHead} | Coin ${struct}` : baseMetaTitle;
  const metadataDescription = struct
    ? `View ${tabHead.toLowerCase()} for coin ${struct} on the Aptos blockchain.`
    : `View ${assetSymbol || "coin"} on Aptos. ${coinData?.name ? `${coinData.name}. ` : ""}See token supply, holders, price, transactions, and market information.`;

  return (
    <Stack direction="column" spacing={2} marginX={1}>
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
