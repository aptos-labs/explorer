import React from "react";
import {Grid, Box, Typography, Stack} from "@mui/material";
import {grey} from "../../themes/colors/aptosColorPalette";
import EmptyValue from "./EmptyValue";

type ContentRowProps = {
  title: string;
  value: React.ReactNode;
  tooltip?: React.ReactNode;
  i?: any;
};

export default function ContentRow({
  title,
  value,
  tooltip,
  i,
}: ContentRowProps) {
  return (
    <Box>
      <Grid
        container
        direction={{xs: "column", md: "row"}}
        rowSpacing={1}
        columnSpacing={4}
        alignItems="center"
        key={i}
      >
        <Grid item md={3}>
          <Stack direction="row">
            {tooltip}
            <Typography variant="body2" color={grey[450]}>
              {title}
            </Typography>
          </Stack>
        </Grid>
        <Grid
          item
          md={9}
          width={{xs: 1, md: 0.75}}
          sx={{
            fontSize: 13.5,
            overflow: "auto",
          }}
        >
          {value ? <Box>{value}</Box> : <EmptyValue />}
        </Grid>
      </Grid>
    </Box>
  );
}
