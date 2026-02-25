import type React from "react";
import type {Types} from "~/types/aptos";
import useExpandedList from "../../../components/hooks/useExpandedList";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import CollapsibleCards from "../../../components/IndividualPageContent/CollapsibleCards";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";

function ResourcesContent({
  resourceData,
}: {
  resourceData: Types.MoveResource[] | undefined;
}): React.JSX.Element {
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
