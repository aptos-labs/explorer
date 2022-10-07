import React from "react";
import {Types} from "aptos";
import {Stack, Box} from "@mui/material";
import {renderDebug} from "../../utils";
import Divider from "@mui/material/Divider";
import Row from "./Components/Row";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import {useGetInDevMode} from "../../../api/hooks/useGetInDevMode";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import JsonCard from "../../../components/IndividualPageContent/JsonCard";
import CollapsibleCards from "../../../components/IndividualPageContent/CollapsibleCards";
import useExpandedList from "../../../components/hooks/useExpandedList";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";

function Event({event}: {event: Types.Event}) {
  return (
    <Stack direction="column" spacing={1}>
      <Row title={"Sequence Number:"} value={event.sequence_number} />
      <Row title={"Type:"} value={event.type} />
      <Row title={"Data:"} value={renderDebug(event.data)} />
    </Stack>
  );
}

type EventsTabProps = {
  transaction: Types.Transaction;
};

export default function EventsTab({transaction}: EventsTabProps) {
  const inDev = useGetInDevMode();

  if (!("events" in transaction)) {
    return <EmptyTabContent />;
  }

  const events: Types.Event[] = transaction.events;

  const {expandedList, toggleExpandedAt, expandAll, collapseAll} =
    useExpandedList(events.length);

  return inDev ? (
    <CollapsibleCards
      expandedList={expandedList}
      expandAll={expandAll}
      collapseAll={collapseAll}
    >
      {events.map((event, i) => (
        <CollapsibleCard
          key={i}
          titleKey="Sequence Number:"
          titleValue={event.sequence_number}
          expanded={expandedList[i]}
          toggleExpanded={() => toggleExpandedAt(i)}
        >
          <ContentRow title="Type:" value={event.type} />
          <ContentRow title="Data:" value={<JsonCard data={event.data} />} />
        </CollapsibleCard>
      ))}
    </CollapsibleCards>
  ) : (
    <Box marginX={2} marginTop={5}>
      <Stack
        direction="column"
        spacing={3}
        divider={<Divider variant="dotted" orientation="horizontal" />}
      >
        {events.map((event, i) => (
          <Event event={event} key={i} />
        ))}
      </Stack>
    </Box>
  );
}
