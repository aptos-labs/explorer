import {VerifiedTwoTone} from "@mui/icons-material";
import QuestionMarkOutlined from "@mui/icons-material/QuestionMarkOutlined";
import VerifiedOutlined from "@mui/icons-material/VerifiedOutlined";
import {Box} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import {useGetFirstCoinActivity} from "../../../api/hooks/useGetCoinActivities";
import type {CoinDescription} from "../../../api/hooks/useGetCoinList";
import {SupplyType} from "../../../api/hooks/useGetCoinSupplyLimit";
import {useGetConfidentialFASupply} from "../../../api/hooks/useGetConfidentialFASupply";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {assertNever, getAssetSymbol} from "../../../utils";
import {useTranslation} from "../../../i18n";
import type {CoinData} from "../Components/CoinData";

type InfoTabProps = {
  struct: string;
  data: CoinData | undefined;
  supplyInfo: [bigint | null, SupplyType | null];
  pairedFa: string | null;
  coinData: CoinDescription | undefined;
};

export default function InfoTab({
  struct,
  data,
  supplyInfo,
  pairedFa,
  coinData,
}: InfoTabProps) {
  const {t, formatNumber} = useTranslation();
  const faMetadataAddress = pairedFa ?? coinData?.faAddress ?? null;

  const {
    data: confidentialSupply,
    isLoading: confidentialSupplyLoading,
    isError: confidentialSupplyError,
  } = useGetConfidentialFASupply(faMetadataAddress ?? "");

  const confidentialRowEnabled = Boolean(faMetadataAddress);

  const {data: firstActivity} = useGetFirstCoinActivity(pairedFa ?? struct);

  if (!data || Array.isArray(data)) {
    return <EmptyTabContent />;
  }

  const [supply, supplyType] = supplyInfo;
  let supplyIcon = null;
  switch (supplyType) {
    case SupplyType.ON_CHAIN:
      supplyIcon = (
        <Tooltip title={t("pages.coins.supplyOnChain")}>
          <VerifiedOutlined />
        </Tooltip>
      );
      break;
    case SupplyType.VERIFIED_OFF_CHAIN:
      supplyIcon = (
        <Tooltip title={t("pages.coins.supplyOffChain")}>
          <VerifiedTwoTone />
        </Tooltip>
      );
      break;
    case SupplyType.NO_SUPPLY_TRACKED:
      supplyIcon = (
        <Tooltip title={t("pages.coins.supplyNone")}>
          <QuestionMarkOutlined />
        </Tooltip>
      );
      break;
    case null:
      break;
    default:
      assertNever(supplyType);
  }

  let marketCap = null;
  let formattedSupply: string | null = null;
  if (supply !== undefined && supply !== null) {
    formattedSupply =
      getFormattedBalanceStr(supply.toString(), data.data.decimals) +
      " " +
      data.data.symbol;
    marketCap =
      parseFloat(coinData?.usdPrice ?? "0") *
      Number(supply / 10n ** BigInt(coinData?.decimals ?? 0));
  }

  return (
    <Box
      sx={{
        marginBottom: 3,
      }}
    >
      {data && (
        <ContentBox>
          <ContentRow titleKey="fields.name" value={data?.data?.name} />
          <ContentRow
            titleKey="fields.symbol"
            value={getAssetSymbol(
              coinData?.panoraSymbol,
              coinData?.bridge,
              data?.data?.symbol,
            )}
          />
          <ContentRow
            titleKey="fields.decimals"
            value={data?.data?.decimals?.toString()}
          />
          {formattedSupply !== null ? (
            <>
              <ContentRow
                titleKey="fields.totalSupply"
                value={
                  <>
                    {`${formattedSupply} `}
                    {supplyIcon}
                  </>
                }
              />
              {marketCap ? (
                <ContentRow
                  titleKey="fields.marketCap"
                  value={
                    <>
                      $
                      {formatNumber(marketCap, {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                      })}{" "}
                      {t("common.usd")}
                    </>
                  }
                />
              ) : null}
            </>
          ) : (
            <ContentRow titleKey="fields.totalSupply" value={supplyIcon} />
          )}
          {confidentialRowEnabled && (
            <ContentRow
              titleKey="fields.confidentialSupply"
              value={
                confidentialSupplyError ? (
                  "—"
                ) : confidentialSupplyLoading ? (
                  "…"
                ) : confidentialSupply !== null ? (
                  <Tooltip title={t("pages.coins.confidentialSupplyTip")}>
                    <span>
                      {getFormattedBalanceStr(
                        confidentialSupply.toString(),
                        data.data.decimals,
                      )}{" "}
                      {data.data.symbol}
                    </span>
                  </Tooltip>
                ) : (
                  "—"
                )
              }
            />
          )}
          <ContentRow
            titleKey="fields.icon"
            value={
              coinData?.logoUrl && (
                <img
                  alt={t("common.iconAlt", {name: data?.data?.name ?? ""})}
                  width={100}
                  src={coinData?.logoUrl}
                />
              )
            }
          />
          <ContentRow
            titleKey="fields.projectUrl"
            value={coinData?.websiteUrl}
          />
          <ContentRow
            titleKey="fields.creator"
            value={
              <HashButton
                size="large"
                hash={struct.split("::")[0]}
                type={HashType.ACCOUNT}
              />
            }
          />
          {pairedFa && (
            <ContentRow
              titleKey="fields.pairedFa"
              value={
                <HashButton
                  size="large"
                  hash={pairedFa}
                  type={HashType.FUNGIBLE_ASSET}
                />
              }
            />
          )}
          {firstActivity && (
            <ContentRow
              titleKey="fields.firstActivity"
              value={
                <HashButton
                  size="large"
                  hash={firstActivity.transaction_version.toString()}
                  type={HashType.TRANSACTION}
                />
              }
            />
          )}
        </ContentBox>
      )}
    </Box>
  );
}
