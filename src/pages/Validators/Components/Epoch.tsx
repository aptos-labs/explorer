import React, {useEffect, useState} from "react";
import {useGetEpochTime} from "../../../api/hooks/useGetEpochTime";
import MetricSection from "./MetricSection";
import Subtitle from "./Text/Subtitle";
import Body from "./Text/Body";
import moment from "moment";
import {parseTimestamp} from "../../utils";
import {Typography, Stack, useTheme, Skeleton} from "@mui/material";
import {grey} from "../../../themes/colors/aptosColorPalette";
import {StyledLearnMoreTooltip} from "../../../components/StyledTooltip";

export const BAR_COLOR = "#818CF8";
export const BAR_BACKGROUND_COLOR = "rgb(129, 140, 248, 0.4)";

const EPOCH_TOOLTIP_TEXT =
  "An epoch in the Aptos blockchain is defined as a duration of time, in seconds, during which a number of blocks are voted on by the validators. The Aptos mainnet epoch is set as 7200 seconds (two hours).";
const EPOCH_LEARN_MORE_LINK = "https://aptos.dev/concepts/staking#epoch";

type EpochProps = {
  isSkeletonLoading: boolean;
};

function EpochIntervalBar({percentage}: {percentage: number}) {
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
          >{`${percentage}% complete`}</Typography>
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
          >{`${percentage}% complete`}</Typography>
        )}
      </Stack>
    </Stack>
  );
}

export default function Epoch({isSkeletonLoading}: EpochProps) {
  const [timeRemainingInMin, setTimeRemainingInMin] = useState<string>();
  const [percentageComplete, setPercentageComplete] = useState<number>(0);
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
        setPercentageComplete(parseInt(percentage));
      }
    };

    refresh();
    const refreshInterval = setInterval(refresh, 60 * 1000); // refresh every minute

    if (timeRemainingInMin !== undefined && parseInt(timeRemainingInMin) <= 0) {
      clearInterval(refreshInterval);
    }
  }, [curEpoch, lastEpochTime, epochInterval]);
  return !isSkeletonLoading ? (
    <MetricSection>
      <Stack direction="row" spacing={1} alignItems="center">
        <Subtitle>{`Epoch ${curEpoch}`}</Subtitle>
        <StyledLearnMoreTooltip
          text={EPOCH_TOOLTIP_TEXT}
          link={EPOCH_LEARN_MORE_LINK}
        />
      </Stack>
      <Body>{`${timeRemainingInMin} Minutes Remaining`}</Body>
      <EpochIntervalBar percentage={percentageComplete} />
    </MetricSection>
  ) : (
    <MetricSection>
      <Stack direction="row" spacing={1} alignItems="center">
        <Skeleton width={140} />
      </Stack>
      <Skeleton width={180} />
      <Skeleton width={180} />
    </MetricSection>
  );
}
