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

const LIMIT = 20;

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
};

export function AccountAllTransactionsWithPagination({
  address,
  numPages,
}: AccountAllTransactionsWithPaginationProps) {
  const [searchParams, _setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1");
  const offset = (currentPage - 1) * LIMIT;

  const versions = useGetAccountAllTransactionVersions(address, LIMIT, offset);

  return (
    <>
      <Stack spacing={2}>
        <Box sx={{width: "auto", overflowX: "auto"}}>
          <UserTransactionsTable versions={versions} />
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

  if (txnCount === undefined) {
    return <EmptyTabContent />;
  }

  const numPages = Math.ceil(txnCount / LIMIT);

  return (
    <AccountAllTransactionsWithPagination
      address={address}
      numPages={numPages}
    />
  );
}
