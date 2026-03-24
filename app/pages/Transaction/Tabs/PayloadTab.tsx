import {Box} from "@mui/material";
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
    <Box marginTop={3}>
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
        <JsonViewCard data={transaction.payload} />
      </CollapsibleCard>
    </Box>
  );
}
