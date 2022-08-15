import React from "react";
import {useQuery, UseQueryResult} from "react-query";
import Button from "@mui/material/Button";
import {Types} from "aptos";
import {getLedgerInfo, getTransactions} from "../../api";
import {useGlobalState} from "../../GlobalState";
import Box from "@mui/material/Box";
import * as RRD from "react-router-dom";
import {useSearchParams} from "react-router-dom";
import Grid from "@mui/material/Grid";
import {Pagination, PaginationItem, Stack} from "@mui/material";
import {TransactionsTable} from "../../components/TransactionsTable";
import HeadingSub from "../../components/HeadingSub";
import HeaderSearch from "../layout/Search";
import Typography from "@mui/material/Typography";
import DividerHero from "../../components/DividerHero";

const PREVIEW_LIMIT = 10;
const MAIN_LIMIT = 20;

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
  const numPages = Math.ceil(maxVersion / limit);
  const progress = 1 - (start + limit - 1) / maxVersion;
  const currentPage = 1 + Math.floor(progress * numPages);

  return (
    <Pagination
      sx={{mt: 6}}
      count={numPages}
      variant="outlined"
      showFirstButton
      showLastButton
      page={currentPage}
      siblingCount={4}
      boundaryCount={0}
      shape="rounded"
      renderItem={(item) => {
        const delta = (currentPage - (item.page ? item.page : 0)) * limit;
        const newStart = Math.max(
          0,
          Math.min(maxStart(maxVersion, limit), start + delta),
        );
        const rel = ({next: "next", previous: "prev"} as any)[item.type];

        return (
          <PaginationItem
            component={RRD.Link}
            to={`/transactions?start=${newStart}`}
            sx={{mb: 1}}
            rel={rel}
            {...item}
          />
        );
      }}
    />
  );
}

function RenderTransactionContent({
  data,
}: UseQueryResult<Array<Types.Transaction>>) {
  if (!data) {
    // TODO: error handling!
    return null;
  }

  return <TransactionsTable transactions={data} />;
}

export function TransactionsPreview() {
  const [state, _] = useGlobalState();
  const limit = PREVIEW_LIMIT;
  const result = useQuery(["transactions", {limit}, state.network_value], () =>
    getTransactions({limit}, state.network_value),
  );

  return (
    <>
      <Stack spacing={2}>
        <Box sx={{width: "auto", overflowX: "auto"}}>
          <RenderTransactionContent {...result} />
        </Box>

        <Box sx={{display: "flex", justifyContent: "center"}}>
          <Button
            component={RRD.Link}
            to="/transactions"
            variant="primary"
            sx={{margin: "0 auto", mt: 6}}
          >
            View all Transactions
          </Button>
        </Box>
      </Stack>
    </>
  );
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

  const limit = MAIN_LIMIT;
  const [state, _setState] = useGlobalState();
  const [searchParams, _setSearchParams] = useSearchParams();

  let start = maxStart(maxVersion, limit);
  let startParam = searchParams.get("start");
  if (startParam) {
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
        <Typography variant="h4" component="h2">
          Transactions
        </Typography>
        <Box sx={{width: "auto", overflowX: "auto"}}>
          <RenderTransactionContent {...result} />
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

export function TransactionsPage() {
  const [state, _] = useGlobalState();

  const result = useQuery(
    ["ledgerInfo", state.network_value],
    () => getLedgerInfo(state.network_value),
    {
      refetchInterval: 10000,
    },
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <HeadingSub>Network</HeadingSub>
        <Typography variant="h1" component="h1" gutterBottom>
          Aptos Explorer
        </Typography>
        <DividerHero />
        <HeaderSearch />
        <TransactionsPageInner {...result} />
      </Grid>
    </Grid>
  );
}
