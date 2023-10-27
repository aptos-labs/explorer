import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import CollapsibleCards from "../../../components/IndividualPageContent/CollapsibleCards";
import useExpandedList from "../../../components/hooks/useExpandedList";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import HashButton, {HashType} from "../../../components/HashButton";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {
  Block_Metadata_Transaction,
  User_Transaction,
  Genesis_Transaction,
  Events,
} from "../../../gql/graphql";

type EventsTabProps = {
  transaction:
    | User_Transaction
    | Block_Metadata_Transaction
    | Genesis_Transaction;
};

export default function EventsTab({transaction}: EventsTabProps) {
  const events: Events[] = "events" in transaction ? transaction.events : [];

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
                hash={event.account_address}
                type={HashType.ACCOUNT}
              />
            }
          />
          <ContentRow title="Creation Number:" value={event.creation_number} />
          <ContentRow title="Sequence Number:" value={event.sequence_number} />
          <ContentRow title="Type:" value={event.event_type} />
          <ContentRow
            title="Data:"
            value={<JsonViewCard data={event.data} />}
          />
        </CollapsibleCard>
      ))}
    </CollapsibleCards>
  );
}
