import {Types} from "aptos";
import React from "react";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import useExpandedList from "../../../components/hooks/useExpandedList";
import CollapsibleCards from "../../../components/IndividualPageContent/CollapsibleCards";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";

function ResourcesContent({
  resourceData,
}: {
  resourceData: Types.MoveResource[] | undefined;
}): JSX.Element {
  const resources: Types.MoveResource[] = resourceData ?? [];

  const {expandedList, toggleExpandedAt, expandAll, collapseAll} =
    useExpandedList(resources.length);

  if (resources.length === 0) {
    return <EmptyTabContent />;
  }

  return (
    <CollapsibleCards
      expandedList={expandedList}
      expandAll={expandAll}
      collapseAll={collapseAll}
    >
      {resources.map((resource, i) => (
        <CollapsibleCard
          key={i}
          titleKey="Type:"
          titleValue={resource.type}
          expanded={expandedList[i]}
          toggleExpanded={() => toggleExpandedAt(i)}
        >
          <JsonViewCard data={resource.data} />
        </CollapsibleCard>
      ))}
    </CollapsibleCards>
  );
}

type ResourcesTabProps = {
  resourceData: Types.MoveResource[] | undefined;
};

export default function ResourcesTab({resourceData}: ResourcesTabProps) {
  return <ResourcesContent resourceData={resourceData} />;
}
