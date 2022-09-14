import {Types} from "aptos";
import {Stack} from "@mui/material";
import React from "react";
import Divider from "@mui/material/Divider";
import Error from "../Error";
import Row from "../Row";
import {renderDebug} from "../../utils";
import {useGetAccountResources} from "../../../api/hooks/useGetAccountResources";

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

type ResourcesTabProps = {
  address: string;
};

export default function ResourcesTab({address}: ResourcesTabProps) {
  const {isLoading, data, error} = useGetAccountResources(address);

  if (isLoading) {
    return null;
  }

  if (error) {
    return <Error address={address} error={error} />;
  }

  return (
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
