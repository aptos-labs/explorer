import {ResponseError, ResponseErrorType} from "../../api/client";
import {useParams} from "react-router-dom";
import {useQuery, UseQueryResult} from "react-query";
import {Alert, Stack} from "@mui/material";
import React from "react";
import {useGlobalState} from "../../GlobalState";
import Grid from "@mui/material/Grid";
import { getAccount, getAccountModules, getAccountResources, getAccountTransactions } from "../../api";
import { renderGas, renderRow, renderSection, renderSuccess, renderTransactionType } from "../Transactions/helpers";
import Divider from "@mui/material/Divider";
import {renderDebug} from "../utils";
import Box from "@mui/material/Box";
import {useTheme} from "@mui/material";
import { renderTimestampTransaction } from "../Transactions/Transactions";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import TableBody from "@mui/material/TableBody";
import { ErrorBoundary } from "@sentry/react";
import Link from "@mui/material/Link";
import * as RRD from "react-router-dom";
import { Types } from "aptos";

function RenderHeader(children: React.ReactNode, title?: string) {
  let {address} = useParams();
  return renderSection(children, title || `Account ${address}`);
}

function RenderError({
  error,
  address,
  title,
}: {
  error: ResponseError;
  address: string;
  title?: string;
}) {
  if (error.type == ResponseErrorType.NOT_FOUND)
    return RenderHeader(
      <Alert severity="error">
        {error.message}
        Could not find an Account with address {address}
      </Alert>,
      title,
    );
  else
    return RenderHeader(
      <Alert severity="error">
        Unknown error ({error.type}) fetching an Account with address {address}:
        <br />
        {renderDebug(error.message)}
        <br />
        Try again later
      </Alert>,
      title,
    );
}

function RenderAccount({
  isLoading,
  data,
  error,
}: UseQueryResult<Types.Account, ResponseError>) {
  const {address} = useParams();
  const theme = useTheme();

  if (isLoading) {
    return null;
  }

  if (error && error.type !== ResponseErrorType.NOT_FOUND) {
    return <RenderError address={address as string} error={error} />;
  }

  return renderSection(
    <>
      <Stack
        direction="column"
        spacing={2}
        divider={<Divider variant="dotted" orientation="horizontal" />}
      >
        {(!data || (error && error.type !== ResponseErrorType.NOT_FOUND)) && (
          <span>None</span>
        )}
        {data && (
          <>
            {renderRow("Sequence Number:", data.sequence_number)}
            {renderRow("Authentication Key:", data.authentication_key)}
          </>
        )}
      </Stack>
    </>,
    <Stack direction="column" spacing={2}>
      <Box component="span" sx={{whiteSpace: "nowrap"}}>
        Account
      </Box>
      <Box
        component="span"
        sx={{
          fontFamily: theme.typography.fontFamily,
          fontWeight: theme.typography.fontWeightLight,
          overflowWrap: "break-word",
          fontSize: "1.5rem",
          display: "block",
        }}
      >
        {address}
      </Box>
    </Stack>,
  );
}

function RenderAccountResources({
  isLoading,
  data,
  error,
}: UseQueryResult<Array<Types.AccountResource>, ResponseError>) {
  let {address} = useParams();
  const title = "Account Resources";

  if (typeof address !== "string" || isLoading) {
    return null;
  }

  if (error) {
    return <RenderError address={address} title={title} error={error} />;
  }

  if (!data) {
    return RenderHeader(
      <Alert severity="error">
        Got an empty response fetching Account with address {address}
        <br />
        Try again later
      </Alert>,
      title,
    );
  }

  return renderSection(
    <Stack
      direction="column"
      spacing={3}
      divider={<Divider variant="dotted" orientation="horizontal" />}
    >
      {data.length === 0 && <span>None</span>}
      {data.map((resource, i) => (
        <Stack direction="column" key={i} spacing={3}>
          {renderRow("Type:", resource.type)}
          {renderRow("Data:", renderDebug(resource.data))}
        </Stack>
      ))}
    </Stack>,
    title,
  );
}

function RenderAccountModules({
  isLoading,
  data,
  error,
}: UseQueryResult<Array<Types.MoveModule>, ResponseError>) {
  const {address} = useParams();
  const title = "Account Modules";

  if (typeof address !== "string" || isLoading) {
    return null;
  }

  if (error) {
    return <RenderError address={address} title={title} error={error} />;
  }

  if (!data) {
    return RenderHeader(
      <Alert severity="error">
        Got an empty response fetching Account with address {address}
        <br />
        Try again later
      </Alert>,
      title,
    );
  }

  return renderSection(
    <Stack
      direction="column"
      spacing={2}
      divider={<Divider variant="dotted" orientation="horizontal" />}
    >
      {data.length === 0 && <span>None</span>}
      {data.map((module, i) => (
        <span key={i}>
          {renderRow("Bytecode:", module.bytecode)}
          {renderRow("ABI:", renderDebug(module.abi))}
        </span>
      ))}
    </Stack>,
    "Account Modules",
  );
}

