import * as React from "react";
import Title from "../../components/Title";
import {useParams} from "react-router-dom";
import {useQuery, UseQueryResult} from "react-query";
import {Types} from "aptos";
import {getTransaction} from "../../api";
import {useGlobalState} from "../../GlobalState";
import {Alert, Stack} from "@mui/material";
import Grid from "@mui/material/Grid";
import {renderDebug} from "../utils";
import {ResponseError, ResponseErrorType} from "../../api/client";
import Divider from "@mui/material/Divider";
import {
  renderGas,
  renderSection,
  renderSuccess,
  renderTimestamp,
  renderTransactionType,
  renderRow,
} from "./helpers";
import {AccountLink} from "../Accounts/helpers";
import DividerHero from "../../components/DividerHero";
import Typography from "@mui/material/Typography";
import HeadingSub from "../../components/HeadingSub";
import HeaderSearch from "../layout/Search";
import GoBack from "../../components/GoBack";

function renderBlockMetadataTransaction(
  transaction: Types.Transaction_BlockMetadataTransaction,
) {
  return (
    <>
      {RenderHeader(
        <Stack
          direction="column"
          spacing={2}
          divider={
            <Divider variant="dotted" orientation="horizontal" sx={{mb: 0}} />
          }
        >
          {renderRow("Type:", renderTransactionType(transaction.type))}
          {renderRow("ID:", transaction.id)}
          {renderRow("Version:", transaction.version)}
          {renderRow("Hash:", transaction.hash)}
          {renderRow("Round:", transaction.round)}
          {renderRow("Status:", renderSuccess(transaction.success))}
          {renderRow("Proposer:", transaction.proposer)}
          {renderRow("State Root Hash:", transaction.state_root_hash)}
          {renderRow("Event Root Hash:", transaction.event_root_hash)}
          {renderRow("Gas Used:", renderGas(transaction.gas_used))}
          {renderRow("VM Status:", transaction.vm_status)}
          {renderRow(
            "Accumulator Root Hash:",
            transaction.accumulator_root_hash,
            false,
          )}
          {renderRow("Timestamp:", renderTimestamp(transaction.timestamp))}
          {renderRow(
            "Previous Block Votes:",
            renderDebug(transaction.previous_block_votes),
          )}
        </Stack>,
      )}
      {RenderChanges(transaction)}
    </>
  );
}

function RenderEvent(event: Types.Event, i: number) {
  return (
    <Grid container key={i}>
      {renderRow("Sequence Number:", event.sequence_number)}
      {renderRow("Type:", event.type)}
      {renderRow("Key:", event.key)}
      {renderRow("Data:", renderDebug(event.data))}
    </Grid>
  );
}

function RenderEvents(events: Array<Types.Event>) {
  return renderSection(
    <>
      <Stack
        direction="column"
        spacing={2}
        divider={<Divider variant="dotted" orientation="horizontal" />}
      >
        {events && events.map((event, i) => RenderEvent(event, i))}
      </Stack>
    </>,
    "Events",
  );
}

function RenderWriteSetChangeSpecific(change: Types.WriteSetChange) {
  switch (change.type) {
    case "delete_module":
      return renderRow(
        "Module:",
        renderDebug((change as Types.DeleteModule).module),
      );
    case "delete_resource":
      return renderRow(
        "Resource:",
        renderDebug((change as Types.DeleteResource).resource),
      );
    case "write_module":
      return renderRow(
        "Data:",
        renderDebug((change as Types.WriteModule).data),
      );
    case "write_resource":
      return renderRow(
        "Data:",
        renderDebug((change as Types.WriteResource).data),
      );
    case "write_table_item":
      const {handle, key, value} = change as Types.WriteTableItem;
      return renderRow("Data:", renderDebug({handle, key, value}));
    default:
      throw `UnknownWriteSet:${change.type}`;
  }
}

