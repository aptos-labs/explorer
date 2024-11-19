import {useParams} from "react-router-dom";
import {Grid2} from "@mui/material";
import React from "react";
import FATabs, {TabValue} from "./Tabs";
import PageHeader from "../layout/PageHeader";
import {useGetIsGraphqlClientSupported} from "../../api/hooks/useGraphqlClient";
import LoadingModal from "../../components/LoadingModal";
import Error from "./Error";
import {ResponseError, ResponseErrorType} from "../../api/client";
import {isValidAccountAddress} from "../utils";
import FATitle from "./Title";
import {FaMetadata, useGetFaMetadata} from "../../api/hooks/useGetFaMetadata";
import {useGetFASupply} from "../../api/hooks/useGetFaSupply";
import {CoinDescription, useGetCoinList} from "../../api/hooks/useGetCoinList";
import {findCoinData} from "../Transaction/Tabs/BalanceChangeTab";
import {useGetFaPairedCoin} from "../../api/hooks/useGetFaPairedCoin";

const TAB_VALUES_FULL: TabValue[] = ["info", "holders", "transactions"];

const TAB_VALUES: TabValue[] = ["info"];

export type FACombinedData = {
  coinData: CoinDescription | undefined;
  metadata: FaMetadata | null;
  supply: bigint | null;
  pairedCoin: string | null;
};

export default function FAPage() {
  const isGraphqlClientSupported = useGetIsGraphqlClientSupported();
  const maybeAddress = useParams().address;
  let address: string = "";
  let error: ResponseError | null = null;
  if (maybeAddress && isValidAccountAddress(maybeAddress)) {
    address = maybeAddress;
  } else {
    error = {
      type: ResponseErrorType.INVALID_INPUT,
      message: `Invalid coin '${maybeAddress}'`,
    };
  }

  // TODO: add loading state
  // TODO: add errors?

  const {data: allCoinData} = useGetCoinList();
  const metadata = useGetFaMetadata(address);
  const supply = useGetFASupply(address);
  const pairedCoin = useGetFaPairedCoin(address);
  const isLoading = false;

  const coinData = findCoinData(allCoinData?.data, address);
  // TODO: Type and hand to tabs
  const data: FACombinedData = {
    coinData: coinData,
    metadata: metadata,
    supply: supply,
    pairedCoin: pairedCoin,
  };

  const tabValues = isGraphqlClientSupported ? TAB_VALUES_FULL : TAB_VALUES;

  return (
    <Grid2 container spacing={1}>
      <LoadingModal open={isLoading} />
      <Grid2 size={{xs: 12, md: 12, lg: 12}}>
        <PageHeader />
      </Grid2>
      <Grid2 size={{xs: 12, md: 8, lg: 9}} alignSelf="center">
        <FATitle address={address} metadata={metadata} coinData={coinData} />
      </Grid2>
      <Grid2 size={{xs: 12, md: 12, lg: 12}} marginTop={4}>
        {error ? (
          <>
            <FATabs address={address} data={data} tabValues={tabValues} />
            <Error address={address} error={error} />
          </>
        ) : (
          <FATabs address={address} data={data} tabValues={tabValues} />
        )}
      </Grid2>
    </Grid2>
  );
}
