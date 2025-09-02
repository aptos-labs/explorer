import {useParams} from "react-router-dom";
import {Grid} from "@mui/material";
import React, {useEffect} from "react";
import AccountTabs, {TabValue} from "./Tabs";
import AccountTitle from "./Title";
import BalanceCard from "./BalanceCard";
import PageHeader from "../layout/PageHeader";
import {useGetIsGraphqlClientSupported} from "../../api/hooks/useGraphqlClient";
import LoadingModal from "../../components/LoadingModal";
import Error from "./Error";
import {AptosNamesBanner} from "./Components/AptosNamesBanner";
import {PetraVaultBanner} from "./Components/PetraVaultBanner";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {Network, Types} from "aptos";
import {useGetAccountResources} from "../../api/hooks/useGetAccountResources";
import {AccountAddress} from "@aptos-labs/ts-sdk";
import {useNavigate} from "../../routing";
import {ResponseError, ResponseErrorType} from "../../api/client";
import {objectCoreResource} from "../../constants";

const TAB_VALUES_FULL: TabValue[] = [
  "transactions",
  "coins",
  "tokens",
  "resources",
  "modules",
  "info",
];

const TAB_VALUES: TabValue[] = ["transactions", "resources", "modules", "info"];

const TAB_VALUES_MULTISIG_FULL: TabValue[] = [
  "transactions",
  "multisig",
  "coins",
  "tokens",
  "resources",
  "modules",
  "info",
];

const TAB_VALUES_MULTISIG: TabValue[] = [
  "transactions",
  "multisig",
  "resources",
  "modules",
  "info",
];

// TODO: add ability for object information
const OBJECT_VALUES_FULL: TabValue[] = [
  "transactions",
  "coins",
  "tokens",
  "resources",
  "modules",
  "info",
];
const OBJECT_TAB_VALUES: TabValue[] = [
  "transactions",
  "resources",
  "modules",
  "info",
];

type AccountPageProps = {
  isObject?: boolean;
};

export function accountPagePath(isObject: boolean) {
  if (isObject) {
    return "object";
  }
  return "account";
}

export default function AccountPage({
  isObject: alreadyIsObject,
}: AccountPageProps) {
  const navigate = useNavigate();
  const isGraphqlClientSupported = useGetIsGraphqlClientSupported();
  const maybeAddress = useParams().address;
  let address: string = "";
  let addressError: ResponseError | null = null;
  if (maybeAddress) {
    try {
      address = AccountAddress.from(maybeAddress, {
        maxMissingChars: 63,
      }).toStringLong();
    } catch {
      addressError = {
        type: ResponseErrorType.INVALID_INPUT,
        message: `Invalid address '${maybeAddress}'`,
      };
    }
  }

  const {
    data: resourceData,
    error: resourceError,
    isLoading: resourcesIsLoading,
  } = useGetAccountResources(address, {retry: false});

  const accountData = resourceData?.find(
    (r) => r.type === "0x1::account::Account",
  )?.data as Types.AccountData | undefined;
  const objectData = resourceData?.find((r) => r.type === objectCoreResource);
  const tokenData = resourceData?.find((r) => r.type === "0x4::token::Token");
  const multisigData = resourceData?.find(
    (r) => r.type === "0x1::multisig_account::MultisigAccount",
  );
  const isAccount = !!accountData;
  const isObject = !!objectData;
  const isDeleted = !isObject;
  const isToken = !!tokenData;
  const isMultisig = !!multisigData;

  const isLoading = resourcesIsLoading;
  let error: ResponseError | null = null;
  if (addressError) {
    // If the address is not found, we can still show the account page, without an error
    if (addressError.type === ResponseErrorType.NOT_FOUND) {
      error = resourceError;
    } else {
      error = addressError;
    }
  } else if (resourceError) {
    error = resourceError;
  }

  useEffect(() => {
    // If we are on the account page, we might be loading an object. This
    // handler will redirect to the object page if no account exists but an
    // object does.
    if (!isLoading) {
      // TODO: Handle where it's both an object and an account
      if (!alreadyIsObject && isObject && !isAccount) {
        navigate(`/object/${address}`, {replace: true});
      }
    }
  }, [
    address,
    alreadyIsObject,
    isObject,
    isLoading,
    accountData,
    resourceData,
    navigate,
    isAccount,
  ]);

  const [state] = useGlobalState();

  let tabValues;
  if (isObject) {
    tabValues = isGraphqlClientSupported
      ? OBJECT_VALUES_FULL
      : OBJECT_TAB_VALUES;
  } else if (isMultisig) {
    tabValues = isGraphqlClientSupported
      ? TAB_VALUES_MULTISIG_FULL
      : TAB_VALUES_MULTISIG;
  } else {
    tabValues = isGraphqlClientSupported ? TAB_VALUES_FULL : TAB_VALUES;
  }

  const accountTabs = (
    <AccountTabs
      address={address}
      accountData={accountData}
      objectData={objectData}
      resourceData={resourceData}
      tabValues={tabValues}
      isObject={isObject}
    />
  );

  return (
    <Grid container spacing={1}>
      <LoadingModal open={isLoading} />
      <Grid size={{xs: 12, md: 12, lg: 12}}>
        <PageHeader />
      </Grid>
      <Grid size={{xs: 12, md: 8, lg: 9}} alignSelf="center">
        <AccountTitle
          address={address}
          isMultisig={isMultisig}
          isObject={isObject}
          isDeleted={isDeleted}
          isToken={isToken}
        />
      </Grid>
      <Grid size={{xs: 12, md: 4, lg: 3}} marginTop={{md: 0, xs: 2}}>
        <BalanceCard address={address} />
      </Grid>
      <Grid size={{xs: 12, md: 8, lg: 12}} marginTop={4} alignSelf="center">
        {state.network_name === Network.MAINNET && <AptosNamesBanner />}
        {isMultisig && <PetraVaultBanner address={address} />}
      </Grid>
      <Grid size={{xs: 12, md: 12, lg: 12}} marginTop={4}>
        {error ? (
          <>
            {accountTabs}
            <Error address={address} error={error} />
          </>
        ) : (
          <>{accountTabs}</>
        )}
      </Grid>
    </Grid>
  );
}
