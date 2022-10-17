import React, {useState} from "react";
import {Types} from "aptos";
import {Box} from "@mui/material";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import JsonCard from "../../../components/IndividualPageContent/JsonCard";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";

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
        <JsonCard data={transaction.payload} />
      </CollapsibleCard>
    </Box>
  );
}
