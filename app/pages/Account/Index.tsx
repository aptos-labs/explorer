import {AccountAddress, Network} from "@aptos-labs/ts-sdk";
import {Grid, Stack, Typography} from "@mui/material";
import {useLocation, useParams} from "@tanstack/react-router";
import type React from "react";
import {useEffect} from "react";
import type {Types} from "~/types/aptos";
import {
  isNotFoundError,
  type ResponseError,
  ResponseErrorType,
} from "../../api/client";
import {useGetAccountResources} from "../../api/hooks/useGetAccountResources";
import {useGetAddressFromName} from "../../api/hooks/useGetANS";
import {ACCOUNT_RESOURCE_TYPE} from "../../api/queries";
import {
  BalanceCardSkeleton,
  TitleHashSkeleton,
} from "../../components/PageLoadSkeletons";
import {objectCoreResource, tokenV2Address} from "../../constants";
import {useNetworkName} from "../../global-config";
import {useNavigate} from "../../routing";
import PageHeader from "../layout/PageHeader";
import BalanceCard from "./BalanceCard";
import {AptosNamesBanner} from "./Components/AptosNamesBanner";
import {DefunctProtocolBanner} from "./Components/DefunctProtocolBanner";
import {KnownAddressBrandingBanner} from "./Components/KnownAddressBrandingBanner";
import {PetraVaultBanner} from "./Components/PetraVaultBanner";
import AccountError from "./Error";
import {
  useAccountPageLayout,
  shouldRedirectAccountToObject,
} from "./hooks/useAccountPageLayout";
import {useAccountTabValues} from "./hooks/useAccountTabValues";
import AccountTabs from "./Tabs";
import AccountTitle from "./Title";

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

function mergeLayoutResources(
  resourceData: Types.MoveResource[] | undefined,
  layoutResources: Types.MoveResource[],
): Types.MoveResource[] | undefined {
  if (resourceData && resourceData.length > 0) {
    return resourceData;
  }
  if (layoutResources.length > 0) {
    return layoutResources;
  }
  return resourceData;
}

