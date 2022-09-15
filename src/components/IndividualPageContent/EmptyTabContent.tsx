import {Box} from "@mui/material";
import React from "react";
import ContentBox from "./ContentBox";

export default function EmptyTabContent() {
  return (
    <Box marginBottom={3}>
      <ContentBox>No Data Found</ContentBox>
    </Box>
  );
}
