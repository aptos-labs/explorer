import {Types} from "aptos";
import {Stack} from "@mui/material";
import React from "react";
import Divider from "@mui/material/Divider";
import Error from "../Error";
import Row from "../Row";
import {renderDebug} from "../../utils";
import {useGetAccountResources} from "../../../api/hooks/useGetAccountResources";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import useExpandedList from "../../../components/hooks/useExpandedList";
import CollapsibleCards from "../../../components/IndividualPageContent/CollapsibleCards";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import JsonCard from "../../../components/IndividualPageContent/JsonCard";
import {useGetInGtmMode} from "../../../api/hooks/useGetInDevMode";

function Content({
  data,
}: {
  data: Types.MoveResource[] | undefined;
}): JSX.Element {
  if (!data || data.length === 0) {
    return <>None</>;
  } else {
    return (
      <>
        {data.map((resource, i) => (
          <Stack direction="column" key={i} spacing={3}>
            <Row title={"Type:"} value={resource.type} />
            <Row title={"Data:"} value={renderDebug(resource.data)} />
          </Stack>
        ))}
      </>
    );
  }
}

function ResourcesContent({
  data,
}: {
  data: Types.MoveResource[] | undefined;
}): JSX.Element {
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
          <JsonCard data={resource.data} />
        </CollapsibleCard>
      ))}
    </CollapsibleCards>
  );
}

type ResourcesTabProps = {
  address: string;
};

export default function ResourcesTab({address}: ResourcesTabProps) {
  const inGtm = useGetInGtmMode();
  const {isLoading, data, error} = useGetAccountResources(address);

  if (isLoading) {
    return null;
  }

  if (error) {
    return <Error address={address} error={error} />;
  }

  return inGtm ? (
    <ResourcesContent data={data} />
  ) : (
    <Stack
      marginX={2}
      direction="column"
      spacing={2}
      divider={<Divider variant="dotted" orientation="horizontal" />}
    >
      <Content data={data} />
    </Stack>
  );
}
