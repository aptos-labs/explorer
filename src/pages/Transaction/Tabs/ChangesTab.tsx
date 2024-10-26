import * as React from "react";
import {Types} from "aptos";
import CollapsibleCards from "../../../components/IndividualPageContent/CollapsibleCards";
import useExpandedList from "../../../components/hooks/useExpandedList";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import HashButton, {HashType} from "../../../components/HashButton";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {
  collectionV2Address,
  objectCoreResource,
  tokenV2Address,
} from "../../../constants";

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
            <ContentRow
              title="Address:"
              value={
                <HashButton
                  hash={change.address}
                  type={
                    "data" in change &&
                    "type" in change.data &&
                    [
                      objectCoreResource,
                      tokenV2Address,
                      collectionV2Address,
                    ].includes(change.data.type)
                      ? HashType.OBJECT
                      : HashType.ACCOUNT
                  }
                />
              }
            />
          )}
          <ContentRow title="State Key Hash:" value={change.state_key_hash} />
          {"data" in change && change.data && "type" in change.data && (
            <ContentRow title="Resource:" value={change.data.type} />
          )}
          {"data" in change && change.data && (
            <ContentRow
              title="Data:"
              value={<JsonViewCard data={change.data} />}
            />
          )}
          {"handle" in change && (
            <ContentRow title="Handle:" value={change.handle} />
          )}
          {"key" in change && <ContentRow title="Key:" value={change.key} />}
          {"value" in change && (
            <ContentRow title="Value:" value={change.value} />
          )}
        </CollapsibleCard>
      ))}
    </CollapsibleCards>
  );
}
