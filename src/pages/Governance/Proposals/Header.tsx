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
          <Grid item xs={12} sm={5}>
            <Typography variant="h6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={5}>
            <Typography variant="subtitle2" mb={4}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Turpis
              tincidunt id aliquet risus. Non quam lacus suspendisse faucibus
              interdum posuere lorem ipsum. Amet tellus cras adipiscing enim eu
              turpis. Arcu cursus euismod quis viverra nibh cras pulvinar.
            </Typography>
            <Box justifyContent="center">
              <Button
                variant="primary"
                onClick={onVoteProposalButtonClick}
                sx={{width: "300px"}}
              >
                view proposals
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