export default function AccountPage({
  isObject: alreadyIsObject,
  children,
}: AccountPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams({strict: false}) as {
    address?: string;
    tab?: string;
  };
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
        address = "";
      } else if (ansQuery.data) {
        address = ansQuery.data;
      } else if (ansQuery.isError || (!ansQuery.isLoading && !ansQuery.data)) {
        addressError = {
          type: ResponseErrorType.NOT_FOUND,
          message: `ANS name '${maybeAddress}' not found`,
        };
      }
    } else {
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

  const layout = useAccountPageLayout(address);
  const {
    data: resourceData,
    error: resourceError,
    isLoading: resourcesIsLoading,
    isFetched: resourcesIsFetched,
  } = useGetAccountResources(address, {
    retry: false,
    enabled: !!address && layout.isFetched,
  });

  const layoutResources = [
    layout.accountResource,
    layout.objectData,
    layout.tokenData,
    layout.multisigData,
  ].filter((resource): resource is Types.MoveResource => Boolean(resource));

  const accountData =
    layout.accountData ??
    (resourceData?.find((r) => r.type === ACCOUNT_RESOURCE_TYPE)?.data as
      | Types.AccountData
      | undefined);
  const objectData =
    layout.objectData ??
    resourceData?.find((r) => r.type === objectCoreResource);
  const tokenData =
    layout.tokenData ?? resourceData?.find((r) => r.type === tokenV2Address);
  const isObject =
    alreadyIsObject || (layout.isFetched ? layout.isObject : !!objectData);
  const isDeleted = layout.isFetched && !layout.isObject;
  const isToken = layout.isFetched ? layout.isToken : !!tokenData;
  const isMultisig = layout.isFetched ? layout.isMultisig : false;

  const resolvingAddress = !!isAptName && ansQuery.isLoading;
  let error: ResponseError | null = null;
  if (addressError) {
    error = addressError;
  } else if (layout.error) {
    error = layout.error;
  } else if (resourceError && !isNotFoundError(resourceError)) {
    error = resourceError;
  } else if (
    layout.isFetched &&
    !layout.isAccount &&
    !layout.isObject &&
    !layout.error &&
    resourcesIsFetched &&
    (!resourceData ||
      resourceData.length === 0 ||
      isNotFoundError(resourceError))
  ) {
    error = {
      type: ResponseErrorType.NOT_FOUND,
      message:
        resourceError && isNotFoundError(resourceError)
          ? resourceError.message
          : undefined,
    };
  }

  useEffect(() => {
    if (
      shouldRedirectAccountToObject(
        !!alreadyIsObject,
        layout.isObject,
        layout.isAccount,
        layout.isFetched,
      )
    ) {
      const objectPath = location.pathname.replace(/^\/account\//, "/object/");
      navigate({
        to: objectPath,
        search: location.search,
        replace: true,
      });
    }
  }, [
    alreadyIsObject,
    layout.isObject,
    layout.isAccount,
    layout.isFetched,
    navigate,
    location.pathname,
    location.search,
  ]);

  const networkName = useNetworkName();
  const tabValues = useAccountTabValues(
    alreadyIsObject || isObject,
    isMultisig,
  );

  const pathTab = params.tab ?? (children ? "modules" : undefined);

  /** `/account/.../modules/...` or `/object/.../modules/...` — resources 404 is often “no account resource row” while modules tab still loads via other APIs */
  const isModulesRoute = location.pathname.includes("/modules/");

  const accountTabs = (
    <AccountTabs
      address={address}
      accountData={accountData}
      objectData={objectData}
      resourceData={mergeLayoutResources(resourceData, layoutResources)}
      resourcesIsLoading={
        !!address && (resourcesIsLoading || !resourcesIsFetched)
      }
      tabValues={tabValues}
      isObject={isObject}
      currentTab={children ? "modules" : undefined}
      tabsPending={resolvingAddress || (!!address && !layout.isFetched)}
    >
      {children}
    </AccountTabs>
  );

  const showError =
    error && !(isModulesRoute && error.type === ResponseErrorType.NOT_FOUND);

  return (
    <Grid container spacing={1}>
      <Grid size={{xs: 12, md: 12, lg: 12}}>
        <PageHeader />
      </Grid>
      <Grid
        size={{xs: 12, md: 8, lg: 9}}
        sx={{
          alignSelf: "center",
        }}
      >
        {address || !resolvingAddress ? (
          <AccountTitle
            address={address || maybeAddress || ""}
            isMultisig={isMultisig}
            isObject={isObject}
            objectRoute={alreadyIsObject}
            pathTab={pathTab}
            isDeleted={isDeleted}
            isToken={isToken}
          />
        ) : (
          <Stack direction="column" spacing={2} sx={{marginX: 1}}>
            <Typography variant="h3" component="h1">
              Account
            </Typography>
            <TitleHashSkeleton />
          </Stack>
        )}
      </Grid>
      <Grid
        size={{xs: 12, md: 4, lg: 3}}
        sx={{
          marginTop: {md: 0, xs: 2},
        }}
      >
        {address ? <BalanceCard address={address} /> : <BalanceCardSkeleton />}
      </Grid>
      <Grid
        size={{xs: 12, md: 8, lg: 12}}
        sx={{
          marginTop: 4,
          alignSelf: "center",
        }}
      >
        {address ? <KnownAddressBrandingBanner address={address} /> : null}
        {networkName === Network.MAINNET && <AptosNamesBanner />}
        {networkName === Network.MAINNET && address && (
          <DefunctProtocolBanner address={address} />
        )}
        {isMultisig && <PetraVaultBanner address={address} />}
      </Grid>
      <Grid
        size={{xs: 12, md: 12, lg: 12}}
        sx={{
          marginTop: 4,
        }}
      >
        {showError && error ? (
          <>
            {accountTabs}
            <AccountError address={address} error={error} />
          </>
        ) : (
          accountTabs
        )}
      </Grid>
    </Grid>
  );
}
