import React from "react";
import {Divider, Stack} from "@mui/material";

import Card from "../../../../components/Card";
import {Proposal} from "../../Types";
import CastVoteSection from "./CastVoteSection";
import ResultsSection from "./ResultsSection";
import {isVotingClosed} from "../../utils";

type ProposalCardProps = {
  proposal: Proposal;
};

export function ProposalCard({proposal}: ProposalCardProps) {
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
        {!isVotingClosed(proposal) && (
          <CastVoteSection proposalId={proposal.proposal_id} />
        )}
        <ResultsSection proposal={proposal} />
      </Stack>
    </Card>
  );
}
