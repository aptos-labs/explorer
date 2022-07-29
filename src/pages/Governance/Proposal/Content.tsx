import React from "react";
import {Stack, Divider} from "@mui/material";
import {renderRow, renderSection} from "../../../pages/Transactions/helpers";
import {Proposal} from "../Types";
import useProvideProposalMetadata from "../ProvideProposalMetadata";

function RenderContent(children: React.ReactNode) {
  return renderSection(children, null);
}

type Props = {
  proposal: Proposal;
};

export function ProposalContent({proposal}: Props) {

  const metadata = useProvideProposalMetadata(proposal);

  return RenderContent(
    <Stack
      direction="column"
      spacing={2}
      divider={
        <Divider variant="dotted" orientation="horizontal" sx={{mb: 0}} />
      }
    >
      {renderRow("Proposal Hash:", proposal.execution_hash)}
      {metadata && renderRow("Proposal Script", metadata?.execution_script)}
      {metadata && renderRow("Description:", metadata?.description)}
    </Stack>,
  );
}
