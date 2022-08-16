import {Types} from "aptos";
import {ResponseError, ResponseErrorType} from "../../api/client";
import {useParams} from "react-router-dom";
import {useQuery, UseQueryResult} from "react-query";
import {Alert, Stack} from "@mui/material";
import React from "react";
import {useGlobalState} from "../../GlobalState";
import Grid from "@mui/material/Grid";
import {
  getAccount,
  getAccountModules,
  getAccountResources,
  getAccountTransactions,
} from "../../api";
import {renderRow, renderSection} from "../Transactions/helpers";
import Divider from "@mui/material/Divider";
import {renderDebug} from "../utils";
import Box from "@mui/material/Box";
import {useTheme} from "@mui/material";
import {TransactionsTable} from "../../components/TransactionsTable";
import DividerHero from "../../components/DividerHero";
import Typography from "@mui/material/Typography";
import HeaderSearch from "../layout/Search";

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
}: UseQueryResult<Types.AccountData, ResponseError>) {
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
}: UseQueryResult<Array<Types.MoveResource>, ResponseError>) {
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
}: UseQueryResult<Array<Types.MoveModuleBytecode>, ResponseError>) {
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
}: UseQueryResult<Array<Types.Transaction>, ResponseError>) {
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
      // prettier-ignore
      <Alert severity="error">
        Got an empty response fetching Account Transactions with address {address}
        <br />
        Try again later
      </Alert>,
      title,
    );
  }

  const content =
    data.length === 0 ? (
      <span>None</span>
    ) : (
      <TransactionsTable
        transactions={data}
        columns={["status", "timestamp", "version", "hash", "gas"]}
      />
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

  const accountResult = useQuery<Types.AccountData, ResponseError>(
    ["account", {address}, state.network_value],
    () => getAccount({address}, state.network_value),
  );
  const accountResourcesResult = useQuery<
    Array<Types.MoveResource>,
    ResponseError
  >(["accountResources", {address}, state.network_value], () =>
    getAccountResources({address}, state.network_value),
  );
  const accountModulesResult = useQuery<
    Array<Types.MoveModuleBytecode>,
    ResponseError
  >(["accountModules", {address}, state.network_value], () =>
    getAccountModules({address}, state.network_value),
  );
  const accountTransactionsResult = useQuery<
    Array<Types.Transaction>,
    ResponseError
  >(["accountTransactions", {address}, state.network_value], () =>
    getAccountTransactions({address}, state.network_value),
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography
          color="primary"
          variant="subtitle2"
          component="span"
          sx={{mb: 2}}
        >
          Network
        </Typography>
        <Typography variant="h1" component="h1" gutterBottom>
          Aptos Explorer
        </Typography>
        <DividerHero />
        <HeaderSearch />
        <RenderAccount {...accountResult} />
        <RenderAccountResources {...accountResourcesResult} />
        <RenderAccountModules {...accountModulesResult} />
        <RenderAccountTransactions {...accountTransactionsResult} />
      </Grid>
    </Grid>
  );
}
