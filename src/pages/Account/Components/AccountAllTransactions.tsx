import React from "react";
import Box from "@mui/material/Box";
import {useSearchParams} from "react-router-dom";
import {Pagination, Stack, Typography} from "@mui/material";
import {UserTransactionsTable} from "../../Transactions/TransactionsTable";
import {
  useGetAccountAllTransactionCount,
  useGetAccountAllTransactionVersions,
} from "../../../api/hooks/useGetAccountAllTransactions";
import {useLogEventWithBasic} from "../hooks/useLogEventWithBasic";

function RenderPagination({
  currentPage,
  numPages,
}: {
  currentPage: number;
  numPages: number;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const logEvent = useLogEventWithBasic();

  const handleChange = (
    _event: React.ChangeEvent<unknown>,
    newPageNum: number,
  ) => {
    searchParams.set("page", newPageNum.toString());
    setSearchParams(searchParams);

    // logging
    logEvent("go_to_new_page", newPageNum, {
      current_page_num: currentPage.toString(),
      new_page_num: newPageNum.toString(),
    });
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

type AccountAllTransactionsWithPaginationProps = {
  address: string;
  numPages: number;
  countPerPage: number;
};

export function AccountAllTransactionsWithPagination({
  address,
  numPages,
  countPerPage,
}: AccountAllTransactionsWithPaginationProps) {
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1");
  const offset = (currentPage - 1) * countPerPage;

  const versions = useGetAccountAllTransactionVersions(
    address,
    countPerPage,
    offset,
  );

  // Only show pagination when there is actual data
  // If the first page has no data, the account has no transactions, so pagination should not be shown
  const hasData = versions.length > 0;
  const shouldShowPagination = numPages > 1 && hasData;

  return (
    <>
      <Stack spacing={2}>
        <Box sx={{width: "auto", overflowX: "auto"}}>
          <UserTransactionsTable versions={versions} address={address} />
        </Box>
        {shouldShowPagination && (
          <Box sx={{display: "flex", justifyContent: "center"}}>
            <RenderPagination currentPage={currentPage} numPages={numPages} />
          </Box>
        )}
      </Stack>
    </>
  );
}

type AccountAllTransactionsProps = {
  address: string;
};

export default function AccountAllTransactions({
  address,
}: AccountAllTransactionsProps) {
  let txnCount = useGetAccountAllTransactionCount(address);
  let canSeeAll = true;

  if (txnCount === undefined) {
    // If we can't load the number of transactions, the indexer query is too expensive
    // We'll default to 10k transactions in the event there's no account data,
    // it's better to allow access then to fail
    // Sequence number, is not a reliable way to determine the number of transactions, and will lead to
    // empty pages in really large accounts.
    txnCount = 10000;
    canSeeAll = false;
  }

  const countPerPage = 25;
  // If transaction count is 0, set numPages to 0 so pagination won't be shown
  const numPages = txnCount > 0 ? Math.ceil(txnCount / countPerPage) : 0;

  return (
    <Stack>
      <Typography sx={{my: 2}}>
        {canSeeAll
          ? `Showing all ${txnCount} transactions`
          : `Showing the last ${txnCount} transactions`}
      </Typography>
      <AccountAllTransactionsWithPagination
        address={address}
        numPages={numPages}
        countPerPage={countPerPage}
      />
    </Stack>
  );
}
