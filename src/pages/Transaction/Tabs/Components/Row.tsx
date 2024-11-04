import {Grid2, Box} from "@mui/material";
import React from "react";
import Typography from "@mui/material/Typography";

type RowProps = {
  title: string;
  value: React.ReactNode;
  i?: any;
};

// TODO: generalize Row component for all pages
export default function Row({title, value, i}: RowProps) {
  return (
    <Box>
      <Grid2
        container
        direction={{xs: "column", md: "row"}}
        rowSpacing={1}
        columnSpacing={4}
        key={i}
      >
        <Grid2 size={{md: 3}}>
          <Typography variant="subtitle1">{title}</Typography>
        </Grid2>
        <Grid2 size={{md: 9}} sx={{width: 1, overflowWrap: "break-word"}}>
          <Box sx={{fontSize: 13.5}}>{value}</Box>
        </Grid2>
      </Grid2>
    </Box>
  );
}
