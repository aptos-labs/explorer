import type {Types} from "~/types/aptos";
import HashButton, {HashType} from "../../../components/HashButton";
import useExpandedList from "../../../components/hooks/useExpandedList";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import CollapsibleCards from "../../../components/IndividualPageContent/CollapsibleCards";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";

type EventsTabProps = {
  transaction: Types.Transaction;
};

// Check if this is an events v2 / module event by detecting zero values.
// Module events have account_address as 0x0, creation_number as "0", and
// sequence_number as "0" for backwards compatibility.
function isModuleEvent(event: Types.Event): boolean {
  const zeroAddress =
    event.guid.account_address === "0x0" ||
    event.guid.account_address ===
      "0x0000000000000000000000000000000000000000000000000000000000000000";
  const zeroCreationNumber = event.guid.creation_number === "0";
  const zeroSequenceNumber = event.sequence_number === "0";
  return zeroAddress && zeroCreationNumber && zeroSequenceNumber;
}

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
      {events.map((event, i) => {
        const hideZeroFields = isModuleEvent(event);
        return (
          <CollapsibleCard
            // biome-ignore lint/suspicious/noArrayIndexKey: events lack unique identifier
            key={i}
            titleKey="Index:"
            titleValue={`${i} — ${event.type}`}
            expanded={expandedList[i]}
            toggleExpanded={() => toggleExpandedAt(i)}
          >
            {!hideZeroFields && (
              <ContentRow
                title="Account Address:"
                value={
                  <HashButton
                    hash={event.guid.account_address}
                    type={HashType.ACCOUNT}
                  />
                }
              />
            )}
            {!hideZeroFields && (
              <ContentRow
                title="Creation Number:"
                value={event.guid.creation_number}
              />
            )}
            {!hideZeroFields && (
              <ContentRow
                title="Sequence Number:"
                value={event.sequence_number}
              />
            )}
            <ContentRow title="Type:" value={event.type} />
            <ContentRow
              title="Data:"
              value={
                <JsonViewCard
                  data={
                    typeof event.data === "object"
                      ? event.data
                      : {__PLACEHOLDER__: event.data}
                  }
                />
              }
            />
          </CollapsibleCard>
        );
      })}
    </CollapsibleCards>
  );
}
