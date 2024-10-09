import {Grid, Box} from "@mui/material";
import React from "react";
import Typography from "@mui/material/Typography";

type RowProps = {
  title: string;
  value: React.ReactNode;
  i?: any;
};

export default function Row({title, value, i}: RowProps) {
  return (
    <Box>
      <Grid
        container
        direction={{xs: "column", md: "row"}}
        rowSpacing={1}
        columnSpacing={4}
        key={i}
      >
        <Grid item md={3}>
          <Typography variant="subtitle1">{title}</Typography>
        </Grid>
        <Grid item md={9} sx={{width: 1, overflowWrap: "break-word"}}>
          <Box sx={{fontSize: 13.5}}>{value}</Box>
        </Grid>
      </Grid>
    </Box>
  );
}
