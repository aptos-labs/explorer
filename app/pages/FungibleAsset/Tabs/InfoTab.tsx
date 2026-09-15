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
import type {FACombinedData} from "../Index";
import DispatchablePropertiesValue from "./DispatchablePropertiesValue";

type InfoTabProps = {
  address: string;
  data: FACombinedData | undefined;
};

// TODO: put this extra information somewhere else
const extraInfo: Record<string, string> = {
  "0x000000000000000000000000000000000000000000000000000000000000000a":
    "This is the official native gas token on Aptos.  This is the fungible asset version of APT.  It is fully compatible with the coin version when using 0x1::coin functions.  See 0x1::aptos_coin::AptosCoin for the coin version.",
  "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b":
    "This is the official native USD₮ on Aptos.",
};

function ExtraInfo({address}: {address: string}) {
  if (extraInfo[address]) {
    return (
      <ContentRow
        titleKey="fields.additionalInformation"
        value={extraInfo[address]}
      />
    );
  }

  return null;
}

export default function InfoTab({address, data}: InfoTabProps) {
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
    <Tooltip title={"Supply tracked on-chain, may change over time"}>
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
                <Tooltip
                  title={
                    "Tokens held in the on-chain confidential-asset pool for this metadata object (public aggregate). Individual balances stay private."
                  }
                >
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
                  {marketCap.toLocaleString([], {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  })}{" "}
                  USD
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
                  alt={`${data?.metadata?.name} icon (${icon_uri})`}
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
