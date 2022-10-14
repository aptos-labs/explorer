import * as React from "react";
import {Types} from "aptos";
import {Stack, Box} from "@mui/material";
import {renderDebug} from "../../utils";
import Divider from "@mui/material/Divider";
import Row from "./Components/Row";
import {useGetInGtmMode} from "../../../api/hooks/useGetInDevMode";
import CollapsibleCards from "../../../components/IndividualPageContent/CollapsibleCards";
import useExpandedList from "../../../components/hooks/useExpandedList";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import JsonCard from "../../../components/IndividualPageContent/JsonCard";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";

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
  const inGtm = useGetInGtmMode();

  const changes: Types.WriteSetChange[] =
    "changes" in transaction ? transaction.changes : [];

  const {expandedList, toggleExpandedAt, expandAll, collapseAll} =
    useExpandedList(changes.length);

  return inGtm ? (
    <CollapsibleCards
      expandedList={expandedList}
      expandAll={expandAll}
      collapseAll={collapseAll}
    >
      {changes.map((change, i) => (
        <CollapsibleCard
          key={i}
          titleKey="Index:"
          titleValue={i.toString()}
          expanded={expandedList[i]}
          toggleExpanded={() => toggleExpandedAt(i)}
        >
          <ContentRow title="Type:" value={change.type} />
          {"address" in change && (
            <ContentRow title="Address:" value={change.address} />
          )}
          <ContentRow title="State Key Hash:" value={change.state_key_hash} />
          {"data" in change && (
            <ContentRow title="Data:" value={<JsonCard data={change.data} />} />
          )}
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
        {changes.map((change, i) => (
          <Change change={change} i={i} key={i} />
        ))}
      </Stack>
    </Box>
  );
}
