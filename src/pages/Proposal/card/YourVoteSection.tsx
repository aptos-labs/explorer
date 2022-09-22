import React from "react";
import Section from "./Section";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import {Stack, Typography} from "@mui/material";

// TODO: add the specific vote (yes/no) after indexer is ready
export default function YourVoteSection({...props}): JSX.Element {
  return (
    <Section {...props}>
      <Stack alignItems="center" direction="row" spacing={1}>
        <HowToVoteIcon fontSize="small" />
        <Typography>VOTED</Typography>
      </Stack>
    </Section>
  );
}
