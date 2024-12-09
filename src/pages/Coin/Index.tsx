import {useParams} from "react-router-dom";
import {Grid2} from "@mui/material";
import React from "react";
import CoinTabs, {TabValue} from "./Tabs";
import PageHeader from "../layout/PageHeader";
import {useGetIsGraphqlClientSupported} from "../../api/hooks/useGraphqlClient";
import LoadingModal from "../../components/LoadingModal";
import Error from "./Error";
import {ResponseError, ResponseErrorType} from "../../api/client";
import {useGetAccountResource} from "../../api/hooks/useGetAccountResource";
import {isValidStruct} from "../utils";
import CoinTitle from "./Title";
import {CoinData} from "./Components/CoinData";
import {useGetCoinSupplyLimit} from "../../api/hooks/useGetCoinSupplyLimit";
import {useGetCoinList} from "../../api/hooks/useGetCoinList";
import {findCoinData} from "../Transaction/Tabs/BalanceChangeTab";
import {useGetCoinPairedFa} from "../../api/hooks/useGetCoinPairedFa";

const TAB_VALUES_FULL: TabValue[] = ["info", "holders", "transactions"];

const TAB_VALUES: TabValue[] = ["info"];

export default function CoinPage() {
  const isGraphqlClientSupported = useGetIsGraphqlClientSupported();
  const maybeStruct = useParams().struct;
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

  const {data: coinList} = useGetCoinList();

  const {
    data,
    error: infoError,
    isLoading,
  } = useGetAccountResource(address, `0x1::coin::CoinInfo<${struct}>`);

  const supplyInfo = useGetCoinSupplyLimit(struct);
  const pairedFa = useGetCoinPairedFa(struct);

  if (error === null) {
    error = infoError;
  }
  const coinData = findCoinData(coinList?.data, struct);
  const tabValues = isGraphqlClientSupported ? TAB_VALUES_FULL : TAB_VALUES;

  return (
    <Grid2 container spacing={1}>
      <LoadingModal open={isLoading} />
      <Grid2 size={{xs: 12, md: 12, lg: 12}}>
        <PageHeader />
      </Grid2>
      <Grid2 size={{xs: 12, md: 8, lg: 9}} alignSelf="center">
        <CoinTitle
          struct={struct}
          coinData={coinData}
          symbol={(data as CoinData)?.data?.symbol}
        />
      </Grid2>
      <Grid2 size={{xs: 12, md: 12, lg: 12}} marginTop={4}>
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
            <Error struct={struct} error={error} />
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
      </Grid2>
    </Grid2>
  );
}
