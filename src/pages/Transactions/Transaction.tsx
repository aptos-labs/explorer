import React from "react";
import Title from "../../components/Title";
import {useParams} from "react-router-dom";
import { SafeRequestComponent } from "../../components/RequestComponent";
import {
  BlockMetadataTransaction,
  GenesisTransaction,
  OnChainTransaction,
  UserTransaction,
  PendingTransaction,
  Event,
  WriteSetPayload,
  WriteSet,
  DirectWriteSet,
  ScriptWriteSet,
  WriteSetChange,
  DeleteModule,
  DeleteResource,
  WriteModule, WriteResource
} from "../../api_client/";
import {getTransaction} from "../../api";
import {useGlobalState} from "../../GlobalState";
import {Alert, Stack} from "@mui/material";
import Grid from "@mui/material/Grid";
import {renderDebug} from "../utils";
import {ResponseError, ResponseErrorType} from "../../api/client";
import Divider from "@mui/material/Divider";
import {renderGas, renderSection, renderSuccess, renderTimestamp, renderTransactionType, renderRow} from "./helpers";
import {AccountLink} from "../Accounts/helpers";

function renderBlockMetadataTransaction(transaction: BlockMetadataTransaction) {
  return (<>
    {RenderHeader(
      <Stack direction="column"
             spacing={2}
             divider={<Divider orientation="horizontal"/>}
      >
        {renderRow("Type:", renderTransactionType(transaction.type))}
        {renderRow("ID:", transaction.id)}
        {renderRow("Version:", transaction.version)}
        {renderRow("Hash:", transaction.hash)}
        {renderRow("Round:", transaction.round)}
        {renderRow("Success:", renderSuccess(transaction.success))}
        {renderRow("Proposer:", transaction.proposer)}
        {renderRow("State Root Hash:", transaction.stateRootHash)}
        {renderRow("Event Root Hash:", transaction.eventRootHash)}
        {renderRow("Gas Used:", renderGas(transaction.gasUsed))}
        {renderRow("VM Status:", transaction.vmStatus)}
        {renderRow("Accumulator Root Hash:", transaction.accumulatorRootHash, false)}
        {renderRow("Timestamp:", renderTimestamp(transaction.timestamp))}
        {renderRow("Previous Block Votes:", renderDebug(transaction.previousBlockVotes))}
      </Stack>
    )}
  </>);
}


function RenderEvent(event: Event, i: number) {
  return (
    <Grid container key={i}>
      {renderRow("Sequence Number:", event.sequenceNumber)}
      {renderRow("Type:", event.type)}
      {renderRow("Key:", event.key)}
      {renderRow("Data:", renderDebug(event.data))}
    </Grid>
  );
}

function RenderEvents(events: Array<Event>) {
  return renderSection(
    <>
      <Stack direction="column"
             spacing={2}
             divider={<Divider orientation="horizontal"/>}
      >
        {events && events.map((event, i) => RenderEvent(event, i))}
      </Stack>
    </>
    , "Events"
  );
}

function RenderWriteSetChangeSpecific(change: WriteSetChange) {
  switch (change.type) {
    case "delete_module":
      return renderRow("Module:", renderDebug((change as DeleteModule).module));
    case "delete_resource":
      return renderRow("Resource:", renderDebug((change as DeleteResource).resource));
    case "write_module":
      return renderRow("Data:", renderDebug((change as WriteModule).data));
    case "write_resource":
      return renderRow("Data:", renderDebug((change as WriteResource).data));
    default:
      throw `UnknownWriteSet:${change.type}`;
  }

}

function RenderWriteSetChanges(changes: Array<WriteSetChange>) {
  return renderSection(
    <>
      <Stack direction="column"
             spacing={2}
             divider={<Divider orientation="horizontal"/>}
      >
        {changes && changes.map((change, i) => {
          return (
            <Grid container key={i}>
              {renderRow("Type:", change.type)}
              {renderRow("Address:", change.address)}
              {RenderWriteSetChangeSpecific(change)}
            </Grid>

          );
        })}
      </Stack>
    </>
    , "WriteSet Changes"
  );
}

