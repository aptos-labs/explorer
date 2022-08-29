import {Types} from "aptos";
import {ResponseError, ResponseErrorType} from "../../../api/client";
import {useQuery} from "react-query";
import {Stack} from "@mui/material";
import React from "react";
import {useGlobalState} from "../../../GlobalState";
import {getAccount} from "../../../api";
import {renderSection} from "../../Transactions/helpers";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Error from "../Error";
import Row from "./Row";

function Content({data}: {data: Types.AccountData | undefined}): JSX.Element {
  if (!data) {
    return <>None</>;
  } else {
    return (
      <>
        <Row title={"Sequence Number:"} value={data.sequence_number} />
        <Row title={"Authentication Key:"} value={data.authentication_key} />
      </>
    );
  }
}

type AccountKeySectionProps = {
  address: string;
};

export default function AccountKeySection({address}: AccountKeySectionProps) {
  const [state, _] = useGlobalState();

  const {isLoading, data, error} = useQuery<Types.AccountData, ResponseError>(
    ["account", {address}, state.network_value],
    () => getAccount({address}, state.network_value),
  );

  if (isLoading) {
    return null;
  }

  const titleComponent = <Typography variant="h5">Account</Typography>;

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
