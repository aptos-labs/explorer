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
import {useTranslation} from "../../../i18n";
import ScriptBytecodeDecompiler from "./Components/ScriptBytecodeDecompiler";

type PayloadTabProps = {
  transaction: Types.Transaction;
};

function EncryptedPayloadSummary({
  payload,
}: {
  payload: Types.TransactionPayload_EncryptedTransactionPayload;
}) {
  const {t, formatIntegerString} = useTranslation();
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
          label={t("payload.encryptedTxn")}
          size="small"
        />
        <Chip
          color={stateColor}
          label={encryptedStateLabel(payload.encrypted_state, t)}
          size="small"
          variant="outlined"
        />
      </Stack>
      {payload.encryption_epoch != null && payload.encryption_epoch !== "" && (
        <Typography variant="body2" color="text.secondary">
          {t("payload.encryptionEpoch", {
            epoch: formatIntegerString(String(payload.encryption_epoch)),
          })}
        </Typography>
      )}
      {claimed && (
        <Typography variant="body2" color="text.secondary">
          {t("payload.claimedEntry", {fn: claimed})}
        </Typography>
      )}
      {payload.encrypted_state === "failed_decryption" &&
        payload.decryption_failure_reason && (
          <Typography variant="body2" color="text.secondary">
            {t("payload.failureReason", {
              reason: payload.decryption_failure_reason,
            })}
          </Typography>
        )}
      {payload.decrypted_payload && (
        <>
          <Typography variant="subtitle2">
            {t("payload.decryptedPayload")}
          </Typography>
          <JsonViewCard data={payload.decrypted_payload} />
        </>
      )}
      <Typography variant="subtitle2">
        {t("payload.encryptedPayload")}
      </Typography>
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
