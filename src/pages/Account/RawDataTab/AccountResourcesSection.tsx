import {ResponseErrorType, ResponseError} from "../../../api/client";
import {Stack} from "@mui/material";
import React from "react";
import {renderSection} from "../../Transactions/helpers";
import Divider from "@mui/material/Divider";
import {renderDebug} from "../../utils";
import Typography from "@mui/material/Typography";
import {useGetAccountResources} from "../../../api/hooks/useGetAccountResources";
import Error from "../Error";
import Row from "./Row";
import {Types} from "aptos";

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

type AccountResourcesSectionProps = {
  address: string;
};

export default function AccountResourcesSection({
  address,
}: AccountResourcesSectionProps) {
  const {isLoading, data, error} = useGetAccountResources(address);

  if (isLoading) {
    return null;
  }

  const titleComponent = (
    <Typography variant="h5">Account Resources</Typography>
  );

  if (error && error.type !== ResponseErrorType.NOT_FOUND) {
    return renderSection(
      <Error address={address} error={error} />,
      titleComponent,
    );
  }

  return renderSection(
    <Stack
      direction="column"
      spacing={2}
      divider={<Divider variant="dotted" orientation="horizontal" />}
    >
      <Content data={data} />
    </Stack>,
    titleComponent,
  );
}
