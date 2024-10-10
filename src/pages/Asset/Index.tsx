import {useParams} from "react-router-dom";
import {Grid} from "@mui/material";
import React from "react";
import AccountTabs, {TabValue} from "./Tabs";
import AssetTitle from "./Title";
import BalanceCard from "./BalanceCard";
import PageHeader from "../layout/PageHeader";
import {useGetIsGraphqlClientSupported} from "../../api/hooks/useGraphqlClient";
import LoadingModal from "../../components/LoadingModal";
import Error from "./Error";
import {AptosNamesBanner} from "./Components/AptosNamesBanner";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {Network} from "aptos";
import {useGetAccountResources} from "../../api/hooks/useGetAccountResources";
import {AccountAddress} from "@aptos-labs/ts-sdk";
import {ResponseError, ResponseErrorType} from "../../api/client";

// TODO: add ability for object information
const OBJECT_VALUES_FULL: TabValue[] = ["info", "transactions"];
const OBJECT_TAB_VALUES: TabValue[] = ["info", "transactions"];

export function accountPagePath() {
  return "asset";
}

export default function AssetPage() {
  const isGraphqlClientSupported = useGetIsGraphqlClientSupported();
  const maybeAddress = useParams().address;
  let address: string = "";
  let addressError: ResponseError | null = null;
  if (maybeAddress) {
    try {
      address = AccountAddress.from(maybeAddress).toStringLong();
    } catch (e: any) {
      addressError = {
        type: ResponseErrorType.INVALID_INPUT,
        message: `Invalid address '${maybeAddress}'`,
      };
    }
  }

  const {
    data,
    error: objectError,
    isLoading,
  } = useGetAccountResources(address, {
    retry: false,
  });

  const error = addressError || objectError;

  const [state] = useGlobalState();

  const tabValues = isGraphqlClientSupported
    ? OBJECT_VALUES_FULL
    : OBJECT_TAB_VALUES;

  return (
    <Grid container spacing={1}>
      <LoadingModal open={isLoading} />
      <Grid item xs={12} md={12} lg={12}>
        <PageHeader />
      </Grid>
      <Grid item xs={12} md={8} lg={9} alignSelf="center">
        <AssetTitle address={address} />
      </Grid>
      <Grid item xs={12} md={4} lg={3} marginTop={{md: 0, xs: 2}}>
        <BalanceCard address={address} />
      </Grid>
      <Grid item xs={12} md={8} lg={12} marginTop={4} alignSelf="center">
        {state.network_name === Network.MAINNET && <AptosNamesBanner />}
      </Grid>
      <Grid item xs={12} md={12} lg={12} marginTop={4}>
        {error ? (
          <>
            <AccountTabs
              address={address}
              accountData={data}
              tabValues={tabValues}
            />
            <Error address={address} error={error} />
          </>
        ) : (
          <AccountTabs
            address={address}
            accountData={data}
            tabValues={tabValues}
          />
        )}
      </Grid>
    </Grid>
  );
}
