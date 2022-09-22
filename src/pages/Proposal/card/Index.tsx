import React from "react";
import {Divider, Stack} from "@mui/material";

import Card from "../../../components/Card";
import {Proposal} from "../../Types";
import CastVoteSection from "./CastVoteSection";
import ResultsSection from "./ResultsSection";
import YourVoteSection from "./YourVoteSection";
import {isVotingClosed} from "../../utils";
import {useAccountHasVoted} from "../hooks/useAccountHasVoted";

type ProposalCardProps = {
  proposal: Proposal;
};

export function ProposalCard({proposal}: ProposalCardProps) {
  const accountHasVoted = useAccountHasVoted(proposal.proposal_id);

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
        {!isVotingClosed(proposal) && !accountHasVoted && (
          <CastVoteSection proposalId={proposal.proposal_id} />
        )}
        {accountHasVoted && <YourVoteSection />}
        <ResultsSection proposal={proposal} />
      </Stack>
    </Card>
  );
}
