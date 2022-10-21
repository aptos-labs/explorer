import React, {useEffect} from "react";
import Box from "@mui/material/Box";
import {useSearchParams} from "react-router-dom";
import {Pagination, PaginationItem, Stack} from "@mui/material";
import {UserTransactionsTable} from "../../Transactions/TransactionsTable";
import {useGetAccountAllTransactionVersions} from "../../../api/hooks/useGetAccountAllTransactions";

const LIMIT = 5;

function RenderPagination({
  currentPage,
  numPages,
  disableNext,
}: {
  currentPage: number;
  numPages: number;
  disableNext: boolean;
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const goToPage = (newPageNum: number) => {
    searchParams.set("page", newPageNum.toString());
    setSearchParams(searchParams);

    const numPages = parseInt(searchParams.get("numPages") ?? "1");
    if (newPageNum > numPages) {
      searchParams.set("numPages", newPageNum.toString());
      setSearchParams(searchParams);
    }
  };

  const handleChange = (
    event: React.ChangeEvent<unknown>,
    newPageNum: number,
  ) => {
    goToPage(newPageNum);
  };

  const handleNextPage = () => {
    goToPage(currentPage + 1);
  };

  return (
    <Stack direction="row" alignItems="end">
      <Pagination
        sx={{mt: 3}}
        count={numPages}
        variant="outlined"
        shape="rounded"
        hideNextButton
        page={currentPage}
        siblingCount={4}
        boundaryCount={0}
        onChange={handleChange}
      />
      <Box onClick={disableNext ? () => {} : handleNextPage}>
        <PaginationItem
          variant="outlined"
          shape="rounded"
          type="next"
          disabled={disableNext}
        />
      </Box>
    </Stack>
  );
}

type AccountAllTransactionsProps = {
  address: string;
};

export default function AccountAllTransactions({
  address,
}: AccountAllTransactionsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1");
  const numPages = parseInt(searchParams.get("numPages") ?? "1");
  const maxNumPages = parseInt(searchParams.get("maxNumPages") ?? "");
  const offset = (currentPage - 1) * LIMIT;

  const {loading, versions} = useGetAccountAllTransactionVersions(
    address,
    LIMIT,
    offset,
  );

  useEffect(() => {
    if (!loading && versions.length < LIMIT) {
      if (versions.length === 0) {
        searchParams.set("page", (currentPage - 1).toString());
        searchParams.set("numPages", (currentPage - 1).toString());
        searchParams.set("maxNumPages", (currentPage - 1).toString());
        setSearchParams(searchParams);
      } else {
        searchParams.set("maxNumPages", currentPage.toString());
        setSearchParams(searchParams);
      }
    }
  }, [loading, versions.length]);

  const disableNext = numPages === maxNumPages;

  return (
    <>
      <Stack spacing={2}>
        <Box sx={{width: "auto", overflowX: "auto"}}>
          <UserTransactionsTable versions={versions} />
        </Box>
        <Box sx={{display: "flex", justifyContent: "center"}}>
          <RenderPagination
            currentPage={currentPage}
            numPages={numPages}
            disableNext={disableNext}
          />
        </Box>
      </Stack>
    </>
  );
}
