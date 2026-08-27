import type {Types} from "~/types/aptos";
import {
  isNotFoundError,
  type ResponseError,
  toResponseError,
} from "../../../api/client";
import {useGetAccountResource} from "../../../api/hooks/useGetAccountResource";
import {
  ACCOUNT_RESOURCE_TYPE,
  MULTISIG_ACCOUNT_RESOURCE_TYPE,
} from "../../../api/queries";
import {objectCoreResource, tokenV2Address} from "../../../lib/constants";

export type LayoutResourceQuery = {
  data: Types.MoveResource | undefined;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  isFetched: boolean;
};

export type AccountPageLayout = {
  accountResource: Types.MoveResource | undefined;
  accountData: Types.AccountData | undefined;
  objectData: Types.MoveResource | undefined;
  tokenData: Types.MoveResource | undefined;
  multisigData: Types.MoveResource | undefined;
  isAccount: boolean;
  isObject: boolean;
  isToken: boolean;
  isMultisig: boolean;
  isPending: boolean;
  isFetched: boolean;
  error: ResponseError | null;
};

function presentResource(
  query: LayoutResourceQuery,
): Types.MoveResource | undefined {
  if (query.data) return query.data;
  if (query.isError && isNotFoundError(query.error)) return undefined;
  return query.data;
}

/**
 * Combine the four layout resource probes into page-organization flags.
 * 404s mean "this resource is absent", not a page failure.
 */
export function mapAccountLayoutQueries(
  queries: {
    account: LayoutResourceQuery;
    object: LayoutResourceQuery;
    token: LayoutResourceQuery;
    multisig: LayoutResourceQuery;
  },
  hasAddress: boolean,
): AccountPageLayout {
  const all = [
    queries.account,
    queries.object,
    queries.token,
    queries.multisig,
  ];
  const isPending = hasAddress && all.some((query) => query.isPending);
  const isFetched = hasAddress && all.every((query) => query.isFetched);

  const hardError = all.find(
    (query) => query.isError && !isNotFoundError(query.error),
  );

  const accountResource = presentResource(queries.account);
  const objectData = presentResource(queries.object);
  const tokenData = presentResource(queries.token);
  const multisigData = presentResource(queries.multisig);

  return {
    accountResource,
    accountData: accountResource?.data as Types.AccountData | undefined,
    objectData,
    tokenData,
    multisigData,
    isAccount: !!accountResource,
    isObject: !!objectData,
    isToken: !!tokenData,
    isMultisig: !!multisigData,
    isPending,
    isFetched,
    error: hardError ? toResponseError(hardError.error) : null,
  };
}

export function shouldRedirectAccountToObject(
  alreadyIsObject: boolean,
  isObject: boolean,
  isAccount: boolean,
  isLayoutFetched: boolean,
): boolean {
  return isLayoutFetched && !alreadyIsObject && isObject && !isAccount;
}

/**
 * Fetch the four resources that decide title, tabs, and object redirect.
 * The full resource list is a separate, lower-priority query.
 */
export function useAccountPageLayout(address: string): AccountPageLayout {
  const hasAddress = Boolean(address);
  const accountQuery = useGetAccountResource(
    address || undefined,
    ACCOUNT_RESOURCE_TYPE,
    undefined,
    {retry: false},
  );
  const objectQuery = useGetAccountResource(
    address || undefined,
    objectCoreResource,
    undefined,
    {retry: false},
  );
  const tokenQuery = useGetAccountResource(
    address || undefined,
    tokenV2Address,
    undefined,
    {retry: false},
  );
  const multisigQuery = useGetAccountResource(
    address || undefined,
    MULTISIG_ACCOUNT_RESOURCE_TYPE,
    undefined,
    {retry: false},
  );

  return mapAccountLayoutQueries(
    {
      account: accountQuery,
      object: objectQuery,
      token: tokenQuery,
      multisig: multisigQuery,
    },
    hasAddress,
  );
}
