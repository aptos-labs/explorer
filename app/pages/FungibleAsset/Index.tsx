import {Grid} from "@mui/material";
import {useParams} from "@tanstack/react-router";
import {type ResponseError, ResponseErrorType} from "../../api/client";
import {
  type CoinDescription,
  useGetCoinList,
} from "../../api/hooks/useGetCoinList";
import {
  type FaMetadata,
  useGetFaMetadata,
} from "../../api/hooks/useGetFaMetadata";
import {useGetFaPairedCoin} from "../../api/hooks/useGetFaPairedCoin";
import {useGetFASupply} from "../../api/hooks/useGetFaSupply";
import {useGetIsGraphqlClientSupported} from "../../api/hooks/useGraphqlClient";
import LoadingModal from "../../components/LoadingModal";
import VerificationBanner from "../../components/VerificationBanner";
import {getAssetSymbol} from "../../utils";
import PageHeader from "../layout/PageHeader";
import {findCoinData} from "../Transaction/utils";
import {isValidAccountAddress} from "../utils";
import FungibleAssetError from "./Error";
import FATabs, {type TabValue} from "./Tabs";
import FATitle from "./Title";

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
  const params = useParams({strict: false}) as {address?: string; tab?: string};
  const maybeAddress = params?.address;
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
      <Grid size={{xs: 12, md: 8, lg: 9}} sx={{alignSelf: "center"}}>
        <FATitle
          address={address}
          metadata={metadata ?? undefined}
          coinData={coinData}
          pathTab={params.tab}
        />
      </Grid>
      <Grid size={{xs: 12}} sx={{mt: 2}}>
        <VerificationBanner
          id={address}
          known={!!coinData}
          coinData={coinData}
          symbol={
            coinData?.panoraSymbol &&
            metadata?.symbol !== coinData?.panoraSymbol
              ? getAssetSymbol(
                  coinData?.panoraSymbol,
                  coinData?.bridge,
                  coinData?.symbol,
                )
              : metadata?.symbol
          }
        />
      </Grid>
      <Grid size={{xs: 12, md: 12, lg: 12}} sx={{marginTop: 4}}>
        {error ? (
          <>
            <FATabs address={address} data={data} tabValues={tabValues} />
            <FungibleAssetError address={address} error={error} />
          </>
        ) : apiError ? (
          <>
            <FATabs address={address} data={data} tabValues={tabValues} />
            <FungibleAssetError
              address={address}
              error={apiError as ResponseError}
            />
          </>
        ) : (
          <FATabs address={address} data={data} tabValues={tabValues} />
        )}
      </Grid>
    </Grid>
  );
}
