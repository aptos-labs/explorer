import {useParams} from "react-router-dom";
import {Grid} from "@mui/material";
import React from "react";
import AccountTabs, {TabValue} from "./Tabs";
import AccountTitle from "./Title";
import BalanceCard from "./BalanceCard";
import PageHeader from "../layout/PageHeader";
import {useGetIsGraphqlClientSupported} from "../../api/hooks/useGraphqlClient";
import {useGetAccount} from "../../api/hooks/useGetAccount";
import LoadingModal from "../../components/LoadingModal";
import Error from "./Error";
import {AptosNamesBanner} from "./Components/AptosNamesBanner";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {Network} from "aptos";
import {useGetAccountResources} from "../../api/hooks/useGetAccountResources";
import {AccountAddress} from "@aptos-labs/ts-sdk";

const TAB_VALUES_FULL: TabValue[] = [
  "transactions",
  "coins",
  "tokens",
  "resources",
  "modules",
  "info",
];

const TAB_VALUES: TabValue[] = ["transactions", "resources", "modules", "info"];

const OBJECT_VALUES_FULL: TabValue[] = [
  "transactions",
  // TODO: Once indexer supports objects owning coins/tokens (v2?)- uncomment these
  // "coins",
  // "tokens",
  "resources",
];
const OBJECT_TAB_VALUES: TabValue[] = ["transactions", "resources"];

type AccountPageProps = {
  isObject?: boolean;
};

export default function AccountPage({isObject = false}: AccountPageProps) {
  const isGraphqlClientSupported = useGetIsGraphqlClientSupported();
  const maybeAddress = useParams().address;
  const address =
    maybeAddress !== undefined
      ? AccountAddress.from(maybeAddress).toStringLong()
      : "";
  let loadingFunction;
  if (isObject) {
    loadingFunction = useGetAccountResources;
  } else {
    loadingFunction = useGetAccount;
  }
  const {data, error, isLoading} = loadingFunction(address);
  const [state] = useGlobalState();

  let tabValues;
  if (isObject) {
    tabValues = isGraphqlClientSupported
      ? OBJECT_VALUES_FULL
      : OBJECT_TAB_VALUES;
  } else {
    tabValues = isGraphqlClientSupported ? TAB_VALUES_FULL : TAB_VALUES;
  }

  return (
    <Grid container spacing={1}>
      <LoadingModal open={isLoading} />
      <Grid item xs={12} md={12} lg={12}>
        <PageHeader />
      </Grid>
      <Grid item xs={12} md={8} lg={9} alignSelf="center">
        <AccountTitle address={address} isObject={isObject} />
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
              isObject={isObject}
            />
            <Error address={address} error={error} />
          </>
        ) : (
          <AccountTabs
            address={address}
            accountData={data}
            tabValues={tabValues}
            isObject={isObject}
          />
        )}
      </Grid>
    </Grid>
  );
}
