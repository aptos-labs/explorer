import React, {useState} from "react";
import {Types} from "aptos";
import {Box, Typography} from "@mui/material";
import {renderDebug} from "../../utils";
import {useGetInDevMode} from "../../../api/hooks/useGetInDevMode";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import JsonCard from "../../../components/IndividualPageContent/JsonCard";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";

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

  return inDev ? (
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
  ) : (
    <Box marginX={2} marginTop={5}>
      <Typography
        variant="body1"
        marginBottom={3}
      >{`TYPE: ${transaction.payload.type}`}</Typography>
      {renderDebug(transaction.payload)}
    </Box>
  );
}
