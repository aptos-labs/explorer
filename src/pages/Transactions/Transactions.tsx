import React from "react";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Title from "../../components/Title";
import Button from '@mui/material/Button';
import { SafeRequestComponent } from "../../components/RequestComponent";
import {
  LedgerInfo,
  OnChainTransaction, UserTransaction,
} from "../../api_client/";
import { getLedgerInfo, getTransactions } from "../../api";
import { useGlobalState } from "../../GlobalState";
import { renderGas, renderSuccess, renderTimestamp, renderTransactionType } from "./helpers";
import Box from "@mui/material/Box";
import * as RRD from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import { Pagination, PaginationItem, Stack } from "@mui/material";
import { ErrorBoundary } from "@sentry/react";
import Typography from "@mui/material/Typography";
import { useTheme } from '@mui/material';


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

function RenderTransactionRows({ data }: { data: Array<OnChainTransaction> }) {

  const theme = useTheme();

  return (
    <TableBody>
      {
        data.map((transaction) => (
          <TableRow key={transaction.accumulatorRootHash} hover>
            <TableCell sx={{ textAlign: 'left' }}>
              {renderSuccess(transaction.success)}
              <Box
                component={"span"}
                sx={{ display: "inline-block" }}
              >
                {/* {transaction.vmStatus} */}
              </Box>
            </TableCell>
            <TableCell sx={{ textAlign: 'left' }}>{renderTimestampTransaction(transaction)}</TableCell>
            <TableCell><ErrorBoundary>{renderTransactionType(transaction.type)}</ErrorBoundary></TableCell>
            <TableCell sx={{ textAlign: 'right' }}>
              <Link component={RRD.Link} to={`/txn/${transaction.version}`} color="primary">{transaction.version}</Link>
            </TableCell>
            <TableCell sx={{ textAlign: 'right' }}><ErrorBoundary>{renderGas(transaction.gasUsed)}</ErrorBoundary></TableCell>
          </TableRow>
        ))
      }
    </TableBody>
  );
}

type PageSetter = React.Dispatch<React.SetStateAction<number>>;
type PageSetterProps = { setPage: PageSetter }

function RenderPagination({
  currentPage,
  setPage,
  numPages
}: { numPages: number } & CurrentPageProps & PageSetterProps) {

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Pagination
      sx={{ mt: 6 }}
      count={numPages}
      variant="outlined"
      showFirstButton
      showLastButton
      page={currentPage}
      siblingCount={4}
      boundaryCount={0}
      onChange={handleChange}
      shape="rounded"
      renderItem={(item) => (
        <PaginationItem
          component={RRD.Link}
          to={`/transactions?page=${item.page}`}
          {...item}
          sx={{ mb: 1 }}
        />
      )}
    />
  );
}

type CurrentPageProps = {
  currentPage: number;
}

function RenderTransactionContent({
  data,
}: { data?: Array<OnChainTransaction> }) {
  if (!data)
    // TODO: error handling!
    return null;

  const theme = useTheme();
  const tableCellBackgroundColor = theme.palette.background.paper;

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ textAlign: 'left', width: '2%', background: `${tableCellBackgroundColor}`, borderRadius: '8px 0 0 8px' }}></TableCell>
          <TableCell sx={{ textAlign: 'left', background: `${tableCellBackgroundColor}` }}><Typography variant="subtitle1">Timestamp ↓</Typography></TableCell>
          <TableCell sx={{ textAlign: 'left', background: `${tableCellBackgroundColor}` }}><Typography variant="subtitle1">Type ↓</Typography></TableCell>
          <TableCell sx={{ textAlign: 'right', background: `${tableCellBackgroundColor}` }}><Typography variant="subtitle1">Version ↓</Typography></TableCell>
          <TableCell sx={{ textAlign: 'right', background: `${tableCellBackgroundColor}`, borderRadius: '0 8px 8px 0' }}><Typography variant="subtitle1">Gas Used ↓</Typography></TableCell>
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

      <Stack spacing={2}>
        <Title>Latest Transactions</Title>
        <Box sx={{ width: 'auto', overflowX: 'auto' }}>
          <SafeRequestComponent
            request={(network: string) => getTransactions({ limit }, network)}
            args={[state.network_value]}
          >
            <RenderTransactionContent />
          </SafeRequestComponent>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            component={RRD.Link}
            to="/transactions"
            // color="primary"
            // size="large"
            variant="cta"
            sx={{ marginLeft: 'auto', mt: 6 }}
          >
            See more Transactions
          </Button>
        </Box>

      </Stack>

    </>
  );
}

function getCurrentPage(): number | null {
  let [searchParams, setSearchParams] = useSearchParams();
  // The latest version is always page 1, i.e:
  // maxVersion => page 1
  // version 0 => page maxVersion
  const rawPage = searchParams.get("page");
  if (rawPage) {
    const currentPage = parseInt(rawPage);
    if (currentPage)
      return currentPage;
  }

  return null;
}

function TransactionsPageInner({ data }: { data?: LedgerInfo }) {
  if (!data)
    // TODO: handle errors
    return (<>No ledger info</>);

  const maxVersion = parseInt(data.ledgerVersion);
  if (!maxVersion)
    // TODO: handle errors
    return (<>No maxVersion</>);

  const limit = MAIN_LIMIT;
  const [state, _] = useGlobalState();

  const numPages = Math.ceil(maxVersion / limit);
  const currentParamPage = getCurrentPage();

  const navigate = RRD.useNavigate();
  React.useEffect(() => {
    if (!currentParamPage) {
      navigate(`/transactions?page=${numPages}`);
    }
  });

  const currentPage = currentParamPage || numPages;
  const start = (currentPage - 1) * limit;

  const [page, setPage] = React.useState(currentPage);
  return (<>
    <Stack spacing={2}>
      <Title>All Transactions</Title>
      <Box sx={{ width: 'auto', overflowX: 'auto' }}>
        <SafeRequestComponent
          request={(network: string) => getTransactions({ start, limit }, network)}
          args={[state.network_value, page]}
        >
          <RenderTransactionContent />
        </SafeRequestComponent>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <RenderPagination {...{
          currentPage,
          setPage,
          numPages
        }} />
      </Box>

    </Stack>

  </>
  );
}

export function TransactionsPage() {
  const [state, _] = useGlobalState();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>

        <SafeRequestComponent
          request={(network: string) => getLedgerInfo(network)}
          args={[state.network_value]}
          refresh_interval_ms={10000}
        >
          <TransactionsPageInner />
        </SafeRequestComponent>


      </Grid>
    </Grid>
  )
    ;
}