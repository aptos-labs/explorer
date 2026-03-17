import {CircularProgress, Pagination, Stack, Typography} from "@mui/material";
import Box from "@mui/material/Box";
import type React from "react";
import useFunctionFilter from "../../api/hooks/useFunctionFilter";
import useGetUserTransactionVersions, {
  useGetUserTransactionsByFunctionCount,
  useGetUserTransactionVersionsByFunction,
} from "../../api/hooks/useGetUserTransactionVersions";
import {useSearchParams} from "../../routing";
import FunctionFilter from "./Components/FunctionFilter";
import {UserTransactionsTable} from "./TransactionsTable";

const LIMIT = 20;
const NUM_PAGES = 100;

function RenderPagination({
  currentPage,
  numPages,
}: {
  currentPage: number;
  numPages: number;
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleChange = (
    _event: React.ChangeEvent<unknown>,
    newPageNum: number,
  ) => {
    searchParams.set("page", newPageNum.toString());
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

function FilteredUserTransactions({functionFilter}: {functionFilter: string}) {
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);
  const offset = (currentPage - 1) * LIMIT;

  const startVersion = useGetUserTransactionVersions(1)[0];
  const txnCount = useGetUserTransactionsByFunctionCount(functionFilter);
  const {versions, isLoading} = useGetUserTransactionVersionsByFunction(
    LIMIT,
    functionFilter,
    startVersion,
    offset,
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

  if (versions.length === 0) {
    return (
      <Box sx={{py: 4, textAlign: "center"}}>
        <Typography color="text.secondary">
          No transactions found for function "{functionFilter}"
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {txnCount !== undefined && (
        <Typography variant="body2" color="text.secondary">
          {txnCount.toLocaleString()} matching transaction
          {txnCount !== 1 ? "s" : ""}
        </Typography>
      )}
      <Box sx={{width: "auto", overflowX: "auto"}}>
        <UserTransactionsTable versions={versions} />
      </Box>
      {numPages > 1 && (
        <Box sx={{display: "flex", justifyContent: "center"}}>
          <RenderPagination currentPage={currentPage} numPages={numPages} />
        </Box>
      )}
    </Stack>
  );
}

function UnfilteredUserTransactions() {
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);
  const offset = (currentPage - 1) * LIMIT;

  const startVersion = useGetUserTransactionVersions(1)[0];
  const versions = useGetUserTransactionVersions(LIMIT, startVersion, offset);

  return (
    <Stack spacing={2}>
      <Box sx={{width: "auto", overflowX: "auto"}}>
        <UserTransactionsTable versions={versions} />
      </Box>
      <Box sx={{display: "flex", justifyContent: "center"}}>
        <RenderPagination currentPage={currentPage} numPages={NUM_PAGES} />
      </Box>
    </Stack>
  );
}

export default function UserTransactions() {
  const {functionFilter, handleFunctionFilterChange} = useFunctionFilter();

  return (
    <Stack spacing={2}>
      <FunctionFilter
        value={functionFilter}
        onChange={handleFunctionFilterChange}
      />
      {functionFilter ? (
        <FilteredUserTransactions functionFilter={functionFilter} />
      ) : (
        <UnfilteredUserTransactions />
      )}
    </Stack>
  );
}
