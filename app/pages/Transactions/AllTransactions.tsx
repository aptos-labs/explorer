import {
  Alert,
  CircularProgress,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import {
  keepPreviousData,
  type UseQueryResult,
  useQuery,
} from "@tanstack/react-query";
import type React from "react";
import {useCallback, useMemo} from "react";
import type {Types} from "~/types/aptos";
import {getLedgerInfo, getTransactions} from "../../api";
import {type ResponseError, ResponseErrorType} from "../../api/client";
import {
  useAptosClient,
  useNetworkValue,
} from "../../global-config/GlobalConfig";
import {useSearchParams} from "../../routing";
import FunctionFilter from "./Components/FunctionFilter";
import TransactionsError from "./Error";
import TransactionsTable from "./TransactionsTable";

const LIMIT = 20;

function getEntryFunctionId(transaction: Types.Transaction): string | null {
  if (!("payload" in transaction)) return null;
  const payload = transaction.payload;
  if (payload.type === "entry_function_payload" && "function" in payload) {
    return payload.function;
  }
  if (
    payload.type === "multisig_payload" &&
    "transaction_payload" in payload &&
    payload.transaction_payload &&
    "function" in payload.transaction_payload
  ) {
    return payload.transaction_payload.function;
  }
  return null;
}

function maxStart(maxVersion: number, limit: number) {
  return 1 + maxVersion - limit;
}

function RenderPagination({
  start,
  limit,
  maxVersion,
}: {
  start: number;
  limit: number;
  maxVersion: number;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const numPages = Math.ceil(maxVersion / limit);
  const progress = 1 - (start + limit - 1) / maxVersion;
  const currentPage = 1 + Math.floor(progress * numPages);

  const handleChange = (
    _event: React.ChangeEvent<unknown>,
    newPageNum: number,
  ) => {
    const delta = (currentPage - newPageNum) * limit;
    const newStart = Math.max(
      0,
      Math.min(maxStart(maxVersion, limit), start + delta),
    );

    searchParams.set("start", newStart.toString());
    setSearchParams(searchParams);
  };

  return (
    <Pagination
      sx={{mt: 3}}
      count={numPages}
      variant="outlined"
      showFirstButton
      showLastButton
      page={currentPage}
      siblingCount={4}
      boundaryCount={0}
      shape="rounded"
      onChange={handleChange}
    />
  );
}

function TransactionContent({
  data,
  isLoading,
  error,
  functionFilter,
}: {
  data: Array<Types.Transaction> | undefined;
  isLoading: boolean;
  error: ResponseError | null | undefined;
  functionFilter: string;
}) {
  const filteredData = useMemo(() => {
    if (!data || !functionFilter) return data;
    return data.filter((txn) => {
      const fnId = getEntryFunctionId(txn);
      if (!fnId) return false;
      return fnId.toLowerCase().includes(functionFilter.toLowerCase());
    });
  }, [data, functionFilter]);

  if (isLoading) {
    return (
      <Box sx={{display: "flex", justifyContent: "center", py: 4}}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    const responseError: ResponseError =
      typeof error === "object" &&
      error !== null &&
      "type" in error &&
      typeof (error as {type: unknown}).type === "string"
        ? (error as ResponseError)
        : {
            type: ResponseErrorType.UNHANDLED,
            message:
              typeof error === "object" && error !== null && "message" in error
                ? String((error as {message: unknown}).message)
                : String(error),
          };
    return <TransactionsError error={responseError} />;
  }

  if (!filteredData || filteredData.length === 0) {
    if (functionFilter && data && data.length > 0) {
      return (
        <Box sx={{py: 4, textAlign: "center"}}>
          <Typography color="text.secondary">
            No transactions matching "{functionFilter}" on this page. Try the
            User Transactions tab for server-side filtering.
          </Typography>
        </Box>
      );
    }
    return null;
  }

  return <TransactionsTable transactions={filteredData} />;
}

function TransactionsPageInner({
  data,
  isLoading,
  error,
}: UseQueryResult<Types.IndexResponse, ResponseError>) {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const functionFilter = searchParams.get("fn") ?? "";

  const handleFunctionFilterChange = useCallback(
    (value: string) => {
      if (value) {
        searchParams.set("fn", value);
      } else {
        searchParams.delete("fn");
      }
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams],
  );

  const maxVersion = data?.ledger_version
    ? parseInt(data.ledger_version, 10)
    : 0;
  const limit = LIMIT;
  let start = maxStart(maxVersion, limit);
  const startParam = searchParams.get("start");
  if (startParam !== null) {
    start = parseInt(startParam, 10);
  }

  const result = useQuery<Array<Types.Transaction>, ResponseError>({
    queryKey: ["transactions", {start, limit}, networkValue],
    queryFn: () => getTransactions({start, limit}, aptosClient),
    placeholderData: keepPreviousData,
    enabled: !!data?.ledger_version,
  });

  if (isLoading) {
    return (
      <Box sx={{display: "flex", justifyContent: "center", py: 4}}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    const responseError: ResponseError =
      typeof error === "object" &&
      error !== null &&
      "type" in error &&
      typeof (error as {type: unknown}).type === "string"
        ? (error as ResponseError)
        : {
            type: ResponseErrorType.UNHANDLED,
            message:
              typeof error === "object" && error !== null && "message" in error
                ? String((error as {message: unknown}).message)
                : String(error),
          };
    return <TransactionsError error={responseError} />;
  }

  if (!data?.ledger_version) {
    return (
      <Alert severity="warning">
        Unable to determine ledger version. Please try again later.
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <FunctionFilter
        value={functionFilter}
        onChange={handleFunctionFilterChange}
        placeholder="Filter by function on current page (e.g. 0x1::coin::transfer)"
      />
      {functionFilter && (
        <Typography variant="caption" color="text.secondary">
          Showing matches on current page only. Switch to User Transactions for
          full server-side filtering.
        </Typography>
      )}
      <Box sx={{width: "auto", overflowX: "auto"}}>
        <TransactionContent
          data={result.data}
          isLoading={result.isLoading}
          functionFilter={functionFilter}
          error={
            result.error
              ? typeof result.error === "object" &&
                result.error !== null &&
                "type" in result.error &&
                typeof (result.error as {type: unknown}).type === "string"
                ? (result.error as ResponseError)
                : {
                    type: ResponseErrorType.UNHANDLED,
                    message:
                      typeof result.error === "object" &&
                      result.error !== null &&
                      "message" in result.error
                        ? String((result.error as {message: unknown}).message)
                        : String(result.error),
                  }
              : null
          }
        />
      </Box>

      <Box sx={{display: "flex", justifyContent: "center"}}>
        <RenderPagination
          {...{
            start,
            limit,
            maxVersion,
          }}
        />
      </Box>
    </Stack>
  );
}

export default function AllTransactions() {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();

  const result = useQuery<Types.IndexResponse, ResponseError>({
    queryKey: ["ledgerInfo", networkValue],
    queryFn: () => getLedgerInfo(aptosClient),
    refetchInterval: 10000,
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });

  return <TransactionsPageInner {...result} />;
}
