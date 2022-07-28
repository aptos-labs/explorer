import React from "react";
import {Stack, Divider} from "@mui/material";
import {renderRow, renderSection} from "../../../pages/Transactions/helpers";
import {Proposal, ProposalMetadata} from "../Types";

function RenderContent(children: React.ReactNode) {
  return renderSection(children, null);
}

type Props = {
  proposal: Proposal;
  metadata: ProposalMetadata;
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
      {metadata !== undefined
        ? renderRow("Proposal Script", metadata?.execution_script)
        : null}
      {metadata !== undefined
        ? renderRow("Description:", metadata?.description)
        : null}
    </Stack>,
  );
}
