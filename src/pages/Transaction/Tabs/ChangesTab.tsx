import * as React from "react";
import {Types} from "aptos";
import {Stack, Box} from "@mui/material";
import {renderDebug} from "../../utils";
import Divider from "@mui/material/Divider";
import Row from "./Components/Row";

function Change({change, i}: {change: Types.WriteSetChange; i: number}) {
  return (
    <Stack direction="column" spacing={1}>
      <Row title={"Index:"} value={i} />
      <Row title={"Type:"} value={change.type} />
      {"address" in change && <Row title={"Address:"} value={change.address} />}
      <Row
        title={"State Key Hash:"}
        value={renderDebug(change.state_key_hash)}
      />
      {"data" in change && (
        <Row title={"Data:"} value={renderDebug(change.data)} />
      )}
    </Stack>
  );
}

type ChangesTabProps = {
  transaction: Types.Transaction;
};

export default function ChangesTab({transaction}: ChangesTabProps) {
  if (!("changes" in transaction)) {
    return <>None</>;
  }

  const changes: Types.WriteSetChange[] = transaction.changes;

  return (
    <Box marginX={2} marginTop={5}>
      <Stack
        direction="column"
        spacing={3}
        divider={<Divider variant="dotted" orientation="horizontal" />}
      >
        {changes.map((change, i) => (
          <Change change={change} i={i} key={i} />
        ))}
      </Stack>
    </Box>
  );
}
