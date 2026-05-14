import {Alert, CircularProgress, Stack, Typography} from "@mui/material";
import Box from "@mui/material/Box";
import useFunctionFilter, {
  type FunctionFilterParams,
} from "../../api/hooks/useFunctionFilter";
import useGetUserTransactionVersions, {
  useGetUserTransactionsByFunctionCount,
  useGetUserTransactionVersionsByFunction,
} from "../../api/hooks/useGetUserTransactionVersions";
import PageNumberPagination, {
  useCurrentPage,
} from "../../components/PageNumberPagination";
import FunctionFilter from "./Components/FunctionFilter";
import {UserTransactionsTable} from "./TransactionsTable";

const LIMIT = 20;
const NUM_PAGES = 100;

/** Shared by User Transactions and All Transactions when a function filter is active. */
export function FilteredUserTransactionsByFunction({
  functionFilter,
}: {
  functionFilter: FunctionFilterParams;
}) {
  const currentPage = useCurrentPage();
  const offset = (currentPage - 1) * LIMIT;

  const startVersion = useGetUserTransactionVersions(1)[0];
  const txnCount = useGetUserTransactionsByFunctionCount(functionFilter);
  const {versions, isLoading, isError} =
    useGetUserTransactionVersionsByFunction(
      LIMIT,
      functionFilter,
      startVersion,
      startVersion !== undefined ? offset : undefined,
    );

  const numPages =
    txnCount !== undefined ? Math.max(1, Math.ceil(txnCount / LIMIT)) : 1;

  if (isLoading) {
    return (
      <Box sx={{display: "flex", justifyContent: "center", py: 4}}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        Failed to filter transactions by function. The filter values may be
        invalid or the indexer may be temporarily unavailable.
      </Alert>
    );
  }

  if (versions.length === 0) {
    return (
      <Box sx={{py: 4, textAlign: "center"}}>
        <Typography
          sx={{
            color: "text.secondary",
          }}
        >
          No transactions found matching the filter. The indexer returned no
          matching user transactions for this network.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {txnCount !== undefined && (
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
          }}
        >
          {txnCount.toLocaleString()} matching transaction
          {txnCount !== 1 ? "s" : ""}
        </Typography>
      )}
      <Box sx={{width: "auto", overflowX: "auto"}}>
        <UserTransactionsTable versions={versions} />
      </Box>
      {numPages > 1 && (
        <PageNumberPagination currentPage={currentPage} numPages={numPages} />
      )}
    </Stack>
  );
}

function UnfilteredUserTransactions() {
  const currentPage = useCurrentPage();
  const offset = (currentPage - 1) * LIMIT;

  const startVersion = useGetUserTransactionVersions(1)[0];
  const versions = useGetUserTransactionVersions(LIMIT, startVersion, offset);

  return (
    <Stack spacing={2}>
      <Box sx={{width: "auto", overflowX: "auto"}}>
        <UserTransactionsTable versions={versions} />
      </Box>
      <PageNumberPagination currentPage={currentPage} numPages={NUM_PAGES} />
    </Stack>
  );
}

export default function UserTransactions() {
  const {
    functionFilter,
    handleFunctionFilterChange,
    clearFunctionFilter,
    isFilterActive,
  } = useFunctionFilter();

  return (
    <Stack spacing={2}>
      <FunctionFilter
        value={functionFilter}
        onChange={handleFunctionFilterChange}
        onClear={clearFunctionFilter}
        isFilterActive={isFilterActive}
      />
      {isFilterActive ? (
        <FilteredUserTransactionsByFunction functionFilter={functionFilter} />
      ) : (
        <UnfilteredUserTransactions />
      )}
    </Stack>
  );
}
