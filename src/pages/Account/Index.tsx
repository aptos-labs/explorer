import {useParams} from "react-router-dom";
import {Grid} from "@mui/material";
import React, {useEffect} from "react";
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
import {useGetAccountResources} from "../../api/hooks/useGetAccountResources";
import {AccountAddress, Network} from "@aptos-labs/ts-sdk";
import {useNavigate} from "../../routing";

const TAB_VALUES_FULL: TabValue[] = [
  "transactions",
  "coins",
  "tokens",
  "resources",
  "modules",
  "info",
];

const TAB_VALUES: TabValue[] = ["transactions", "resources", "modules", "info"];

// TODO: add ability for object information
const OBJECT_VALUES_FULL: TabValue[] = [
  "transactions",
  "coins",
  "tokens",
  "resources",
  "modules",
];
const OBJECT_TAB_VALUES: TabValue[] = ["transactions", "resources", "modules"];

type AccountPageProps = {
  isObject?: boolean;
};

export function accountPagePath(isObject: boolean) {
  if (isObject) {
    return "object";
  }
  return "account";
}

export default function AccountPage({isObject = false}: AccountPageProps) {
  const navigate = useNavigate();
  const isGraphqlClientSupported = useGetIsGraphqlClientSupported();
  const maybeAddress = useParams().address;
  const address =
    maybeAddress !== undefined
      ? AccountAddress.from(maybeAddress).toStringLong()
      : "";
  const {
    data: objectData,
    error: objectError,
    isLoading: objectIsLoading,
  } = useGetAccountResources(address, {retry: false});
  const {
    data: accountData,
    error: accountError,
    isLoading: accountIsLoading,
  } = useGetAccount(address, {retry: false});

  const isLoading = objectIsLoading || accountIsLoading;
  const data = isObject ? objectData : accountData;
  const error = isObject ? objectError : accountError;

  useEffect(() => {
    // If we are on the account page, we might be loading an object. This
    // handler will redirect to the object page if no account exists but an
    // object does.
    if (!isObject && !isLoading) {
      if (objectData && !accountData) {
        navigate(`/object/${address}`, {replace: true});
      }
    }
  }, [address, isObject, isLoading, accountData, objectData, navigate]);

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
        {state.network_name.toLowerCase() === Network.MAINNET && (
          <AptosNamesBanner />
        )}
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
