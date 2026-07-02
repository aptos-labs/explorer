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
import type {Types} from "~/types/aptos";
import {getTransactions} from "../../api";
import {type ResponseError, ResponseErrorType} from "../../api/client";
import useFunctionFilter from "../../api/hooks/useFunctionFilter";
import {useGetLedgerInfo} from "../../api/hooks/useGetLedgerInfo";
import {
  useAptosClient,
  useNetworkValue,
} from "../../global-config/GlobalConfig";
import {useSearchParams} from "../../routing";
import FunctionFilter from "./Components/FunctionFilter";
import TransactionsError from "./Error";
import TransactionsTable from "./TransactionsTable";
import {FilteredUserTransactionsByFunction} from "./UserTransactions";

const LIMIT = 20;

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
}: {
  data: Array<Types.Transaction> | undefined;
  isLoading: boolean;
  error: ResponseError | null | undefined;
}) {
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

  if (!data || data.length === 0) {
    return null;
  }

  return <TransactionsTable transactions={data} />;
}

function TransactionsPageInner({
  data,
  isLoading,
  error,
}: UseQueryResult<Types.IndexResponse, ResponseError>) {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();
  const [searchParams] = useSearchParams();

  const {
    functionFilter,
    handleFunctionFilterChange,
    clearFunctionFilter,
    isFilterActive,
  } = useFunctionFilter();

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
    enabled: !!data?.ledger_version && !isFilterActive,
  });

  if (isFilterActive) {
    return (
      <Stack spacing={2}>
        <FunctionFilter
          value={functionFilter}
          onChange={handleFunctionFilterChange}
          onClear={clearFunctionFilter}
          isFilterActive={isFilterActive}
        />
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
          }}
        >
          Entry function filters apply to user transactions. Results use the
          same indexer query as the User Transactions tab.
        </Typography>
        <FilteredUserTransactionsByFunction functionFilter={functionFilter} />
      </Stack>
    );
  }

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
        onClear={clearFunctionFilter}
        isFilterActive={isFilterActive}
      />
      <Box sx={{width: "auto", overflowX: "auto"}}>
        <TransactionContent
          data={result.data}
          isLoading={result.isLoading}
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
  // Shared ledger-info polling — see `useGetLedgerInfo` for cadence and
  // background-pause behavior. Avoids spinning up a second poller on
  // `/transactions` when the TPS pill (`useGetTPS`) is already running.
  const result = useGetLedgerInfo();
  return <TransactionsPageInner {...result} />;
}
