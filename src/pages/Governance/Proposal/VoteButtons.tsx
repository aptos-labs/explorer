import {Button, Grid, Tooltip} from "@mui/material";
import React from "react";

export function VoteButtons() {
  const voted = false; // TODO - fetch real data

  const isEligibleToVote = (): boolean => {
    return true; // TODO - check if eligible to vote
  };

  const onForVoteClick = () => {
    // TODO - implement for vote
    console.log("onForVoteClick");
  };

  const onAgainstVoteClick = () => {
    // TODO - implement against vote
    console.log("onAgainstVoteClick");
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
      <Button variant="primary" sx={{mr: 2}} onClick={onForVoteClick}>
        For
      </Button>
      <Button variant="primary" onClick={onAgainstVoteClick}>
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
