import React from "react";
import {Stack, Divider} from "@mui/material";
import {Proposal} from "../Types";
import ContentRow from "./ContentRow";

type ProposalContentProps = {
  proposal: Proposal;
};

export function ProposalContent({proposal}: ProposalContentProps): JSX.Element {
  return (
    <Stack
      direction="column"
      spacing={4}
      divider={
        <Divider variant="dotted" orientation="horizontal" sx={{mb: 0}} />
      }
    >
      <ContentRow title="Proposal Hash" text={proposal.execution_hash} />
      <ContentRow
        title="Source Code"
        text="LINK TO SOURCE CODE"
        link={proposal.metadata.source_code_url}
      />
      <ContentRow title="Description" text={proposal.metadata.description} />
      <ContentRow
        title="Discussion"
        text="LINK TO DISCUSSION"
        link={proposal.metadata.discussion_url}
      />
    </Stack>
  );
}
