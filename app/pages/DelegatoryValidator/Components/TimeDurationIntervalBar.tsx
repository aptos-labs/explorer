import moment from "moment";
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

  // the beginning of the unlock cycle
  const startTime =
    networkName === Network.TESTNET
      ? parseTimestamp(timestamp.toString()).subtract(2, "hours")
      : parseTimestamp(timestamp.toString()).subtract(14, "days");

  // the end of the unlock cycle
  const unlockTime = parseTimestamp(timestamp.toString());

  // the time already passed in the unlock cycle
  const alreadyPassedTime = moment.duration(
    moment().valueOf() - startTime.valueOf(),
    "milliseconds",
  );

  const percentage =
    (alreadyPassedTime.asMilliseconds() /
      (unlockTime.valueOf() - startTime.valueOf())) *
    100;

  return (
    <IntervalBar
      percentage={percentage}
      timestamp={timestamp * 1000}
      intervalType={IntervalType.UNLOCK_COUNTDOWN}
    />
  );
}
