import React from "react";
import {Typography, Box} from "@mui/material";

type SectionProps = {
  title: string;
  children?: React.ReactNode;
};

export default function Section({title, children}: SectionProps) {
  return (
    <Box>
      <Typography variant="h5" marginBottom={1}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}
