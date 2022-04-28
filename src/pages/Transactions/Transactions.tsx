import React from "react";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Title from "../../components/Title";
import {SafeRequestComponent} from "../../components/RequestComponent";
import {
  LedgerInfo,
  OnChainTransaction,
  UserTransaction,
} from "../../api_client/";
import {getLedgerInfo, getTransactions} from "../../api";
import {useGlobalState} from "../../GlobalState";
import {
  renderGas,
  renderSuccess,
  renderTimestamp,
  renderTransactionType,
} from "./helpers";
import Box from "@mui/material/Box";
import * as RRD from "react-router-dom";
import {useSearchParams} from "react-router-dom";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import {Pagination, PaginationItem, Stack} from "@mui/material";
import {ErrorBoundary} from "@sentry/react";

const PREVIEW_LIMIT = 10;
const MAIN_LIMIT = 20;

function renderTimestampTransaction(transaction: OnChainTransaction) {
  if (transaction.type == "genesis_transaction") {
    return null;
  }
  return (
    <ErrorBoundary>
      {renderTimestamp((transaction as UserTransaction).timestamp)}
    </ErrorBoundary>
  );
}

function RenderTransactionRows({data}: {data: Array<OnChainTransaction>}) {
  return (
    <TableBody>
      {data.map((transaction) => (
        <TableRow key={transaction.accumulatorRootHash}>
          <TableCell>
            <ErrorBoundary>
              {renderTransactionType(transaction.type)}
            </ErrorBoundary>
          </TableCell>
          <TableCell>
            <RRD.Link to={`/txn/${transaction.version}`}>
              {transaction.version}
            </RRD.Link>
          </TableCell>
          <TableCell>
            <ErrorBoundary>{renderGas(transaction.gasUsed)}</ErrorBoundary>
          </TableCell>
          <TableCell>
            {renderSuccess(transaction.success)}
            <Box component={"span"} sx={{display: "block"}}>
              {transaction.vmStatus}
            </Box>
          </TableCell>
          <TableCell>{renderTimestampTransaction(transaction)}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
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
  const numPages = Math.ceil(maxVersion / limit);
  const progress = 1 - (start + limit - 1) / maxVersion;
  const currentPage = 1 + Math.floor(progress * numPages);

  return (
    <Pagination
      count={numPages}
      variant="outlined"
      showFirstButton
      showLastButton
      page={currentPage}
      siblingCount={4}
      boundaryCount={0}
      shape="rounded"
      renderItem={(item) => {
        const delta = (currentPage - item.page) * limit;
        const newStart = Math.max(
          0,
          Math.min(maxStart(maxVersion, limit), start + delta),
        );

        return (
          <PaginationItem
            component={RRD.Link}
            to={`/transactions?start=${newStart}`}
            {...item}
          />
        );
      }}
    />
  );
}

function RenderTransactionContent({data}: {data?: Array<OnChainTransaction>}) {
  if (!data) {
    // TODO: error handling!
    return null;
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Type</TableCell>
          <TableCell>Version</TableCell>
          <TableCell>Gas Used</TableCell>
          <TableCell>Success</TableCell>
          <TableCell>Time</TableCell>
        </TableRow>
      </TableHead>
      <RenderTransactionRows data={data} />
    </Table>
  );
}

export function TransactionsPreview() {
  const [state, _] = useGlobalState();
  const limit = PREVIEW_LIMIT;
  return (
    <>
      <Title>Recent Transactions</Title>
      <Stack spacing={3}>
        <SafeRequestComponent
          request={(network: string) => getTransactions({limit}, network)}
          args={[state.network_value]}
        >
          <RenderTransactionContent />
        </SafeRequestComponent>
        <Link
          component={RRD.Link}
          to="/transactions"
          color="primary"
          sx={{mt: 3}}
        >
          See more Transactions
        </Link>
      </Stack>
    </>
  );
}

function TransactionsPageInner({data}: {data?: LedgerInfo}) {
  if (!data) {
    // TODO: handle errors
    return <>No ledger info</>;
  }

  const maxVersion = parseInt(data.ledgerVersion);
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

  return (
    <>
      <Title>Transactions</Title>
      <Stack spacing={3}>
        <SafeRequestComponent
          request={(network: string) =>
            getTransactions({start, limit}, network)
          }
          args={[state.network_value]}
        >
          <RenderTransactionContent />
        </SafeRequestComponent>
        <RenderPagination
          {...{
            start,
            limit,
            maxVersion,
          }}
        />
      </Stack>
    </>
  );
}

export function TransactionsPage() {
  const [state, _] = useGlobalState();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{p: 2, display: "flex", flexDirection: "column", mb: 3}}>
          <SafeRequestComponent
            request={(network: string) => getLedgerInfo(network)}
            args={[state.network_value]}
            refresh_interval_ms={10000}
          >
            <TransactionsPageInner />
          </SafeRequestComponent>
        </Paper>
      </Grid>
    </Grid>
  );
}
