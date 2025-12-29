import {useParams} from "react-router-dom";
import {Grid} from "@mui/material";
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

  const {data: allCoinData} = useGetCoinList();
  const {isLoading: isLoadingMetadata, data: metadata} =
    useGetFaMetadata(address);
  const {isLoading: isLoadingSupply, data: supply} = useGetFASupply(address);
  const {
    isLoading: isLoadingPairedCoin,
    data: pairedCoin,
    error: pairedCoinError,
  } = useGetFaPairedCoin(address);
  const isLoading = isLoadingMetadata || isLoadingSupply || isLoadingPairedCoin;

  // Check for errors (only pairedCoin hook returns error)
  const apiError = pairedCoinError;

  const coinData = findCoinData(allCoinData?.data, address);
  // TODO: Type and hand to tabs
  const data: FACombinedData = {
    coinData: coinData,
    metadata: metadata,
    supply: supply,
    pairedCoin: pairedCoin ?? null,
  };

  const tabValues = isGraphqlClientSupported ? TAB_VALUES_FULL : TAB_VALUES;

  return (
    <Grid container spacing={1}>
      <LoadingModal open={isLoading} />
      <Grid size={{xs: 12, md: 12, lg: 12}}>
        <PageHeader />
      </Grid>
      <Grid size={{xs: 12, md: 8, lg: 9}} alignSelf="center">
        <FATitle
          address={address}
          metadata={metadata ?? undefined}
          coinData={coinData}
        />
      </Grid>
      <Grid size={{xs: 12, md: 12, lg: 12}} marginTop={4}>
        {error ? (
          <>
            <FATabs address={address} data={data} tabValues={tabValues} />
            <Error address={address} error={error} />
          </>
        ) : apiError ? (
          <>
            <FATabs address={address} data={data} tabValues={tabValues} />
            <Error address={address} error={apiError as ResponseError} />
          </>
        ) : (
          <FATabs address={address} data={data} tabValues={tabValues} />
        )}
      </Grid>
    </Grid>
  );
}
