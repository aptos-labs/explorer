import {Skeleton, Stack} from "@mui/material";
import {useMemo} from "react";
import {useGetEpochTime} from "../../../api/hooks/useGetEpochTime";
import IntervalBar, {IntervalType} from "../../../components/IntervalBar";
import {StyledLearnMoreTooltip} from "../../../components/StyledTooltip";
import {useTranslation} from "../../../i18n";
import {getTimeDiffInMs, parseTimestamp} from "../../utils";
import MetricSection from "./MetricSection";
import Body from "./Text/Body";
import Subtitle from "./Text/Subtitle";

const EPOCH_LEARN_MORE_LINK =
  "https://aptos.dev/en/network/blockchain/staking#epoch";

type EpochProps = {
  isSkeletonLoading: boolean;
};

export default function Epoch({isSkeletonLoading}: EpochProps) {
  const {t, formatInteger} = useTranslation();
  const {curEpoch, lastEpochTime, epochInterval} = useGetEpochTime();

  // Calculate values during render using useMemo to avoid Date.now() during render
  const {percentageComplete, endTimestamp} = useMemo(() => {
    let percentageComplete = 0;
    let endTimestamp = 0;

    if (lastEpochTime !== undefined && epochInterval !== undefined) {
      const epochIntervalSeconds = parseInt(epochInterval, 10) / 1000;
      const startTimestamp = parseTimestamp(lastEpochTime);
      const nowTimestamp = new Date();
      const timePassedMs = getTimeDiffInMs(startTimestamp, nowTimestamp);

      // Once randomness is enabled, epoch will be 2h + DKG time (<30s).
      // No need to reflect this period in explorer.
      const timeRemaining = Math.max(0, epochIntervalSeconds - timePassedMs);
      percentageComplete = Math.min(
        100,
        parseInt(((timePassedMs * 100) / epochIntervalSeconds).toFixed(0), 10),
      );
      // Use nowTimestamp for consistency (already computed above)
      endTimestamp = nowTimestamp.getTime() + timeRemaining;
    }

    return {percentageComplete, endTimestamp};
  }, [lastEpochTime, epochInterval]);
  return !isSkeletonLoading ? (
    <MetricSection>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center",
        }}
      >
        <Subtitle>
          {t("staking.epochN", {
            epoch: formatInteger(Number(curEpoch ?? 0)),
          })}
        </Subtitle>
        <StyledLearnMoreTooltip
          text={t("staking.epochTip")}
          link={EPOCH_LEARN_MORE_LINK}
        />
      </Stack>
      <Body>
        {t("staking.percentComplete", {
          percent: formatInteger(percentageComplete),
        })}
      </Body>
      <IntervalBar
        percentage={percentageComplete}
        timestamp={endTimestamp}
        intervalType={IntervalType.EPOCH}
      />
    </MetricSection>
  ) : (
    <MetricSection>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center",
        }}
      >
        <Skeleton width={140} />
      </Stack>
      <Skeleton width={180} />
      <Skeleton width={180} />
    </MetricSection>
  );
}
