import {Types} from "aptos";
import {ResponseError} from "../../../api/client";
import {useQuery} from "react-query";
import {Box, Stack} from "@mui/material";
import React from "react";
import {useGlobalState} from "../../../GlobalState";
import {getAccount} from "../../../api";
import Divider from "@mui/material/Divider";
import Error from "../Error";
import Row from "../Row";
import {useGetInGtmMode} from "../../../api/hooks/useGetInDevMode";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {getLearnMoreTooltip} from "../../Transaction/helpers";

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

function InfoContent({
  data,
}: {
  data: Types.AccountData | undefined;
}): JSX.Element {
  if (!data) {
    return <EmptyTabContent />;
  } else {
    return (
      <Box marginBottom={3}>
        <ContentBox>
          <ContentRow
            title={"Sequence Number:"}
            value={data.sequence_number}
            tooltip={getLearnMoreTooltip("sequence_number")}
          />
          <ContentRow
            title={"Authentication Key:"}
            value={data.authentication_key}
            tooltip={getLearnMoreTooltip("authentication_key")}
          />
        </ContentBox>
      </Box>
    );
  }
}

type InfoTabProps = {
  address: string;
};

export default function InfoTab({address}: InfoTabProps) {
  const inGtm = useGetInGtmMode();
  const [state, _] = useGlobalState();

  const {isLoading, data, error} = useQuery<Types.AccountData, ResponseError>(
    ["account", {address}, state.network_value],
    () => getAccount({address}, state.network_value),
  );

  if (isLoading) {
    return null;
  }

  if (error) {
    return <Error address={address} error={error} />;
  }

  return inGtm ? (
    <InfoContent data={data} />
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