function RenderWriteSetChanges(changes: Array<Types.WriteSetChange>) {
  return renderSection(
    <>
      <Stack
        direction="column"
        spacing={2}
        divider={<Divider variant="dotted" orientation="horizontal" />}
      >
        {changes &&
          changes.map((change, i) => {
            return (
              <Grid container key={i}>
                {renderRow("Type:", change.type)}
                {"address" in change && renderRow("Address:", change.address)}
                {RenderWriteSetChangeSpecific(change)}
              </Grid>
            );
          })}
      </Stack>
    </>,
    "WriteSet Changes",
  );
}

function RenderDirectWriteSet(
  writeset: Types.DirectWriteSet,
  render_events: boolean = false,
) {
  return (
    <>
      {RenderWriteSetChanges(writeset.changes)}
      {render_events && RenderEvents(writeset.events)}
    </>
  );
}

function RenderScriptWriteSet(writeset: Types.ScriptWriteSet) {
  return (
    <Grid container>
      {renderRow("Type:", (writeset as any).type)}
      {renderRow("Execute As:", writeset.execute_as)}
      {renderRow("Script:", renderDebug(writeset.script))}
    </Grid>
  );
}

function RenderWriteSet(writeset: Types.WriteSet) {
  let inner = null;
  switch (writeset.type) {
    case "direct_write_set":
      inner = RenderDirectWriteSet(writeset as Types.DirectWriteSet);
      break;
    case "script_write_set":
      inner = RenderScriptWriteSet(writeset as Types.ScriptWriteSet);
      break;
    default:
      throw `Unknown:${writeset.type}`;
  }

  return (
    <>
      <Title sx={{pt: 2}}>WriteSet</Title>
      <Stack
        direction="column"
        spacing={2}
        divider={<Divider variant="dotted" orientation="horizontal" />}
      >
        {renderRow("Type:", writeset.type)}
        {inner}
      </Stack>
    </>
  );
}

function RenderPayload(payload: Types.WriteSetPayload) {
  return renderSection(
    <>
      <Stack direction="column" spacing={2}>
        {renderRow("Type", payload.write_set.type)}
        {RenderWriteSet(payload.write_set)}
      </Stack>
    </>,
    "Payload",
  );
}

function RenderChanges(transaction: Types.Transaction): React.ReactNode {
  return renderSection(
    <>
      {
        <Stack spacing={6} divider={<Divider orientation="horizontal" />}>
          {(transaction as any).changes.map((change: any, index: any) => (
            <Stack
              key={index}
              spacing={1}
              divider={<Divider variant="dotted" orientation="horizontal" />}
            >
              {renderRow("Index:", index)}
              {renderRow("Type:", change.type)}
              {"address" in change && renderRow("Address:", change.address)}
              {renderRow("State Key Hash:", change.state_key_hash)}
              {"data" in change && renderRow("Data:", renderDebug(change.data))}
            </Stack>
          ))}
        </Stack>
      }
    </>,
    "Changes",
  );
}

function renderGenesisTransaction(
  transaction: Types.Transaction_GenesisTransaction,
) {
  return (
    <>
      {RenderHeader(
        <Stack
          direction="column"
          spacing={2}
          divider={<Divider variant="dotted" orientation="horizontal" />}
        >
          {renderRow("Type:", renderTransactionType((transaction as any).type))}
          {renderRow("Version:", transaction.version)}
          {renderRow("Hash:", transaction.hash)}
          {renderRow("Status:", renderSuccess(transaction.success))}
          {renderRow("State Root Hash:", transaction.state_root_hash)}
          {renderRow("Event Root Hash:", transaction.event_root_hash)}
          {renderRow("Gas Used:", renderGas(transaction.gas_used))}
          {renderRow("VM Status:", transaction.vm_status)}
          {renderRow(
            "Accumulator Root Hash:",
            transaction.accumulator_root_hash,
            false,
          )}
        </Stack>,
      )}
      {RenderEvents(transaction.events)}
      {RenderPayload(transaction.payload)}
      {RenderChanges(transaction)}
    </>
  );
}

