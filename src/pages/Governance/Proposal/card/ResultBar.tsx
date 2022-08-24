import React from "react";
import {Stack, Box, Typography, Tooltip} from "@mui/material";
import {
  primaryColor,
  negativeColor,
  voteFor,
  voteAgainst,
} from "../../constants";
import {useTheme} from "@mui/material/styles";
import {grey} from "../../../../themes/colors/aptosColorPalette";

const RADIUS = "0.7em";

function getFormattedVotesStr(votes: string): string {
  return parseInt(votes).toLocaleString("en-US");
}

type ResultBarProps = {
  shouldPass: boolean;
  votes: string;
  percentage: number;
};

export default function ResultBar({
  shouldPass,
  votes,
  percentage,
}: ResultBarProps) {
  const theme = useTheme();

  const barColor = shouldPass ? primaryColor : negativeColor;

  const percentageStr = `${percentage.toFixed(0)}%`;
  const remainingPercentageStr = `${(100 - percentage).toFixed(0)}%`;

  return (
    <Tooltip title={`${getFormattedVotesStr(votes)} votes`} placement="left">
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
              backgroundColor:
                theme.palette.mode === "dark" ? grey[800] : grey[200],
              borderTopLeftRadius: percentage === 0 ? RADIUS : "0",
              borderBottomLeftRadius: percentage === 0 ? RADIUS : "0",
              borderTopRightRadius: RADIUS,
              borderBottomRightRadius: RADIUS,
            }}
            width={remainingPercentageStr}
          />
        </Stack>
      </Stack>
    </Tooltip>
  );
}
