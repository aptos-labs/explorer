import moment from "moment";
import React from "react";
import IntervalBar from "../../../components/IntervalBar";
import {parseTimestamp, timestampDisplay} from "../../utils";

export default function TimeDurationIntervalBar({
  timestamp,
}: {
  timestamp?: number;
}) {
  if (!timestamp) {
    return null;
  }

  // the beginning of the unlock cycle
  const startTime = parseTimestamp(timestamp.toString()).subtract(30, "days");

  // the end of the unlock cycle
  const unlockTime = parseTimestamp(timestamp.toString());

  // the remaining time of the unlock cycle
  const now = moment();
  const remainingTime = moment.duration(
    unlockTime.valueOf() - now.valueOf(),
    "milliseconds",
  );

  // the time already passed in the unlock cycle
  const alreadyPassedTime = moment.duration(
    now.valueOf() - startTime.valueOf(),
    "milliseconds",
  );

  const remainingTimeDisplay = timestampDisplay(
    moment(remainingTime.as("milliseconds")),
  );

  const percentage =
    (alreadyPassedTime.as("milliseconds") /
      (unlockTime.valueOf() - startTime.valueOf())) *
    100;

  return (
    <IntervalBar
      percentage={percentage}
      content={remainingTimeDisplay.formatted_time_duration}
    />
  );
}
