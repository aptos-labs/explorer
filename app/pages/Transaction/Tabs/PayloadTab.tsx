import {Box, Chip, Stack, Typography} from "@mui/material";
import {useState} from "react";
import type {Types} from "~/types/aptos";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import ScriptBytecodeDecompiler from "./Components/ScriptBytecodeDecompiler";

type PayloadTabProps = {
  transaction: Types.Transaction;
};

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
        {transaction.payload.type === "encrypted_transaction_payload" && (
          <Stack spacing={1}>
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{flexWrap: "wrap"}}
            >
              <Chip label="Encrypted transaction" size="small" />
              <Chip
                color={
                  transaction.payload.encrypted_state === "decrypted"
                    ? "success"
                    : "default"
                }
                label={
                  transaction.payload.encrypted_state === "decrypted"
                    ? "Decrypted"
                    : transaction.payload.encrypted_state
                }
                size="small"
                variant="outlined"
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Encryption epoch: {transaction.payload.encryption_epoch}
            </Typography>
            {transaction.payload.decrypted_payload && (
              <>
                <Typography variant="subtitle2">Decrypted payload</Typography>
                <JsonViewCard data={transaction.payload.decrypted_payload} />
              </>
            )}
            <Typography variant="subtitle2">Encrypted payload</Typography>
          </Stack>
        )}
        <JsonViewCard data={transaction.payload} />
      </CollapsibleCard>
    </Box>
  );
}
