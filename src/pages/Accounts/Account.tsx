import {Account, AccountResource, MoveModule,} from "../../api_client";
import {ResponseError, ResponseErrorType} from "../../api/client";
import {useParams} from "react-router-dom";
import {Alert, Stack} from "@mui/material";
import React from "react";
import {useGlobalState} from "../../GlobalState";
import Grid from "@mui/material/Grid";
import {SafeRequestComponent} from "../../components/RequestComponent";
import {getAccount, getAccountModules, getAccountResources} from "../../api";
import {renderRow, renderSection} from "../Transactions/helpers";
import Divider from "@mui/material/Divider";
import {renderDebug} from "../utils";

function RenderHeader(children: React.ReactNode, title?: string) {
  let {address} = useParams();
  return renderSection(children, title || `Account ${address}`);
}

function RenderError({error, address, title}: { error: ResponseError, address: string, title?: string }) {
  if (error.type == ResponseErrorType.NOT_FOUND)
    return RenderHeader(
      <Alert severity="error">
        {error.message}
        Could not find an Account with address {address}
      </Alert>, title);
  else
    return RenderHeader(
      <Alert severity="error">
        Unknown error ({error.type}) fetching an Account with address {address}:<br/>
        {renderDebug(error.message)}
        <br/>
        Try again later
      </Alert>, title
    );
}

function RenderAccount({data, error}: { data?: Account, error?: ResponseError }) {
  let {address} = useParams();

  if (error && error.type !== ResponseErrorType.NOT_FOUND)
    return (<RenderError address={address as string} error={error}/>);

  return renderSection(
    <>
      <Stack direction="column"
             spacing={2}
             divider={<Divider orientation="horizontal"/>}
      >
        {(!data || error && error.type !== ResponseErrorType.NOT_FOUND) && <span>None</span>}
        {data && <>
          {renderRow("Sequence Number:", data.sequenceNumber)}
          {renderRow("Authentication Key:", data.authenticationKey)}
        </>}

      </Stack>
    </>, `Account ${address}`);
}

function RenderAccountResources({data, error}: { data?: AccountResource[], error?: ResponseError }) {
  let {address} = useParams();
  const title = "Account Resources";

  if (error)
    return (<RenderError address={address as string} title={title} error={error}/>);

  if (!data)
    return RenderHeader(
      <Alert severity="error">
        Got an empty response fetching Account with address {address}<br/>
        Try again later
      </Alert>, title
    );

  return renderSection(
    <Stack direction="column"
           spacing={2}
           divider={<Divider orientation="horizontal"/>}
    >
      {(data.length === 0) && <span>None</span>}
      {data.map((resource, i) => (
        <span key={i}>
          {renderRow("Type:", resource.type)}
          {renderRow("Data:", renderDebug(resource.data))}
        </span>
      ))}
    </Stack>
    , title);
}

function RenderAccountModules({data, error}: { data?: MoveModule[], error?: ResponseError }) {
  let {address} = useParams();
  const title = "Account Modules";

  if (error)
    return (<RenderError address={address as string} title={title} error={error}/>);

  if (!data)
    return RenderHeader(
      <Alert severity="error">
        Got an empty response fetching Account with address {address}<br/>
        Try again later
      </Alert>, title
    );

  return renderSection(
    <Stack direction="column"
           spacing={2}
           divider={<Divider orientation="horizontal"/>}
    >
      {(data.length === 0) && <span>None</span>}
      {data.map((module, i) => (
        <span key={i}>
          {renderRow("Bytecode:", module.bytecode)}
          {renderRow("ABI:", renderDebug(module.abi))}
        </span>
      ))}
    </Stack>
    , "Account Modules");
}

export default function AccountPage() {
  const [state, _] = useGlobalState();
  let {address} = useParams();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>

        <SafeRequestComponent
          request={(network: string) => getAccount({address: address as string}, network)}
          args={[state.network_value]}
        >
          <RenderAccount/>
        </SafeRequestComponent>

        <SafeRequestComponent
          request={(network: string) => getAccountResources({address: address as string}, network)}
          args={[state.network_value]}
        >
          <RenderAccountResources/>
        </SafeRequestComponent>

        <SafeRequestComponent
          request={(network: string) => getAccountModules({address: address as string}, network)}
          args={[state.network_value]}
        >
          <RenderAccountModules/>
        </SafeRequestComponent>

      </Grid>
    </Grid>
  );
}