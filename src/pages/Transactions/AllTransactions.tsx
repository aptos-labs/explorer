import React from "react";
import {useQuery, UseQueryResult} from "react-query";
import {Types} from "aptos";
import {getLedgerInfo, getTransactions} from "../../api";
import {useGlobalState} from "../../GlobalState";
import Box from "@mui/material/Box";
import {useSearchParams} from "react-router-dom";
import {Pagination, Stack} from "@mui/material";
import TransactionsTable from "./TransactionsTable";

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
    event: React.ChangeEvent<unknown>,
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

function TransactionContent({data}: UseQueryResult<Array<Types.Transaction>>) {
  if (!data) {
    // TODO: error handling!
    return null;
  }

  return <TransactionsTable transactions={data} />;
}

function TransactionsPageInner({data}: UseQueryResult<Types.IndexResponse>) {
  if (!data) {
    // TODO: handle errors
    return <>No ledger info</>;
  }

  const maxVersion = parseInt(data.ledger_version);
  if (!maxVersion) {
    // TODO: handle errors
    return <>No maxVersion</>;
  }

  const limit = LIMIT;
  const [state, _setState] = useGlobalState();
  const [searchParams, _setSearchParams] = useSearchParams();

  let start = maxStart(maxVersion, limit);
  let startParam = searchParams.get("start");
  if (startParam !== null) {
    start = parseInt(startParam);
  }

  const result = useQuery(
    ["transactions", {start, limit}, state.network_value],
    () => getTransactions({start, limit}, state.network_value),
    {keepPreviousData: true},
  );

  return (
    <>
      <Stack spacing={2}>
        <Box sx={{width: "auto", overflowX: "auto"}}>
          <TransactionContent {...result} />
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
    </>
  );
}

export default function AllTransactions() {
  const [state, _] = useGlobalState();

  const result = useQuery(
    ["ledgerInfo", state.network_value],
    () => getLedgerInfo(state.network_value),
    {
      refetchInterval: 10000,
    },
  );

  return <TransactionsPageInner {...result} />;
}