function renderUserTransaction(transaction: Types.Transaction_UserTransaction) {
  return (
    <>
      {RenderHeader(
        <Stack
          direction="column"
          spacing={2}
          divider={
            <Divider variant="dotted" orientation="horizontal" sx={{mb: 0}} />
          }
        >
          {renderRow("Type:", renderTransactionType(transaction.type))}
          {renderRow(
            "Sender:",
            <AccountLink hideAccount address={transaction.sender} />,
          )}
          {renderRow("Sequence Number:", transaction.sequence_number)}
          {renderRow(
            "Expiration Timestamp:",
            renderTimestamp(transaction.expiration_timestamp_secs),
          )}
          {renderRow("Version:", transaction.version)}
          {renderRow("Hash:", transaction.hash)}
          {renderRow("Status:", renderSuccess(transaction.success))}
          {renderRow("State Root Hash:", transaction.state_root_hash)}
          {renderRow("Event Root Hash:", transaction.event_root_hash)}
          {renderRow("Gas Used:", renderGas(transaction.gas_used))}
          {renderRow("Max Gas:", renderGas(transaction.max_gas_amount))}
          {renderRow("Gas Unit Price:", renderGas(transaction.gas_unit_price))}
          {renderRow("Gas Currency:", (transaction as any).gas_currency_code)}
          {renderRow("VM Status:", transaction.vm_status)}
          {renderRow("Signature:", renderDebug(transaction.signature))}
          {renderRow(
            "Accumulator Root Hash:",
            transaction.accumulator_root_hash,
            false,
          )}
          {renderRow("Timestamp:", renderTimestamp(transaction.timestamp))}
        </Stack>,
      )}
      {RenderEvents(transaction.events)}
      {renderSection(
        <>
          <Stack direction="column" spacing={2}>
            <Divider variant="dotted" orientation="horizontal" />
            {renderDebug(transaction.payload)}
          </Stack>
        </>,
        "Payload",
      )}
      {RenderChanges(transaction)}
    </>
  );
}

function renderPendingTransaction(
  transaction: Types.Transaction_PendingTransaction,
) {
  return (
    <>
      {RenderHeader(
        <Stack
          direction="column"
          spacing={2}
          divider={
            <Divider variant="dotted" orientation="horizontal" sx={{mb: 0}} />
          }
        >
          {renderRow("Type:", renderTransactionType(transaction.type))}
          {renderRow(
            "Sender:",
            <AccountLink
              hideAccount
              address={transaction.sender}
              color="auto"
            />,
          )}
          {renderRow("Sequence Number:", transaction.sequence_number)}
          {renderRow(
            "Expiration Timestamp:",
            renderTimestamp(transaction.expiration_timestamp_secs),
          )}
          {renderRow("Hash:", transaction.hash)}
          {renderRow("Max Gas:", renderGas(transaction.max_gas_amount))}
          {renderRow("Gas Unit Price:", renderGas(transaction.gas_unit_price))}
          {renderRow("Gas Currency:", (transaction as any).gas_currency_code)}
          {renderRow("Signature:", renderDebug(transaction.signature))}
        </Stack>,
      )}
      {renderSection(
        <>
          <Stack direction="column" spacing={2}>
            <Divider variant="dotted" orientation="horizontal" />
            {renderDebug(transaction.payload)}
          </Stack>
        </>,
        "Payload",
      )}
    </>
  );
}

