import {Box, Stack, Typography, useTheme} from "@mui/material";
import type {Types} from "~/types/aptos";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {extractEntryFunctionPayload} from "../../../utils/cliCommand";
import {getLearnMoreTooltip} from "../helpers";
import {payloadForRawJsonView} from "./Components/payloadRawJson";
import ScriptBytecodeDecompiler from "./Components/ScriptBytecodeDecompiler";
import TransactionArguments from "./Components/TransactionArguments";
import TransactionFunction from "./Components/TransactionFunction";

type PayloadTabProps = {
  transaction: Types.Transaction;
};

function MultisigInnerPayloadSection({
  transaction,
  inner,
}: {
  transaction: Types.Transaction;
  inner: Types.TransactionPayload_EntryFunctionPayload | undefined;
}) {
  const theme = useTheme();
  if (!inner) {
    return (
      <ContentRow
        title="Inner payload:"
        value={
          <Typography variant="body2" color={theme.palette.text.secondary}>
            None (multisig creation or payload not yet attached)
          </Typography>
        }
      />
    );
  }

  const syntheticTxn = {
    ...transaction,
    payload: inner,
  } as Types.Transaction;

  return (
    <>
      <ContentRow
        title="Function:"
        value={<TransactionFunction transaction={syntheticTxn} />}
        tooltip={getLearnMoreTooltip("function")}
      />
      <TransactionArgumentsRow transaction={syntheticTxn} />
    </>
  );
}

function TransactionArgumentsRow({
  transaction,
}: {
  transaction: Types.Transaction;
}) {
  const payload = extractEntryFunctionPayload(transaction);
  if (!payload) return null;
  if (payload.arguments.length === 0 && payload.type_arguments.length === 0) {
    return null;
  }
  return (
    <ContentRow
      title="Arguments:"
      titleLayout="fit"
      value={<TransactionArguments transaction={transaction} />}
      tooltip={getLearnMoreTooltip("arguments")}
    />
  );
}

function ScriptTypeAndValueArgs({
  typeArguments,
  arguments: args,
}: {
  typeArguments: string[];
  arguments: unknown[];
}) {
  const theme = useTheme();
  const mono = {
    fontFamily: "monospace",
    fontSize: "0.8rem",
    overflowWrap: "anywhere" as const,
    wordBreak: "break-all" as const,
  };

  return (
    <>
      {typeArguments.length > 0 ? (
        <ContentRow
          title="Type arguments:"
          value={
            <Stack component="ul" sx={{m: 0, pl: 2.5}} spacing={0.5}>
              {typeArguments.map((t, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: positional script type args
                <Typography key={i} component="li" variant="body2" sx={mono}>
                  {t}
                </Typography>
              ))}
            </Stack>
          }
        />
      ) : null}
      {args.length > 0 ? (
        <ContentRow
          title="Arguments:"
          value={
            <Stack spacing={1.5}>
              {args.map((arg, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: positional script args
                <Box key={i}>
                  <Typography
                    variant="caption"
                    sx={{color: theme.palette.text.secondary, fontWeight: 600}}
                  >
                    #{i}
                  </Typography>
                  <Typography
                    component="pre"
                    variant="body2"
                    sx={{
                      ...mono,
                      m: 0,
                      mt: 0.25,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {typeof arg === "string"
                      ? arg
                      : JSON.stringify(arg, null, 2)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          }
        />
      ) : null}
    </>
  );
}

export default function PayloadTab({transaction}: PayloadTabProps) {
  if (!("payload" in transaction)) {
    return <EmptyTabContent />;
  }

  const {payload} = transaction;

  return (
    <Box marginTop={3}>
      <ContentBox>
        <ContentRow title="Type:" value={payload.type} />
        {payload.type === "entry_function_payload" && (
          <>
            <ContentRow
              title="Function:"
              value={<TransactionFunction transaction={transaction} />}
              tooltip={getLearnMoreTooltip("function")}
            />
            <TransactionArgumentsRow transaction={transaction} />
          </>
        )}
        {payload.type === "multisig_payload" && (
          <>
            <ContentRow
              title="Multisig account:"
              value={
                <HashButton
                  hash={payload.multisig_address}
                  type={HashType.ACCOUNT}
                />
              }
            />
            <MultisigInnerPayloadSection
              transaction={transaction}
              inner={payload.transaction_payload}
            />
          </>
        )}
        {payload.type === "script_payload" &&
          "code" in payload &&
          typeof payload.code?.bytecode === "string" && (
            <ScriptBytecodeDecompiler bytecodeHex={payload.code.bytecode} />
          )}
        {payload.type === "script_payload" && (
          <ScriptTypeAndValueArgs
            typeArguments={payload.type_arguments}
            arguments={payload.arguments}
          />
        )}
        <ContentRow
          title="Raw JSON:"
          value={
            <JsonViewCard
              data={payloadForRawJsonView(payload)}
              collapsedByDefault
            />
          }
        />
      </ContentBox>
    </Box>
  );
}