function RenderAccountTransactions({
  isLoading,
  data,
  error,
}: UseQueryResult<Array<Types.OnChainTransaction>, ResponseError>) {
  const {address} = useParams();
  const title = "Account Transactions";

  if (typeof address !== "string" || isLoading) {
    return null;
  }

  if (error) {
    return <RenderError address={address} title={title} error={error} />;
  }

  if (!data) {
    return RenderHeader(
      <Alert severity="error">
        Got an empty response fetching Account Transactions with address {address}
        <br />
        Try again later
      </Alert>,
      title,
    );
  }
  const theme = useTheme();
  const tableCellBackgroundColor = theme.palette.background.paper;

  const content = (data.length === 0) ?
    (<span>None</span>) :
    (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                textAlign: "left",
                width: "2%",
                background: `${tableCellBackgroundColor}`,
                borderRadius: "8px 0 0 8px",
              }}
            ></TableCell>
            <TableCell
              sx={{ textAlign: "left", background: `${tableCellBackgroundColor}` }}
            >
              <Typography variant="subtitle1">Timestamp</Typography>
            </TableCell>
            <TableCell
              sx={{ textAlign: "left", background: `${tableCellBackgroundColor}` }}
            >
              <Typography variant="subtitle1">Version</Typography>
            </TableCell>
            <TableCell
              sx={{ textAlign: "left", background: `${tableCellBackgroundColor}` }}
            >
              <Typography variant="subtitle1">Hash</Typography>
            </TableCell>
            <TableCell
              sx={{
                textAlign: "right",
                background: `${tableCellBackgroundColor}`,
                borderRadius: "0 8px 8px 0",
              }}
            >
              <Typography variant="subtitle1">Gas Used</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((transaction) => (
            <TableRow key={transaction.accumulator_root_hash} hover>
              <TableCell sx={{ textAlign: "left" }}>
                {renderSuccess(transaction.success)}
                <Box component={"span"} sx={{ display: "inline-block" }}></Box>
              </TableCell>
              <TableCell sx={{ textAlign: "left" }}>
                {renderTimestampTransaction(transaction)}
              </TableCell>
              <TableCell sx={{ textAlign: "left" }}>
                <Link
                  component={RRD.Link}
                  to={`/txn/${transaction.version}`}
                  color="primary"
                >
                  {transaction.version}
                </Link>
              </TableCell>
              <TableCell>
                <ErrorBoundary>
                  {transaction.hash}
                </ErrorBoundary>
              </TableCell>
              <TableCell sx={{ textAlign: "right" }}>
                <ErrorBoundary>{renderGas(transaction.gas_used)}</ErrorBoundary>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );

  return renderSection(
    <Stack
      direction="column"
      spacing={2}
      divider={<Divider variant="dotted" orientation="horizontal" />}
    >
      {content}
    </Stack>,
    "Account Transactions",
  );
}


export default function AccountPage() {
  const [state, _] = useGlobalState();
  const {address} = useParams();

  if (typeof address !== "string") {
    return null;
  }

  const accountResult = useQuery<Types.Account, ResponseError>(
    ["account", {address}, state.network_value],
    () => getAccount({address}, state.network_value),
  );
  const accountResourcesResult = useQuery<
    Array<Types.AccountResource>,
    ResponseError
  >(["accountResources", {address}, state.network_value], () =>
    getAccountResources({address}, state.network_value),
  );
  const accountModulesResult = useQuery<Array<Types.MoveModule>, ResponseError>(
    ["accountModules", {address}, state.network_value],
    () => getAccountModules({address}, state.network_value),
  );
  const accountTransactionsResult = useQuery<Array<OnChainTransaction>, ResponseError>(
    ["accountTransactions", {address}, state.network_value],
    () => getAccountTransactions({address}, state.network_value),
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <RenderAccount {...accountResult} />
        <RenderAccountResources {...accountResourcesResult} />
        <RenderAccountModules {...accountModulesResult} />
        <RenderAccountTransactions {...accountTransactionsResult} />
      </Grid>
    </Grid>
  );
}
