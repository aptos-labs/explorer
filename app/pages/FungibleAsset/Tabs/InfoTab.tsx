import VerifiedOutlined from "@mui/icons-material/VerifiedOutlined";
import {Box} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import {useGetFirstCoinActivity} from "../../../api/hooks/useGetCoinActivities";
import {useGetConfidentialFASupply} from "../../../api/hooks/useGetConfidentialFASupply";
import {useGetFaIsDispatchable} from "../../../api/hooks/useGetFaIsDispatchable";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {getAssetSymbol} from "../../../utils";
import {useTranslation} from "../../../i18n";
import type {FACombinedData} from "../Index";
import DispatchablePropertiesValue from "./DispatchablePropertiesValue";

type InfoTabProps = {
  address: string;
  data: FACombinedData | undefined;
};

function ExtraInfo({address}: {address: string}) {
  const {t} = useTranslation();
  const extraInfoKeys: Record<string, string> = {
    "0x000000000000000000000000000000000000000000000000000000000000000a":
      "pages.fa.nativeGasTokenInfo",
    "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b":
      "pages.fa.nativeUsdtInfo",
  };
  const extraKey = extraInfoKeys[address];
  if (extraKey) {
    return (
      <ContentRow titleKey="fields.additionalInformation" value={t(extraKey)} />
    );
  }

  return null;
}

export default function InfoTab({address, data}: InfoTabProps) {
  const {t, formatNumber} = useTranslation();
  const {data: firstActivity} = useGetFirstCoinActivity(address);
  const {data: dispatchInfo} = useGetFaIsDispatchable(address);
  const {
    data: confidentialSupply,
    isLoading: confidentialSupplyLoading,
    isError: confidentialSupplyError,
  } = useGetConfidentialFASupply(address);

  if (!data || Array.isArray(data)) {
    return <EmptyTabContent />;
  }

  // TODO: add owner
  // TODO: add migrated coin balance?
  // TODO: Look into making URLs clickable, right now don't want scams
  let marketCap = null;
  let formattedSupply: string | null = null;
  if (data?.supply !== undefined && data?.supply !== null && data?.metadata) {
    formattedSupply =
      getFormattedBalanceStr(data?.supply.toString(), data.metadata?.decimals) +
      " " +
      data.metadata?.symbol;
    marketCap =
      parseFloat(data?.coinData?.usdPrice ?? "0") *
      Number(data?.supply / 10n ** BigInt(data.coinData?.decimals ?? 0));
  }

  const icon_uri = data?.coinData?.logoUrl ?? data?.metadata?.icon_uri;
  const supplyIcon = (
    <Tooltip title={t("pages.fa.supplyOnChain")}>
      <VerifiedOutlined />
    </Tooltip>
  );

  return (
    <Box
      sx={{
        marginBottom: 3,
      }}
    >
      {data && (
        <ContentBox>
          <ContentRow titleKey="fields.name" value={data?.metadata?.name} />
          <ContentRow
            titleKey="fields.symbol"
            value={getAssetSymbol(
              data?.coinData?.panoraSymbol,
              data?.coinData?.bridge,
              data?.metadata?.symbol,
            )}
          />
          <ContentRow
            titleKey="fields.decimals"
            value={data?.metadata?.decimals?.toString()}
          />
          <ContentRow
            titleKey="fields.totalSupply"
            value={
              <>
                {`${formattedSupply} `}
                {supplyIcon}
              </>
            }
          />
          <ContentRow
            titleKey="fields.confidentialSupply"
            value={
              confidentialSupplyError ? (
                "—"
              ) : confidentialSupplyLoading ? (
                "…"
              ) : confidentialSupply !== null ? (
                <Tooltip title={t("pages.fa.confidentialSupplyTip")}>
                  <span>
                    {getFormattedBalanceStr(
                      confidentialSupply.toString(),
                      data.metadata?.decimals,
                    )}{" "}
                    {data.metadata?.symbol}
                  </span>
                </Tooltip>
              ) : (
                "—"
              )
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
          <ContentRow
            titleKey="fields.icon"
            value={
              icon_uri && (
                <img
                  width={100}
                  alt={t("common.iconAlt", {
                    name: `${data?.metadata?.name ?? ""} (${icon_uri})`,
                  })}
                  src={icon_uri}
                />
              )
            }
          />
          <ExtraInfo address={address} />
          <ContentRow
            titleKey="fields.projectUrl"
            value={
              data?.coinData?.websiteUrl
                ? data?.coinData.websiteUrl
                : data?.metadata?.project_uri
            }
          />
          <ContentRow
            titleKey="fields.objectDetails"
            value={
              <HashButton size="large" hash={address} type={HashType.OBJECT} />
            }
          />
          {data.pairedCoin && (
            <ContentRow
              titleKey="fields.pairedCoin"
              value={
                <HashButton
                  size="large"
                  hash={data.pairedCoin}
                  type={HashType.COIN}
                />
              }
            />
          )}
          {dispatchInfo?.isDispatchable && (
            <ContentRow
              titleKey="fields.properties"
              value={<DispatchablePropertiesValue info={dispatchInfo} />}
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
