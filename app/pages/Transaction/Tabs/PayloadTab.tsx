import {LockOutlined} from "@mui/icons-material";
import {Box, Chip, Stack, Typography} from "@mui/material";
import {useState} from "react";
import type {Types} from "~/types/aptos";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {
  encryptedStateLabel,
  formatClaimedEntryFunction,
  isEncryptedTransactionPayload,
} from "../../../utils/transactionPayload";
import ScriptBytecodeDecompiler from "./Components/ScriptBytecodeDecompiler";

type PayloadTabProps = {
  transaction: Types.Transaction;
};

function EncryptedPayloadSummary({
  payload,
}: {
  payload: Types.TransactionPayload_EncryptedTransactionPayload;
}) {
  const claimed = formatClaimedEntryFunction(payload.claimed_entry_fun);
  const stateColor =
    payload.encrypted_state === "decrypted"
      ? "success"
      : payload.encrypted_state === "failed_decryption"
        ? "warning"
        : "default";

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} useFlexGap sx={{flexWrap: "wrap"}}>
        <Chip
          icon={<LockOutlined />}
          label="Encrypted transaction"
          size="small"
        />
        <Chip
          color={stateColor}
          label={encryptedStateLabel(payload.encrypted_state)}
          size="small"
          variant="outlined"
        />
      </Stack>
      {payload.encryption_epoch != null && payload.encryption_epoch !== "" && (
        <Typography variant="body2" color="text.secondary">
          Encryption epoch: {payload.encryption_epoch}
        </Typography>
      )}
      {claimed && (
        <Typography variant="body2" color="text.secondary">
          Claimed entry function: {claimed}
        </Typography>
      )}
      {payload.encrypted_state === "failed_decryption" &&
        payload.decryption_failure_reason && (
          <Typography variant="body2" color="text.secondary">
            Failure reason: {payload.decryption_failure_reason}
          </Typography>
        )}
      {payload.decrypted_payload && (
        <>
          <Typography variant="subtitle2">Decrypted payload</Typography>
          <JsonViewCard data={payload.decrypted_payload} />
        </>
      )}
      <Typography variant="subtitle2">Encrypted payload</Typography>
    </Stack>
  );
}

export default function PayloadTab({transaction}: PayloadTabProps) {
  const [expanded, setExpanded] = useState<boolean>(true);

  if (!("payload" in transaction)) {
    return <EmptyTabContent />;
  }

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Box
      sx={{
        marginTop: 3,
      }}
    >
      <CollapsibleCard
        key={0}
        titleKey="Type:"
        titleValue={transaction.payload.type}
        expanded={expanded}
        toggleExpanded={toggleExpanded}
      >
        {transaction.payload.type === "script_payload" &&
          "code" in transaction.payload &&
          typeof transaction.payload.code?.bytecode === "string" && (
            <ScriptBytecodeDecompiler
              bytecodeHex={transaction.payload.code.bytecode}
            />
          )}
        {isEncryptedTransactionPayload(transaction.payload) && (
          <EncryptedPayloadSummary payload={transaction.payload} />
        )}
        <JsonViewCard data={transaction.payload} />
      </CollapsibleCard>
    </Box>
  );
}
