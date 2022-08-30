import * as React from "react";
import {Types} from "aptos";
import {Stack, Box} from "@mui/material";
import {renderDebug} from "../../utils";
import Divider from "@mui/material/Divider";
import Row from "./Components/Row";

function Event({event}: {event: Types.Event}) {
  return (
    <Stack direction="column" spacing={1}>
      <Row title={"Sequence Number:"} value={event.sequence_number} />
      <Row title={"Type:"} value={event.type} />
      <Row title={"Key:"} value={event.key} />
      <Row title={"Data:"} value={renderDebug(event.data)} />
    </Stack>
  );
}

type EventsTabProps = {
  transaction: Types.Transaction;
};

export default function EventsTab({transaction}: EventsTabProps) {
  if (!("events" in transaction)) {
    return <>None</>;
  }

  const events: Types.Event[] = transaction.events;

  return (
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