// TODO: Update type to StateCheckpointTransaction when it's added to the SDK.
function renderStateCheckpointTransaction(
  transaction: Types.Transaction_StateCheckpointTransaction,
) {
  return (
    <>
      {RenderHeader(
        <Stack
          direction="column"
          spacing={2}
          divider={
            <Divider variant="dotted" orientation="horizontal" sx={{mb: 0}} />
          }
        >
          {renderRow("Type:", renderTransactionType(transaction.type))}
          {renderRow("Version:", transaction.version)}
          {renderRow("Hash:", transaction.hash)}
          {renderRow("Status:", renderSuccess(transaction.success))}
          {/* {"proposer" in transaction &&
            renderRow("Proposer:", transaction.proposer)} */}
          {renderRow("State Root Hash:", transaction.state_root_hash)}
          {renderRow("Event Root Hash:", transaction.event_root_hash)}
          {renderRow("Gas Used:", renderGas(transaction.gas_used))}
          {renderRow("VM Status:", transaction.vm_status)}
          {renderRow(
            "Accumulator Root Hash:",
            transaction.accumulator_root_hash,
            false,
          )}
          {"timestamp" in transaction &&
            renderRow("Timestamp:", renderTimestamp(transaction.timestamp))}
        </Stack>,
      )}
    </>
  );
}

function RenderHeader(children: React.ReactNode) {
  const {txnHashOrVersion} = useParams();
  return renderSection(children, `Transaction ${txnHashOrVersion}`);
}

function RenderTransaction({
  isLoading,
  data,
  error,
  txnHashOrVersion,
}: UseQueryResult<Types.Transaction, ResponseError> & {
  txnHashOrVersion: string;
}) {
  if (isLoading) {
    return null;
  }

  if (error) {
    if (error.type == ResponseErrorType.NOT_FOUND) {
      const msg = `${error} Could not find a transaction with version or hash ${txnHashOrVersion}`;
      return RenderHeader(<Alert severity="error">{msg}</Alert>);
    } else if (error.type == ResponseErrorType.UNHANDLED) {
      return RenderHeader(
        <Alert severity="error">
          Unknown error fetching transaction with version or hash{" "}
          {txnHashOrVersion}:<br />
          {error.message}
          <br />
          Try again later
        </Alert>,
      );
    }
  }

  if (!data) {
    return RenderHeader(
      <Alert severity="error">
        Got an empty response fetching transaction with version or hash{" "}
        {txnHashOrVersion}
        <br />
        Try again later
      </Alert>,
    );
  }

  const transaction = data;
  let result: React.ReactElement | null = null;
  switch (transaction.type) {
    case "block_metadata_transaction":
      result = renderBlockMetadataTransaction(
        transaction as Types.Transaction_BlockMetadataTransaction,
      );
      break;
    case "genesis_transaction":
      result = renderGenesisTransaction(
        transaction as Types.Transaction_GenesisTransaction,
      );
      break;
    case "user_transaction":
      result = renderUserTransaction(
        transaction as Types.Transaction_UserTransaction,
      );
      break;
    case "pending_transaction":
      result = renderPendingTransaction(
        transaction as Types.Transaction_PendingTransaction,
      );
      break;
    case "state_checkpoint_transaction":
      result = renderStateCheckpointTransaction(transaction as any);
      break;
    default:
      result = (
        <>
          {RenderHeader(
            <Stack
              direction="column"
              spacing={2}
              divider={
                <Divider
                  variant="dotted"
                  orientation="horizontal"
                  sx={{mb: 0}}
                />
              }
            >
              {renderRow(
                "",
                <div style={{color: "red", fontWeight: "bold"}}>
                  Unknown transaction type: "{transaction.type}"
                </div>,
              )}
              {renderRow("Data:", renderDebug(transaction))}
            </Stack>,
          )}
        </>
      );
  }

  return result;
}

export default function Transaction() {
  const [state, _] = useGlobalState();
  const {txnHashOrVersion} = useParams();

  if (typeof txnHashOrVersion !== "string") {
    return null;
  }

  const result = useQuery<Types.Transaction, ResponseError>(
    ["transaction", {txnHashOrVersion}, state.network_value],
    () => getTransaction({txnHashOrVersion}, state.network_value),
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
        <GoBack />
        <RenderTransaction {...result} txnHashOrVersion={txnHashOrVersion} />
      </Grid>
    </Grid>
  );
}
