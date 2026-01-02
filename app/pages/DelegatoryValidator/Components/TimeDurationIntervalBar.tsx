import {subHours, subDays} from "date-fns";
import React from "react";
import IntervalBar, {IntervalType} from "../../../components/IntervalBar";
import {Network} from "../../../constants";
import {useNetworkName} from "../../../global-config/GlobalConfig";
import {parseTimestamp} from "../../utils";

export default function TimeDurationIntervalBar({
  timestamp,
}: {
  timestamp?: number;
}) {
  const networkName = useNetworkName();

  if (!timestamp) {
    return null;
  }

  // the end of the unlock cycle
  const unlockTime = parseTimestamp(timestamp.toString());

  // the beginning of the unlock cycle
  const startTime =
    networkName === Network.TESTNET
      ? subHours(unlockTime, 2)
      : subDays(unlockTime, 14);

  // the time already passed in the unlock cycle
  const now = Date.now();
  const alreadyPassedTimeMs = now - startTime.getTime();

  const percentage =
    (alreadyPassedTimeMs / (unlockTime.getTime() - startTime.getTime())) * 100;

  return (
    <IntervalBar
      percentage={percentage}
      timestamp={timestamp * 1000}
      intervalType={IntervalType.UNLOCK_COUNTDOWN}
    />
  );
}