function RenderDirectWriteSet(writeset: DirectWriteSet, render_events: boolean = false) {
  return (
    <>
      {RenderWriteSetChanges(writeset.changes)}
      {render_events && RenderEvents(writeset.events)}
    </>
  );
}

function RenderScriptWriteSet(writeset: ScriptWriteSet) {
  return (
    <Grid container>
      {renderRow("Type:", writeset.type)}
      {renderRow("Execute As:", writeset.executeAs)}
      {renderRow("Script:", renderDebug(writeset.script))}
    </Grid>
  );
}

function RenderWriteSet(writeset: WriteSet) {
  let inner = null;
  switch (writeset.type) {
    case "direct_write_set":
      inner = RenderDirectWriteSet(writeset as DirectWriteSet);
      break;
    case "script_write_set":
      inner = RenderScriptWriteSet(writeset as ScriptWriteSet);
      break;
    default:
      throw `Unknown:${writeset.type}`;
  }

  return (
    <>
      <Title sx={{pt: 2}}>WriteSet</Title>
      <Stack direction="column"
             spacing={2}
             divider={<Divider orientation="horizontal"/>}
      >
        {renderRow("Type:", writeset.type)}
        {inner}
      </Stack>
    </>
  );

}

function RenderPayload(payload: WriteSetPayload) {
  return renderSection(
    <>
      <Stack direction="column"
             spacing={2}
      >
        {renderRow("Type", payload.type)}
        {RenderWriteSet(payload.writeSet)}
      </Stack>
    </>
    , "Payload"
  );
}

function renderGenesisTransaction(transaction: GenesisTransaction) {
  return (<>
    {RenderHeader(
      <Stack direction="column"
             spacing={2}
             divider={<Divider orientation="horizontal"/>}
      >
        {renderRow("Type:", renderTransactionType(transaction.type))}
        {renderRow("Version:", transaction.version)}
        {renderRow("Hash:", transaction.hash)}
        {renderRow("Success:", renderSuccess(transaction.success))}
        {renderRow("State Root Hash:", transaction.stateRootHash)}
        {renderRow("Event Root Hash:", transaction.eventRootHash)}
        {renderRow("Gas Used:", renderGas(transaction.gasUsed))}
        {renderRow("VM Status:", transaction.vmStatus)}
        {renderRow("Accumulator Root Hash:", transaction.accumulatorRootHash, false)}
      </Stack>
    )}
    {RenderEvents(transaction.events)}
    {RenderPayload(transaction.payload)}
  </>);
}

function renderUserTransaction(transaction: UserTransaction) {
  return (<>
    {RenderHeader(
      <Stack direction="column"
             spacing={2}
             divider={<Divider orientation="horizontal"/>}
      >
        {renderRow("Type:", renderTransactionType(transaction.type))}
        {renderRow("Sender:", <AccountLink hideAccount address={transaction.sender} color="auto"/>)}
        {renderRow("Sequence Number:", transaction.sequenceNumber)}
        {renderRow("Expiration Timestamp", renderTimestamp(transaction.expirationTimestampSecs))}
        {renderRow("Version:", transaction.version)}
        {renderRow("Hash:", transaction.hash)}
        {renderRow("Success:", renderSuccess(transaction.success))}
        {renderRow("State Root Hash:", transaction.stateRootHash)}
        {renderRow("Event Root Hash:", transaction.eventRootHash)}
        {renderRow("Gas Used:", renderGas(transaction.gasUsed))}
        {renderRow("Max Gas:", renderGas(transaction.maxGasAmount))}
        {renderRow("Gas Unit Price:", renderGas(transaction.gasUnitPrice))}
        {renderRow("Gas Currency:", transaction.gasCurrencyCode)}
        {renderRow("VM Status:", transaction.vmStatus)}
        {renderRow("Signature:", renderDebug(transaction.signature))}
        {renderRow("Accumulator Root Hash:", transaction.accumulatorRootHash, false)}
        {renderRow("Timestamp:", renderTimestamp(transaction.timestamp))}
      </Stack>)}
    {RenderEvents(transaction.events)}
    {renderSection(
      <>
        <Stack direction="column"
               spacing={2}
        >
          <Divider orientation="horizontal"/>
          {renderDebug(transaction.payload)}
        </Stack>
      </>
      , "Payload"
    )}
  </>);
}


