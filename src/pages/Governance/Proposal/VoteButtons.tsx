import {Button, Grid, Tooltip} from "@mui/material";
import React from "react";
import useSubmitVote from "../SubmitVote";

type Props = {
  proposalId: string;
};

export function VoteButtons({proposalId}: Props) {
  const [submitVote] = useSubmitVote(proposalId);

  const voted = false; // TODO - fetch real data

  const isEligibleToVote = (): boolean => {
    return true; // TODO - check if eligible to vote
  };

  const onVote = (shouldPass: boolean) => {
    submitVote(shouldPass);
  };

  if (voted) {
    return (
      <Button variant="primary" disabled>
        Voted Against
      </Button>
    );
  }

  return isEligibleToVote() ? (
    <Grid
      container
      direction="row"
      justifyContent={{xs: "center", sm: "flex-end"}}
      alignItems="center"
    >
      <Button variant="primary" sx={{mr: 2}} onClick={() => onVote(true)}>
        For
      </Button>
      <Button variant="primary" onClick={() => onVote(false)}>
        Against
      </Button>
    </Grid>
  ) : (
    <Tooltip title="You need to have a minimum of 1,000,000 coins in order to vote">
      <span>
        <Button variant="primary" disabled>
          Vote
        </Button>
      </span>
    </Tooltip>
  );
}
