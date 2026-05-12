import {useQuery} from "@tanstack/react-query";
import {useNetworkValue, useSdkV2Client} from "../../global-config";
import {tryStandardizeAddress} from "../../utils";
import type {FunctionFilterParams} from "./useFunctionFilter";

const ACCOUNT_TRANSACTIONS_COUNT_QUERY = `
  query AccountTransactionsCount($address: String) {
    account_transactions_aggregate(where: {account_address: {_eq: $address}}) {
      aggregate {
        count
      }
    }
  }
`;

export function useGetAccountAllTransactionCount(
  address: string,
): number | undefined {
  const addr64Hash = tryStandardizeAddress(address);
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();

  const {data} = useQuery({
    queryKey: ["accountTxnCount", addr64Hash, networkValue],
    queryFn: () =>
      client.queryIndexer<{
        account_transactions_aggregate: {aggregate: {count: number}};
      }>({
        query: {
          query: ACCOUNT_TRANSACTIONS_COUNT_QUERY,
          variables: {address: addr64Hash},
        },
      }),
    enabled: !!addr64Hash,
  });

  return data?.account_transactions_aggregate?.aggregate?.count;
}

const ACCOUNT_TRANSACTIONS_QUERY = `
  query AccountTransactionsData($address: String, $limit: Int, $offset: Int) {
    account_transactions(
      where: {account_address: {_eq: $address}}
      order_by: {transaction_version: desc}
      limit: $limit
      offset: $offset
    ) {
      transaction_version
    }
  }
`;

export function useGetAccountAllTransactionVersions(
  address: string,
  limit: number,
  offset?: number,
): number[] {
  const addr64Hash = tryStandardizeAddress(address);
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();

  const {data} = useQuery({
    queryKey: ["accountTxnVersions", addr64Hash, limit, offset, networkValue],
    queryFn: () =>
      client.queryIndexer<{
        account_transactions: {transaction_version: number}[];
      }>({
        query: {
          query: ACCOUNT_TRANSACTIONS_QUERY,
          variables: {address: addr64Hash, limit, offset},
        },
      }),
    enabled: !!addr64Hash,
  });

  if (!data) return [];
  return data.account_transactions.map(
    (resource: {transaction_version: number}) => resource.transaction_version,
  );
}

export function useGetAllAccountTransactionVersions(address: string): {
  versions: number[];
  loading: boolean;
  error: unknown;
} {
  const addr64Hash = tryStandardizeAddress(address);
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();

  const {isLoading, error, data} = useQuery({
    queryKey: ["allAccountTxnVersions", addr64Hash, networkValue],
    queryFn: () =>
      client.queryIndexer<{
        account_transactions: {transaction_version: number}[];
      }>({
        query: {
          query: ACCOUNT_TRANSACTIONS_QUERY,
          variables: {address: addr64Hash, limit: 10000, offset: 0},
        },
      }),
    enabled: !!addr64Hash,
  });

  if (!addr64Hash || error) {
    return {versions: [], loading: isLoading, error};
  }

  if (isLoading || !data) {
    return {versions: [], loading: true, error: null};
  }

  return {
    versions: data.account_transactions.map(
      (r: {transaction_version: number}) => r.transaction_version,
    ),
    loading: false,
    error: null,
  };
}

function buildAccountFunctionWhereClause(filter: FunctionFilterParams): string {
  const conditions: string[] = ["sender: {_eq: $sender}"];
  if (filter.address) {
    conditions.push(
      `entry_function_contract_address: {_eq: $entry_function_contract_address}`,
    );
  }
  if (filter.module) {
    conditions.push(
      `entry_function_module_name: {_eq: $entry_function_module_name}`,
    );
  }
  if (filter.functionName) {
    conditions.push(
      `entry_function_function_name: {_eq: $entry_function_function_name}`,
    );
  }
  return conditions.join("\n        ");
}

