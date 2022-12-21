import React, {useState} from "react";
import {Types} from "aptos";
import {Box} from "@mui/material";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import JsonCard from "../../../components/IndividualPageContent/JsonCard";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import JsonTreeCard from "../../../components/IndividualPageContent/JsonTreeCard";
import {useGetInDevMode} from "../../../api/hooks/useGetInDevMode";

type PayloadTabProps = {
  transaction: Types.Transaction;
};

export default function PayloadTab({transaction}: PayloadTabProps) {
  const inDev = useGetInDevMode();

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
        {inDev ? (
          <JsonTreeCard data={transaction.payload} />
        ) : (
          <JsonCard data={transaction.payload} expandedByDefault />
        )}
      </CollapsibleCard>
    </Box>
  );
}
