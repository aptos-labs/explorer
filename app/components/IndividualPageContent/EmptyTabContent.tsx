import {Box} from "@mui/material";
import type React from "react";
import ContentBox from "./ContentBox";

type EmptyTabContentProps = {
  message?: React.ReactNode;
};

export default function EmptyTabContent({message}: EmptyTabContentProps) {
  return (
    <Box sx={{marginBottom: 3}}>
      <ContentBox>{message ?? `No Data Found`}</ContentBox>
    </Box>
  );
}
