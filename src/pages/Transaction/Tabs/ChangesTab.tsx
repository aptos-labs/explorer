import * as React from "react";
import {Types} from "aptos";
import CollapsibleCards from "../../../components/IndividualPageContent/CollapsibleCards";
import useExpandedList from "../../../components/hooks/useExpandedList";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import JsonCard from "../../../components/IndividualPageContent/JsonCard";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";

type ChangesTabProps = {
  transaction: Types.Transaction;
};

export default function ChangesTab({transaction}: ChangesTabProps) {
  const changes: Types.WriteSetChange[] =
    "changes" in transaction ? transaction.changes : [];

  const {expandedList, toggleExpandedAt, expandAll, collapseAll} =
    useExpandedList(changes.length);

  if (changes.length === 0) {
    return <EmptyTabContent />;
  }

  return (
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
            <ContentRow
              title="Data:"
              value={<JsonCard data={change.data} expandedByDefault />}
            />
          )}
        </CollapsibleCard>
      ))}
    </CollapsibleCards>
  );
}