function renderPendingTransaction(transaction: PendingTransaction) {
  return (<>
    {RenderHeader(
      <Stack direction="column"
             spacing={2}
             divider={<Divider orientation="horizontal"/>}
      >
        {renderRow("Type:", renderTransactionType(transaction.type))}
        {renderRow("Sender:", <AccountLink hideAccount address={transaction.sender} color="auto"/>)}
        {renderRow("Sequence Number:", transaction.sequenceNumber)}
        {renderRow("Expiration Timestamp", renderTimestamp(transaction.expirationTimestampSecs))}
        {renderRow("Hash:", transaction.hash)}
        {renderRow("Max Gas:", renderGas(transaction.maxGasAmount))}
        {renderRow("Gas Unit Price:", renderGas(transaction.gasUnitPrice))}
        {renderRow("Gas Currency:", transaction.gasCurrencyCode)}
        {renderRow("Signature:", renderDebug(transaction.signature))}
      </Stack>)}
    {renderSection(
      <>
        <Stack direction="column"
               spacing={2}
        >
          <Divider orientation="horizontal"/>
          {renderDebug(transaction.payload)}
        </Stack>
      </>
      , "Payload"
    )}
  </>);
}

function RenderHeader(children: React.ReactNode) {
  let {txnHashOrVersion} = useParams();

  return renderSection(children, `Transaction ${txnHashOrVersion}`);
}

function RenderTransaction({data, error}: { data?: OnChainTransaction, error?: ResponseError }) {
  let {txnHashOrVersion} = useParams();

  if (error)
    if (error.type == ResponseErrorType.NOT_FOUND)
      return RenderHeader(
        <Alert severity="error">
          {error}
          Could not find a transaction with version or hash {txnHashOrVersion}
        </Alert>);
    else if (error.type == ResponseErrorType.UNHANDLED)
      return RenderHeader(
        <Alert severity="error">
          Unknown error fetching transaction with version or hash {txnHashOrVersion}:<br/>
          {error.message}
          <br/>
          Try again later
        </Alert>
      );

  if (!data)
    return RenderHeader(
      <Alert severity="error">
        Got an empty response fetching transaction with version or hash {txnHashOrVersion}<br/>
        Try again later
      </Alert>
    );

  const [tab, setTabValue] = React.useState("Overview");

  const transaction = data;
  let result: React.ReactElement | null = null;
  switch (transaction.type) {
    case "block_metadata_transaction":
      result = renderBlockMetadataTransaction(transaction as BlockMetadataTransaction);
      break;
    case "genesis_transaction":
      result = renderGenesisTransaction(transaction as GenesisTransaction);
      break;
    case "user_transaction":
      result = renderUserTransaction(transaction as UserTransaction);
      break;
    case "pending_transaction":
      result = renderPendingTransaction(transaction as PendingTransaction);
      break;
    default:
      result = (
        <>
          {RenderHeader(
            <Stack direction="column"
                   spacing={2}
                   divider={<Divider orientation="horizontal"/>}
            >
              {renderRow("", (<div style={{color: "red", fontWeight: "bold"}}>
                  Unknown transaction type: "{transaction.type}"
              </div>))}
              {renderRow("Data:", renderDebug(transaction))}
            </Stack>)}
        </>
      );
  }

  return (
    <>
      {result}
      {/* renderDebug(transaction)*/}
    </>
  );
}

export default function Transaction() {
  const [state, _] = useGlobalState();
  let {txnHashOrVersion} = useParams();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <SafeRequestComponent
          request={(network: string) => getTransaction({txnHashOrVersion: txnHashOrVersion as string}, network)}
          args={[state.network_value]}
        >
          <RenderTransaction/>
        </SafeRequestComponent>
      </Grid>
    </Grid>
  );
}
