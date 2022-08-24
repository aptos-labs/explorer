import React from "react";

import {Box, Stack, Typography} from "@mui/material";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import Card from "../../../components/Card";

export function HasVotedCard() {
  return (
    <Box mb={4}>
      <Card>
        <Stack alignItems="center" flexDirection="row">
          <HowToVoteIcon /> <Typography ml={2}>VOTED</Typography>
        </Stack>
      </Card>
    </Box>
  );
}
