import React from "react";
import {Grid, Box, Typography} from "@mui/material";
import {grey} from "../../../../themes/colors/aptosColorPalette";

type ContentRowProps = {
  title: string;
  value: React.ReactNode;
  i?: any;
};

export default function ContentRow({title, value, i}: ContentRowProps) {
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
          <Typography variant="body2" color={grey[450]}>
            {title}
          </Typography>
        </Grid>
        <Grid item md={9} width={{xs: 1, md: 0.75}} sx={{fontSize: 13.5}}>
          {value}
        </Grid>
      </Grid>
    </Box>
  );
}
