import {useQuery} from "@tanstack/react-query";
import {useNetworkValue, useSdkV2Client} from "../../global-config";
import {tryStandardizeAddress} from "../../utils";
import type {FunctionFilterParams} from "./useFunctionFilter";

const USER_TRANSACTIONS_QUERY = `
  query UserTransactions($limit: Int, $start_version: bigint, $offset: Int) {
    user_transactions(
      limit: $limit
      order_by: {version: desc}
      where: {version: {_lte: $start_version}}
      offset: $offset
    ) {
      version
    }
  }
`;

const TOP_USER_TRANSACTIONS_QUERY = `
  query UserTransactions($limit: Int) {
    user_transactions(limit: $limit, order_by: {version: desc}) {
      version
    }
  }
`;

function buildFunctionWhereClause(filter: FunctionFilterParams): string {
  const conditions: string[] = [];
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

function buildFunctionVarDecls(filter: FunctionFilterParams): string {
  const decls: string[] = [];
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

function buildFunctionVariables(
  filter: FunctionFilterParams,
): Record<string, string> {
  const vars: Record<string, string> = {};
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

function buildUserTransactionsFunctionQuery(
  filter: FunctionFilterParams,
): string {
  return `
  query UserTransactionsByFunction($limit: Int, $start_version: bigint, $offset: Int, ${buildFunctionVarDecls(filter)}) {
    user_transactions(
      limit: $limit
      order_by: {version: desc}
      where: {
        version: {_lte: $start_version}
        ${buildFunctionWhereClause(filter)}
      }
      offset: $offset
    ) {
      version
    }
  }
`;
}

function buildTopUserTransactionsFunctionQuery(
  filter: FunctionFilterParams,
): string {
  return `
  query UserTransactionsByFunction($limit: Int, ${buildFunctionVarDecls(filter)}) {
    user_transactions(
      limit: $limit
      order_by: {version: desc}
      where: {${buildFunctionWhereClause(filter)}}
    ) {
      version
    }
  }
`;
}

function buildUserTransactionsFunctionCountQuery(
  filter: FunctionFilterParams,
): string {
  return `
  query UserTransactionsByFunctionCount(${buildFunctionVarDecls(filter)}) {
    user_transactions_aggregate(
      where: {${buildFunctionWhereClause(filter)}}
    ) {
      aggregate {
        count
      }
    }
  }
`;
}

export default function useGetUserTransactionVersions(
  limit: number,
  startVersion?: number,
  offset?: number,
): number[] {
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();
  const topTxnsOnly = startVersion === undefined || offset === undefined;

  const {data} = useQuery({
    queryKey: [
      "userTransactionVersions",
      limit,
      startVersion,
      offset,
      networkValue,
    ],
    queryFn: () =>
      client.queryIndexer<{user_transactions: {version: number}[]}>({
        query: {
          query: topTxnsOnly
            ? TOP_USER_TRANSACTIONS_QUERY
            : USER_TRANSACTIONS_QUERY,
          variables: {limit, start_version: startVersion, offset},
        },
      }),
  });

  if (!data) {
    return [];
  }

  const rows = data.user_transactions;
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((txn: {version: number}) => txn.version);
}

export function useGetUserTransactionsByFunctionCount(
  functionFilter: FunctionFilterParams,
): number | undefined {
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();
  const filterActive =
    functionFilter.address !== "" ||
    functionFilter.module !== "" ||
    functionFilter.functionName !== "";

  const {data} = useQuery({
    queryKey: ["userTransactionsByFunctionCount", functionFilter, networkValue],
    queryFn: () =>
      client.queryIndexer<{
        user_transactions_aggregate: {aggregate: {count: number}};
      }>({
        query: {
          query: buildUserTransactionsFunctionCountQuery(functionFilter),
          variables: buildFunctionVariables(functionFilter),
        },
      }),
    enabled: filterActive,
  });

  return typeof data?.user_transactions_aggregate?.aggregate?.count === "number"
    ? data.user_transactions_aggregate.aggregate.count
    : undefined;
}

export function useGetUserTransactionVersionsByFunction(
  limit: number,
  functionFilter: FunctionFilterParams,
  startVersion?: number,
  offset?: number,
): {versions: number[]; isLoading: boolean; isError: boolean} {
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();
  const topTxnsOnly = startVersion === undefined || offset === undefined;
  const filterActive =
    functionFilter.address !== "" ||
    functionFilter.module !== "" ||
    functionFilter.functionName !== "";

  const {data, isLoading, isError} = useQuery({
    queryKey: [
      "userTransactionVersionsByFunction",
      limit,
      startVersion,
      offset,
      functionFilter,
      networkValue,
    ],
    queryFn: () =>
      client.queryIndexer<{user_transactions: {version: number}[]}>({
        query: {
          query: topTxnsOnly
            ? buildTopUserTransactionsFunctionQuery(functionFilter)
            : buildUserTransactionsFunctionQuery(functionFilter),
          variables: {
            limit,
            start_version: startVersion,
            offset,
            ...buildFunctionVariables(functionFilter),
          },
        },
      }),
    enabled: filterActive,
  });

  if (!data) {
    return {versions: [], isLoading, isError};
  }

  const rows = data.user_transactions;
  const versions = Array.isArray(rows)
    ? rows.map((txn: {version: number}) => txn.version)
    : [];

  return {
    versions,
    isLoading,
    isError,
  };
}
