import {Stack, Typography, useTheme} from "@mui/material";
import React from "react";
import {grey} from "../themes/colors/aptosColorPalette";

const BAR_COLOR = "#818CF8";
const BAR_BACKGROUND_COLOR = "rgb(129, 140, 248, 0.4)";

type IntervalBarProps = {
  percentage: number;
  content: string;
};

export default function IntervalBar({percentage, content}: IntervalBarProps) {
  const theme = useTheme();
  return (
    <Stack direction="row" width={182} height={16}>
      <Stack
        width={`${percentage}%`}
        sx={{
          backgroundColor: BAR_COLOR,
          borderRadius:
            percentage < 100 ? "4px 0px 0px 4px" : "4px 4px 4px 4px",
        }}
        justifyContent="center"
      >
        {percentage >= 50 && (
          <Typography
            color={grey[50]}
            sx={{fontSize: 10, fontWeight: 600}}
            marginX={0.5}
          >
            {content}
          </Typography>
        )}
      </Stack>
      <Stack
        width={`${100 - percentage}%`}
        sx={{
          backgroundColor: BAR_BACKGROUND_COLOR,
          borderRadius: percentage > 0 ? "0px 4px 4px 0px" : "4px 4px 4px 4px",
        }}
        alignItems="flex-end"
        justifyContent="center"
      >
        {percentage < 50 && (
          <Typography
            color={theme.palette.mode === "dark" ? grey[50] : grey[500]}
            sx={{fontSize: 10, fontWeight: 600}}
            marginX={0.5}
          >
            {content}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
