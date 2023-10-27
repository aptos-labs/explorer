import {useState} from "react";
import {Box} from "@mui/material";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {Genesis_Transaction, User_Transaction} from "../../../gql/graphql";

type PayloadTabProps = {
  transaction: Genesis_Transaction | User_Transaction;
};

export default function PayloadTab({transaction}: PayloadTabProps) {
  const [expanded, setExpanded] = useState<boolean>(true);

  if (!("payload" in transaction)) {
    return <EmptyTabContent />;
  }

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  // todo(jill): add type to the payload
  return (
    <Box marginTop={3}>
      <CollapsibleCard
        key={0}
        titleKey="Type:"
        titleValue={transaction.payload.type}
        expanded={expanded}
        toggleExpanded={toggleExpanded}
      >
        <JsonViewCard data={transaction.payload} />
      </CollapsibleCard>
    </Box>
  );
}
