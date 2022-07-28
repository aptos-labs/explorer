import React from "react";
import {Box, Divider, Grid, Typography} from "@mui/material";

import {WalletButton} from "../../../components/WalletButton";
import {VoteButtons} from "./VoteButtons";
import {Proposal} from "../Types";
import {useWalletContext} from "../../../context/wallet/context";

const EMPTY_VOTE = "N/A";

type ProposalCardProps = {
  proposal: Proposal;
  proposalId: string;
};

type VotePercentage = {
  yes: string;
  no: string;
};

function getVotePercentage(
  yesVotesStr: string,
  noVotesStr: string,
): VotePercentage {
  const yesVotes: number = parseInt(yesVotesStr);
  const noVotes: number = parseInt(noVotesStr);

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

export function ProposalCard({proposal, proposalId}: ProposalCardProps) {
  const {isConnected} = useWalletContext();

  const votePercentage = getVotePercentage(
    proposal.yes_votes,
    proposal.no_votes,
  );

  return (
    <Box position="relative">
      <Box
        component="div"
        sx={{top: "0.5rem", left: "-0.5rem", zIndex: "-10"}}
        height="100%"
        width="100%"
        position="absolute"
        borderRadius={1}
        border="1px solid gray"
      ></Box>

      <Box
        component="div"
        sx={{p: 2, flexGrow: 1, backgroundColor: "#151515"}}
        borderRadius={1}
        border="1px solid gray"
      >
        <Grid container sx={{p: 2}} alignItems="center" spacing={4}>
          <Grid
            item
            xs={12}
            sm={12}
            md={isConnected ? 6 : 9}
            sx={{overflow: "hidden", textOverflow: "ellipsis"}}
          >
            <Typography>Results</Typography>
            <Divider variant="fullWidth" orientation="horizontal" />
            <Typography mt={2}>For: {votePercentage.yes}</Typography>
            <Typography>Against: {votePercentage.no}</Typography>
          </Grid>
          {isConnected ? (
            <Grid
              item
              xs={12}
              sm={12}
              md={6}
              textAlign={{xs: "left", sm: "right"}}
            >
              <VoteButtons proposalId={proposalId} />
            </Grid>
          ) : (
            <Grid
              item
              xs={12}
              sm={12}
              md={3}
              textAlign={{xs: "left", sm: "right"}}
            >
              <WalletButton />
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
}
