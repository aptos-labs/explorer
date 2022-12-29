import {Types} from "aptos";
import React from "react";
import Error from "../Error";
import {useGetAccountResources} from "../../../api/hooks/useGetAccountResources";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import useExpandedList from "../../../components/hooks/useExpandedList";
import CollapsibleCards from "../../../components/IndividualPageContent/CollapsibleCards";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import JsonCard from "../../../components/IndividualPageContent/JsonCard";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {useGetInDevMode} from "../../../api/hooks/useGetInDevMode";

function ResourcesContent({
  data,
}: {
  data: Types.MoveResource[] | undefined;
}): JSX.Element {
  const inDev = useGetInDevMode();

  const resources: Types.MoveResource[] = data ?? [];

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
          {inDev ? (
            <JsonViewCard data={resource.data} />
          ) : (
            <JsonCard data={resource.data} expandedByDefault />
          )}
        </CollapsibleCard>
      ))}
    </CollapsibleCards>
  );
}

type ResourcesTabProps = {
  address: string;
  accountData: Types.AccountData | undefined;
};

export default function ResourcesTab({address}: ResourcesTabProps) {
  const {isLoading, data, error} = useGetAccountResources(address);

  if (isLoading) {
    return null;
  }

  if (error) {
    return <Error address={address} error={error} />;
  }

  return <ResourcesContent data={data} />;
}
