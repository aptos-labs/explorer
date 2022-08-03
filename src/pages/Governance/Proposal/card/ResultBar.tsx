import React from "react";
import {Stack, Box, Typography} from "@mui/material";
import {
  primaryColor,
  negativeColor,
  voteFor,
  voteAgainst,
} from "../../constants";

const RADIUS = "0.7em";
const BAR_BACKGROUND_COLOR = "#272727";

type ResultBarProps = {
  shouldPass: boolean;
  percentage: number;
};

export default function ResultBar({shouldPass, percentage}: ResultBarProps) {
  const barColor = shouldPass ? primaryColor : negativeColor;

  const percentageStr = `${percentage.toFixed(0)}%`;
  const remainingPercentageStr = `${(100 - percentage).toFixed(0)}%`;

  return (
    <Stack>
      <Stack direction="row" justifyContent="space-between" paddingX={0.2}>
        <Typography variant="subtitle2" color={barColor}>
          {shouldPass ? voteFor : voteAgainst}
        </Typography>
        <Typography variant="subtitle2">{percentageStr}</Typography>
      </Stack>
      <Stack direction="row">
        <Box
          component="div"
          sx={{
            pt: RADIUS,
            backgroundColor: barColor,
            borderTopLeftRadius: RADIUS,
            borderBottomLeftRadius: RADIUS,
            borderTopRightRadius: percentage === 100 ? RADIUS : "0",
            borderBottomRightRadius: percentage === 100 ? RADIUS : "0",
          }}
          width={percentageStr}
        />
        <Box
          component="div"
          sx={{
            pt: RADIUS,
            backgroundColor: BAR_BACKGROUND_COLOR,
            borderTopLeftRadius: percentage === 0 ? RADIUS : "0",
            borderBottomLeftRadius: percentage === 0 ? RADIUS : "0",
            borderTopRightRadius: RADIUS,
            borderBottomRightRadius: RADIUS,
          }}
          width={remainingPercentageStr}
        />
      </Stack>
    </Stack>
  );
}
