import React, {useEffect, useState} from "react";
import {useGetEpochTime} from "../../../api/hooks/useGetEpochTime";
import MetricSection from "./MetricSection";
import Subtitle from "./Text/Subtitle";
import Body from "./Text/Body";
import moment from "moment";
import {parseTimestamp} from "../../utils";
import {Typography, Stack, useTheme} from "@mui/material";
import {grey} from "../../../themes/colors/aptosColorPalette";

const BAR_COLOR = "#818CF8";
const BAR_BACKGROUND_COLOR = "rgb(129, 140, 248, 0.4)";

function EpochIntervalBar({percentage}: {percentage: number}) {
  const theme = useTheme();
  return (
    <Stack direction="row" width={172} height={16}>
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
            sx={{fontSize: 8.5, fontWeight: 600}}
            marginX={0.5}
          >{`${percentage}% passed`}</Typography>
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
            sx={{fontSize: 8.5, fontWeight: 600}}
            marginX={0.5}
          >{`${100 - percentage}% remaining`}</Typography>
        )}
      </Stack>
    </Stack>
  );
}

export default function Epoch() {
  const [timeRemainingInMin, setTimeRemainingInMin] = useState<string>();
  const [percentageCompleted, setPercentageCompleted] = useState<number>(0);
  const {curEpoch, lastEpochTime, epochInterval} = useGetEpochTime();

  useEffect(() => {
    const refresh = () => {
      if (lastEpochTime !== undefined && epochInterval !== undefined) {
        const startTimestamp = parseTimestamp(lastEpochTime);
        const nowTimestamp = parseTimestamp(moment.now().toString());
        const timePassed = moment.duration(nowTimestamp.diff(startTimestamp));
        const timePassedInMin = timePassed.asMinutes();
        const epochIntervalInMin = moment
          .duration(parseInt(epochInterval) / 1000, "milliseconds")
          .asMinutes();

        const timeRemaining = (epochIntervalInMin - timePassedInMin).toFixed(0);
        setTimeRemainingInMin(timeRemaining);

        const percentage = (
          (timePassedInMin * 100) /
          epochIntervalInMin
        ).toFixed(0);
        setPercentageCompleted(parseInt(percentage));
      }
    };

    refresh();
    setInterval(refresh, 60 * 1000); // refresh every minute
  }, [curEpoch, lastEpochTime, epochInterval]);

  return (
    <MetricSection>
      <Subtitle>{`Epoch ${curEpoch}`}</Subtitle>
      <Body>{`${timeRemainingInMin} minutes remaining`}</Body>
      <EpochIntervalBar percentage={percentageCompleted} />
    </MetricSection>
  );
}
