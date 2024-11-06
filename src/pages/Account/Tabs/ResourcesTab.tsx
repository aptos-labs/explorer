import React from "react";
import Error from "../Error";
import {useGetAccountResources} from "../../../api/hooks/useGetAccountResources";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import useExpandedList from "../../../components/hooks/useExpandedList";
import CollapsibleCards from "../../../components/IndividualPageContent/CollapsibleCards";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {AccountData, MoveResource} from "@aptos-labs/ts-sdk";

function ResourcesContent({
  data,
}: {
  data: MoveResource[] | undefined;
}): JSX.Element {
  const resources: MoveResource[] = data ?? [];

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
  address: string;
  accountData: AccountData | MoveResource[] | undefined;
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
