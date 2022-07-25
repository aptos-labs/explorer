import React from "react";
import {Stack, Divider} from "@mui/material";
import {renderRow, renderSection} from "../../../pages/Transactions/helpers";
import {ProposalType, ProposalMetadata} from "../Types";

function RenderContent(children: React.ReactNode) {
  return renderSection(children, null);
}

type Props = {
  proposal: ProposalType;
  metadata?: ProposalMetadata;
};

export function ProposalContent({proposal, metadata}: Props) {
  if (!proposal) {
    return null;
  }

  return RenderContent(
    <Stack
      direction="column"
      spacing={2}
      divider={
        <Divider variant="dotted" orientation="horizontal" sx={{mb: 0}} />
      }
    >
      {renderRow("Proposal Hash:", proposal.execution_hash)}
      {renderRow("Proposal Script", metadata?.execution_script)}
      {renderRow("Description:", metadata?.description)}
    </Stack>,
  );
}
