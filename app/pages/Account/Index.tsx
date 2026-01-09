import {useParams} from "@tanstack/react-router";
import {Grid} from "@mui/material";
import React, {useEffect} from "react";
import AccountTabs from "./Tabs";
import AccountTitle from "./Title";
import BalanceCard from "./BalanceCard";
import PageHeader from "../layout/PageHeader";
import LoadingModal from "../../components/LoadingModal";
import Error from "./Error";
import {AptosNamesBanner} from "./Components/AptosNamesBanner";
import {PetraVaultBanner} from "./Components/PetraVaultBanner";
import {useNetworkName} from "../../global-config";
import {Network, Types} from "aptos";
import {useGetAccountResources} from "../../api/hooks/useGetAccountResources";
import {AccountAddress} from "@aptos-labs/ts-sdk";
import {useNavigate} from "../../routing";
import {ResponseError, ResponseErrorType} from "../../api/client";
import {objectCoreResource} from "../../constants";
import {useGetAddressFromName} from "../../api/hooks/useGetANS";
import {useAccountTabValues} from "./hooks/useAccountTabValues";

type AccountPageProps = {
  isObject?: boolean;
  /** Custom content to render instead of the default tab panel (used for modules sub-routes) */
  children?: React.ReactNode;
};

export function accountPagePath(isObject: boolean) {
  if (isObject) {
    return "object";
  }
  return "account";
}

export default function AccountPage({
  isObject: alreadyIsObject,
  children,
}: AccountPageProps) {
  const navigate = useNavigate();
  const params = useParams({strict: false}) as {address?: string};
  const maybeAddress = params.address;

  // Check if this is an ANS name
  const isAptName = maybeAddress?.endsWith(".apt");
  const ansQuery = useGetAddressFromName(isAptName ? maybeAddress || "" : "");

  let address: string = "";
  let addressError: ResponseError | null = null;

  if (maybeAddress) {
    if (isAptName) {
      // Handle ANS name resolution
      if (ansQuery.isLoading) {
        // Still loading ANS resolution, keep address empty for now
        address = "";
      } else if (ansQuery.data) {
        // Successfully resolved ANS name
        address = ansQuery.data;
      } else if (ansQuery.isError || (!ansQuery.isLoading && !ansQuery.data)) {
        // ANS resolution failed
        addressError = {
          type: ResponseErrorType.NOT_FOUND,
          message: `ANS name '${maybeAddress}' not found`,
        };
      }
    } else {
      // Handle regular address
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

  const isLoading = resourcesIsLoading || (!!isAptName && ansQuery.isLoading);
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
        navigate({to: `/object/${address}/transactions`, replace: true});
      }
    }

    // If we successfully resolved an ANS name and have an address,
    // optionally redirect to the address URL for clean URLs
    // (This is optional - you may want to keep the ANS name in the URL)
    // if (isAptName && address && !isLoading && maybeAddress !== address) {
    //   const currentPath = window.location.pathname;
    //   const newPath = currentPath.replace(`/account/${maybeAddress}`, `/account/${address}`);
    //   navigate(newPath, { replace: true });
    // }
  }, [
    address,
    alreadyIsObject,
    isObject,
    isLoading,
    accountData,
    resourceData,
    navigate,
    isAccount,
    isAptName,
    maybeAddress,
  ]);

  const networkName = useNetworkName();
  const tabValues = useAccountTabValues(
    alreadyIsObject || isObject,
    isMultisig,
  );

  const accountTabs = (
    <AccountTabs
      address={address}
      accountData={accountData}
      objectData={objectData}
      resourceData={resourceData}
      tabValues={tabValues}
      isObject={isObject}
      currentTab={children ? "modules" : undefined}
    >
      {children}
    </AccountTabs>
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
        {networkName === Network.MAINNET && <AptosNamesBanner />}
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
