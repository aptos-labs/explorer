import React from "react";
import {Grid, Box, Typography, Stack} from "@mui/material";
import {grey} from "../../themes/colors/aptosColorPalette";
import EmptyValue from "./ContentValue/EmptyValue";

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
        rowSpacing={1}
        columnSpacing={4}
        alignItems="center"
        key={i}
      >
        <Grid item xs={12} md={3}>
          <Stack direction="row">
            {tooltip}
            <Typography variant="body2" color={grey[450]}>
              {title}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} md={9}>
          <Box
            sx={{
              fontSize: 13.5,
              overflow: "auto",
            }}
          >
            {value ? <Box>{value}</Box> : <EmptyValue />}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
