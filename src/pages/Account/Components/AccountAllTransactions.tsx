import React from "react";
import Box from "@mui/material/Box";
import {useSearchParams} from "react-router-dom";
import {Pagination, Stack} from "@mui/material";
import {UserTransactionsTable} from "../../Transactions/TransactionsTable";
import {
  useGetAccountAllTransactionCount,
  useGetAccountAllTransactionVersions,
} from "../../../api/hooks/useGetAccountAllTransactions";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {Statsig, useExperiment} from "statsig-react";

const LIMIT = 25;

function RenderPagination({
  currentPage,
  numPages,
}: {
  currentPage: number;
  numPages: number;
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleChange = (
    event: React.ChangeEvent<unknown>,
    newPageNum: number,
  ) => {
    searchParams.set("page", newPageNum.toString());
    setSearchParams(searchParams);

    // logging
    Statsig.logEvent("go_to_new_page", newPageNum, {
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
  const [searchParams, _setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1");
  const offset = (currentPage - 1) * countPerPage;

  const versions = useGetAccountAllTransactionVersions(
    address,
    countPerPage,
    offset,
  );

  return (
    <>
      <Stack spacing={2}>
        <Box sx={{width: "auto", overflowX: "auto"}}>
          <UserTransactionsTable versions={versions} address={address} />
        </Box>
        {numPages > 1 && (
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
  const txnCount = useGetAccountAllTransactionCount(address);
  const {config: paginationExperience} = useExperiment(
    "account_transactions_pagination",
  );

  if (txnCount === undefined) {
    return <EmptyTabContent />;
  }

  const countPerPage = paginationExperience.get("count_per_page", LIMIT);

  const numPages = Math.ceil(txnCount / countPerPage);

  return (
    <AccountAllTransactionsWithPagination
      address={address}
      numPages={numPages}
      countPerPage={countPerPage}
    />
  );
}
