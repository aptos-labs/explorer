import React from "react";
import {Box, Grid} from "@mui/material";
import {grey} from "../../themes/colors/aptosColorPalette";
import EmptyValue from "./ContentValue/EmptyValue";

type ContentRowProps = {
  title: string;
  value: React.ReactNode;
  tooltip?: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        rowSpacing={0.5}
        columnSpacing={4}
        alignItems="start"
        key={i}
      >
        <Grid container size={{xs: 12, sm: 3}}>
          <Box sx={{fontSize: "0.875rem", color: grey[450]}}>
            {title}
            <Box
              component="span"
              sx={{
                display: "inline",
                whiteSpace: "nowrap",
              }}
            >
              &nbsp;
              <Box sx={{display: "inline-block"}}>{tooltip}</Box>
            </Box>
          </Box>
        </Grid>
        <Grid
          size={{xs: 12, sm: 9}}
          sx={{
            fontSize: "0.8rem",
            overflow: "auto",
          }}
        >
          {value ? <Box>{value}</Box> : <EmptyValue />}
        </Grid>
      </Grid>
    </Box>
  );
}
