import React, {useMemo} from "react";
import {useGetEpochTime} from "../../../api/hooks/useGetEpochTime";
import MetricSection from "./MetricSection";
import Subtitle from "./Text/Subtitle";
import Body from "./Text/Body";
import moment from "moment";
import {parseTimestamp} from "../../utils";
import {Stack, Skeleton} from "@mui/material";
import {StyledLearnMoreTooltip} from "../../../components/StyledTooltip";
import IntervalBar, {IntervalType} from "../../../components/IntervalBar";

const EPOCH_TOOLTIP_TEXT =
  "An epoch in the Aptos blockchain is defined as a duration of time, in seconds, during which a number of blocks are voted on by the validators. The Aptos mainnet epoch is set as 7200 seconds (two hours).";
const EPOCH_LEARN_MORE_LINK =
  "https://aptos.dev/en/network/blockchain/staking#epoch";

type EpochProps = {
  isSkeletonLoading: boolean;
};

export default function Epoch({isSkeletonLoading}: EpochProps) {
  const {curEpoch, lastEpochTime, epochInterval} = useGetEpochTime();

  // Calculate values during render using useMemo to avoid Date.now() during render
  const {percentageComplete, endTimestamp} = useMemo(() => {
    let percentageComplete = 0;
    let endTimestamp = 0;

    if (lastEpochTime !== undefined && epochInterval !== undefined) {
      const epochIntervalSeconds = parseInt(epochInterval) / 1000;
      const startTimestamp = parseTimestamp(lastEpochTime);
      const nowTimestamp = parseTimestamp(moment.now().toString());
      const timePassed = moment.duration(nowTimestamp.diff(startTimestamp));

      // Once randomness is enabled, epoch will be 2h + DKG time (<30s).
      // No need to reflect this period in explorer.
      const timeRemaining = Math.max(
        0,
        epochIntervalSeconds - timePassed.asMilliseconds(),
      );
      percentageComplete = Math.min(
        100,
        parseInt(
          ((timePassed.asMilliseconds() * 100) / epochIntervalSeconds).toFixed(
            0,
          ),
        ),
      );
      // eslint-disable-next-line react-hooks/purity
      endTimestamp = Date.now() + timeRemaining;
    }

    return {percentageComplete, endTimestamp};
  }, [lastEpochTime, epochInterval]);
  return !isSkeletonLoading ? (
    <MetricSection>
      <Stack direction="row" spacing={1} alignItems="center">
        <Subtitle>{`Epoch ${curEpoch}`}</Subtitle>
        <StyledLearnMoreTooltip
          text={EPOCH_TOOLTIP_TEXT}
          link={EPOCH_LEARN_MORE_LINK}
        />
      </Stack>
      <Body>{`${percentageComplete}% complete`}</Body>
      <IntervalBar
        percentage={percentageComplete}
        timestamp={endTimestamp}
        intervalType={IntervalType.EPOCH}
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
