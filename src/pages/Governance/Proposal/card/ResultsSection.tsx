import React from "react";
import {Stack} from "@mui/material";
import {Proposal} from "../../Types";
import Section from "./Section";
import ResultBar from "./ResultBar";
import ParticipationBar from "./ParticipationBar";

type VotePercentage = {
  yes: number;
  no: number;
};

function getVotePercentage(proposal: Proposal): VotePercentage {
  const yesVotes: number = parseInt(proposal.yes_votes);
  const noVotes: number = parseInt(proposal.no_votes);
  const totalVotes = yesVotes + noVotes;

  return {
    yes: totalVotes === 0 ? 0 : (yesVotes * 100) / totalVotes,
    no: totalVotes === 0 ? 0 : (noVotes * 100) / totalVotes,
  };
}

type ResultsSectionProps = {
  proposal: Proposal;
};

export default function ResultsSection({proposal}: ResultsSectionProps) {
  const votePercentage = getVotePercentage(proposal);

  return (
    <Section title="Results">
      <Stack spacing={1}>
        <ResultBar
          shouldPass={true}
          votes={proposal.yes_votes}
          percentage={votePercentage.yes}
        />
        <ResultBar
          shouldPass={false}
          votes={proposal.no_votes}
          percentage={votePercentage.no}
        />
        <ParticipationBar proposal={proposal} />
      </Stack>
    </Section>
  );
}
