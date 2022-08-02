import React from "react";
import {Typography, Grid, Divider} from "@mui/material";
import {Proposal} from "../../Types";

const EMPTY_VOTE = "N/A";

type VotePercentage = {
  yes: string;
  no: string;
};

function getVotePercentage(proposal: Proposal): VotePercentage {
  const yesVotes: number = parseInt(proposal.yes_votes);
  const noVotes: number = parseInt(proposal.no_votes);

  if (yesVotes === 0 && noVotes === 0) {
    return {
      yes: EMPTY_VOTE,
      no: EMPTY_VOTE,
    };
  }

  const totalVotes = yesVotes + noVotes;
  const yesVotePercentage = ((yesVotes * 100) / totalVotes).toFixed(0);
  const noVotePercentage = ((noVotes * 100) / totalVotes).toFixed(0);

  return {
    yes: `${yesVotePercentage}%`,
    no: `${noVotePercentage}%`,
  };
}

type ResultsProps = {
  proposal: Proposal;
};

export default function Results({proposal}: ResultsProps) {
  const votePercentage = getVotePercentage(proposal);

  return (
    <Grid
      item
      xs={12}
      sm={12}
      md={6}
      sx={{overflow: "hidden", textOverflow: "ellipsis"}}
    >
      <Typography>Results</Typography>
      <Divider variant="fullWidth" orientation="horizontal" />
      <Typography mt={2}>For: {votePercentage.yes}</Typography>
      <Typography>Against: {votePercentage.no}</Typography>
    </Grid>
  );
}