function buildAccountFunctionVarDecls(filter: FunctionFilterParams): string {
  const decls: string[] = ["$sender: String"];
  if (filter.address) {
    decls.push("$entry_function_contract_address: String");
  }
  if (filter.module) {
    decls.push("$entry_function_module_name: String");
  }
  if (filter.functionName) {
    decls.push("$entry_function_function_name: String");
  }
  return decls.join(", ");
}

function buildAccountFunctionVariables(
  sender: string,
  filter: FunctionFilterParams,
): Record<string, string> {
  const vars: Record<string, string> = {sender};
  if (filter.address) {
    vars.entry_function_contract_address =
      tryStandardizeAddress(filter.address) ?? filter.address;
  }
  if (filter.module) {
    vars.entry_function_module_name = filter.module;
  }
  if (filter.functionName) {
    vars.entry_function_function_name = filter.functionName;
  }
  return vars;
}

function buildAccountUserTransactionsByFunctionQuery(
  filter: FunctionFilterParams,
): string {
  return `
  query AccountUserTransactionsByFunction(${buildAccountFunctionVarDecls(filter)}, $limit: Int, $offset: Int) {
    user_transactions(
      where: {
        ${buildAccountFunctionWhereClause(filter)}
      }
      order_by: {version: desc}
      limit: $limit
      offset: $offset
    ) {
      version
    }
  }
`;
}

function buildAccountUserTransactionsByFunctionCountQuery(
  filter: FunctionFilterParams,
): string {
  return `
  query AccountUserTransactionsByFunctionCount(${buildAccountFunctionVarDecls(filter)}) {
    user_transactions_aggregate(
      where: {
        ${buildAccountFunctionWhereClause(filter)}
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;
}

export function useGetAccountTransactionsByFunctionCount(
  address: string,
  functionFilter: FunctionFilterParams,
): number | undefined {
  const addr64Hash = tryStandardizeAddress(address);
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();
  const filterActive =
    functionFilter.address !== "" ||
    functionFilter.module !== "" ||
    functionFilter.functionName !== "";

  const {data} = useQuery({
    queryKey: ["accountTxnByFnCount", addr64Hash, functionFilter, networkValue],
    queryFn: () =>
      client.queryIndexer<{
        user_transactions_aggregate: {aggregate: {count: number}};
      }>({
        query: {
          query:
            buildAccountUserTransactionsByFunctionCountQuery(functionFilter),
          variables: buildAccountFunctionVariables(
            addr64Hash ?? "",
            functionFilter,
          ),
        },
      }),
    enabled: !!addr64Hash && filterActive,
  });

  return data?.user_transactions_aggregate?.aggregate?.count;
}

export function useGetAccountTransactionVersionsByFunction(
  address: string,
  functionFilter: FunctionFilterParams,
  limit: number,
  offset?: number,
): {versions: number[]; isLoading: boolean; isError: boolean} {
  const addr64Hash = tryStandardizeAddress(address);
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();
  const filterActive =
    functionFilter.address !== "" ||
    functionFilter.module !== "" ||
    functionFilter.functionName !== "";

  const {data, isLoading, isError} = useQuery({
    queryKey: [
      "accountTxnVersionsByFn",
      addr64Hash,
      functionFilter,
      limit,
      offset,
      networkValue,
    ],
    queryFn: () =>
      client.queryIndexer<{
        user_transactions: {version: number}[];
      }>({
        query: {
          query: buildAccountUserTransactionsByFunctionQuery(functionFilter),
          variables: {
            ...buildAccountFunctionVariables(addr64Hash ?? "", functionFilter),
            limit,
            offset,
          },
        },
      }),
    enabled: !!addr64Hash && filterActive,
  });

  if (!data) return {versions: [], isLoading, isError};
  return {
    versions: data.user_transactions.map(
      (txn: {version: number}) => txn.version,
    ),
    isLoading,
    isError,
  };
}
