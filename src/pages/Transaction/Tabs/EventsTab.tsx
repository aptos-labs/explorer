import React from "react";
import {Types} from "aptos";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import JsonCard from "../../../components/IndividualPageContent/JsonCard";
import CollapsibleCards from "../../../components/IndividualPageContent/CollapsibleCards";
import useExpandedList from "../../../components/hooks/useExpandedList";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import HashButton, {HashType} from "../../../components/HashButton";

type EventsTabProps = {
  transaction: Types.Transaction;
};

export default function EventsTab({transaction}: EventsTabProps) {
  const events: Types.Event[] =
    "events" in transaction ? transaction.events : [];

  const {expandedList, toggleExpandedAt, expandAll, collapseAll} =
    useExpandedList(events.length);

  if (events.length === 0) {
    return <EmptyTabContent />;
  }

  return (
    <CollapsibleCards
      expandedList={expandedList}
      expandAll={expandAll}
      collapseAll={collapseAll}
    >
      {events.map((event, i) => (
        <CollapsibleCard
          key={i}
          titleKey="Index:"
          titleValue={i.toString()}
          expanded={expandedList[i]}
          toggleExpanded={() => toggleExpandedAt(i)}
        >
          <ContentRow
            title="Account Address:"
            value={
              <HashButton
                hash={event.guid.account_address}
                type={HashType.ACCOUNT}
              />
            }
          />
          <ContentRow
            title="Creation Number:"
            value={event.guid.creation_number}
          />
          <ContentRow title="Sequence Number:" value={event.sequence_number} />
          <ContentRow title="Type:" value={event.type} />
          <ContentRow
            title="Data:"
            value={<JsonCard data={event.data} expandedByDefault />}
          />
        </CollapsibleCard>
      ))}
    </CollapsibleCards>
  );
}
