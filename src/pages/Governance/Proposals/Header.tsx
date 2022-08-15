import React from "react";
import {Button, Grid, Typography} from "@mui/material";
import {Box} from "@mui/system";

type HeaderProps = {
  onVoteProposalButtonClick?: () => void;
};

export const Header = ({onVoteProposalButtonClick}: HeaderProps) => {
  return (
    <Grid container mb={10}>
      <Grid item xs={12}>
        <Grid
          container
          spacing={{xs: 6, sm: 12}}
          justifyContent="space-between"
          flexDirection="row"
        >
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">
              Welcome to Aptos Governance. Here you can view and vote on the
              proposals.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" mb={4}>
              To view proposals, click the View Proposals below. To vote on a
              proposal, install Petra (Aptos Wallet), connect to the wallet and
              begin voting on any proposal. You can vote on multiple proposals.
            </Typography>
            <Box justifyContent="center">
              <Button
                variant="primary"
                onClick={onVoteProposalButtonClick}
                sx={{width: "300px"}}
              >
                View Proposals
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
