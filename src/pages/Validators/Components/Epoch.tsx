import React, {useEffect, useState} from "react";
import {useGetEpochTime} from "../../../api/hooks/useGetEpochTime";
import MetricSection from "./MetricSection";
import Subtitle from "./Text/Subtitle";
import Body from "./Text/Body";
import moment from "moment";
import {parseTimestamp} from "../../utils";
import {Stack, Skeleton} from "@mui/material";
import {StyledLearnMoreTooltip} from "../../../components/StyledTooltip";
import IntervalBar from "../../../components/IntervalBar";

const EPOCH_TOOLTIP_TEXT =
  "An epoch in the Aptos blockchain is defined as a duration of time, in seconds, during which a number of blocks are voted on by the validators. The Aptos mainnet epoch is set as 7200 seconds (two hours).";
const EPOCH_LEARN_MORE_LINK = "https://aptos.dev/concepts/staking#epoch";

type EpochProps = {
  isSkeletonLoading: boolean;
};

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
        if (epochIntervalInMin <= timePassedInMin) {
          window.location.reload();
        }
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
      <IntervalBar
        percentage={percentageComplete}
        content={`${percentageComplete}% complete`}
      />
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
