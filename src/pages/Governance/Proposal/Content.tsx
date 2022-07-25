import React from "react";
import {Stack, Divider, Link} from "@mui/material";
import {renderRow, renderSection} from "../../../pages/Transactions/helpers";
import {ProposalType} from "../Types";

function RenderContent(children: React.ReactNode) {
  return renderSection(children, null);
}

type Props = {
  proposalData: ProposalType;
};

export function ProposalContent({proposalData}: Props) {
  if (!proposalData) {
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
      {renderRow("Proposal Hash:", proposalData.execution_hash)}
      {renderRow("Description:", proposalData.execution_content.description)}
      {renderRow(
        "Code Location:",
        <Link
          color="primary"
          href={proposalData.execution_content.code_location}
          target="_blank"
        >
          {proposalData.execution_content.code_location}
        </Link>,
      )}
    </Stack>,
  );
}
