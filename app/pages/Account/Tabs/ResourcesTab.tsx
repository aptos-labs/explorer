import type React from "react";
import type {Types} from "~/types/aptos";
import useExpandedList from "../../../components/hooks/useExpandedList";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import CollapsibleCards from "../../../components/IndividualPageContent/CollapsibleCards";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {ResourcesListSkeleton} from "../../../components/PageLoadSkeletons";
import ResourceDataView from "../../../components/IndividualPageContent/ResourceDataView";

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
          key={resource.type}
          titleKey="Type:"
          titleValue={resource.type}
          expanded={expandedList[i]}
          toggleExpanded={() => toggleExpandedAt(i)}
        >
          <ResourceDataView resourceType={resource.type} data={resource.data} />
        </CollapsibleCard>
      ))}
    </CollapsibleCards>
  );
}

type ResourcesTabProps = {
  resourceData: Types.MoveResource[] | undefined;
  isLoading?: boolean;
};

export default function ResourcesTab({
  resourceData,
  isLoading = false,
}: ResourcesTabProps) {
  if (isLoading) {
    return <ResourcesListSkeleton />;
  }
  return <ResourcesContent resourceData={resourceData} />;
}
