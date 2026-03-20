import {Grid} from "@mui/material";
import {useParams} from "@tanstack/react-router";
import {type ResponseError, ResponseErrorType} from "../../api/client";
import {useGetAccountResource} from "../../api/hooks/useGetAccountResource";
import {useGetCoinList} from "../../api/hooks/useGetCoinList";
import {useGetCoinPairedFa} from "../../api/hooks/useGetCoinPairedFa";
import {useGetCoinSupplyLimit} from "../../api/hooks/useGetCoinSupplyLimit";
import {useGetIsGraphqlClientSupported} from "../../api/hooks/useGraphqlClient";
import LoadingModal from "../../components/LoadingModal";
import VerificationBanner from "../../components/VerificationBanner";
import {getAssetSymbol} from "../../utils";
import PageHeader from "../layout/PageHeader";
import {findCoinData} from "../Transaction/Tabs/BalanceChangeTab";
import {isValidStruct} from "../utils";
import type {CoinData} from "./Components/CoinData";
import CoinError from "./Error";
import CoinTabs, {type TabValue} from "./Tabs";
import CoinTitle from "./Title";

const TAB_VALUES_FULL: TabValue[] = ["info", "holders", "transactions"];

const TAB_VALUES: TabValue[] = ["info"];

export default function CoinPage() {
  const isGraphqlClientSupported = useGetIsGraphqlClientSupported();
  const params = useParams({strict: false}) as {struct?: string; tab?: string};
  const maybeStruct = params?.struct;
  let address = "";
  let struct: string = "";
  let error: ResponseError | null = null;
  if (maybeStruct && isValidStruct(maybeStruct)) {
    struct = maybeStruct;
    address = struct.split("::")[0];
  } else {
    error = {
      type: ResponseErrorType.INVALID_INPUT,
      message: `Invalid coin '${maybeStruct}'`,
    };
  }

  const {data: coinList, isLoading: isLoadingCoinList} = useGetCoinList();

  const {
    data,
    error: infoError,
    isLoading: isLoadingCoinInfo,
  } = useGetAccountResource(address, `0x1::coin::CoinInfo<${struct}>`);

  const {isLoading: isLoadingCoinSupply, data: supplyInfo} =
    useGetCoinSupplyLimit(struct);
  const {isLoading: isLoadingPairedFa, data: pairedFa} =
    useGetCoinPairedFa(struct);

  const isLoading =
    isLoadingCoinInfo ||
    isLoadingCoinList ||
    isLoadingCoinSupply ||
    isLoadingPairedFa;
  if (error === null) {
    error = infoError;
  }
  const coinData = findCoinData(coinList?.data, struct);
  const tabValues = isGraphqlClientSupported ? TAB_VALUES_FULL : TAB_VALUES;

  return (
    <Grid container spacing={1}>
      <LoadingModal open={isLoading} />
      <Grid size={{xs: 12, md: 12, lg: 12}}>
        <PageHeader />
      </Grid>
      <Grid size={{xs: 12, md: 8, lg: 9}} alignSelf="center">
        <CoinTitle
          struct={struct}
          coinData={coinData}
          symbol={(data as CoinData)?.data?.symbol}
          pathTab={params.tab}
        />
      </Grid>
      <Grid size={{xs: 12}} sx={{mt: 2}}>
        <VerificationBanner
          id={struct}
          known={!!coinData}
          coinData={coinData}
          symbol={getAssetSymbol(
            coinData?.panoraSymbol,
            coinData?.bridge,
            (data as CoinData)?.data?.symbol,
          )}
        />
      </Grid>
      <Grid size={{xs: 12, md: 12, lg: 12}} marginTop={4}>
        {error ? (
          <>
            <CoinTabs
              struct={struct}
              data={data as CoinData | undefined}
              tabValues={tabValues}
              supplyInfo={supplyInfo}
              pairedFa={pairedFa}
              coinData={coinData}
            />
            <CoinError struct={struct} error={error} />
          </>
        ) : (
          <CoinTabs
            struct={struct}
            data={data as CoinData | undefined}
            tabValues={tabValues}
            supplyInfo={supplyInfo}
            pairedFa={pairedFa}
            coinData={coinData}
          />
        )}
      </Grid>
    </Grid>
  );
}
