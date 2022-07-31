import React from "react";
import {Stack, Divider} from "@mui/material";
import {renderRow, renderSection} from "../../../pages/Transactions/helpers";
import {Proposal} from "../Types";

function RenderContent(children: React.ReactNode) {
  return renderSection(children, null);
}

type ProposalContentProps = {
  proposal: Proposal;
};

export function ProposalContent({proposal}: ProposalContentProps) {

  return RenderContent(
    <Stack
      direction="column"
      spacing={2}
      divider={
        <Divider variant="dotted" orientation="horizontal" sx={{mb: 0}} />
      }
    >
      {renderRow("Proposal Hash:", proposal.execution_hash)}
      {renderRow("Proposal Script", proposal.metadata.execution_script)}
      {renderRow("Description:", proposal.metadata.description)}
    </Stack>,
  );
}
