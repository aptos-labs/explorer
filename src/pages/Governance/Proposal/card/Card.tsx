import React from "react";
import {Divider, Stack} from "@mui/material";

import Card from "../../../../components/Card";
import {Proposal} from "../../Types";
import CastVoteSection from "./CastVoteSection";
import ResultsSection from "./ResultsSection";

type ProposalCardProps = {
  proposal: Proposal;
  proposalId: string;
};

export function ProposalCard({proposal, proposalId}: ProposalCardProps) {
  return (
    <Card>
      <Stack
        divider={
          <Divider
            variant="dotted"
            orientation="horizontal"
            sx={{mt: 2, mb: 2}}
          />
        }
      >
        <CastVoteSection proposalId={proposalId} />
        <ResultsSection proposal={proposal} />
      </Stack>
    </Card>
  );
}
