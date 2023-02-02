import moment from "moment";
import React, {useEffect, useState} from "react";
import IntervalBar from "../../../components/IntervalBar";
import {parseTimestamp, timestampDisplay} from "../../utils";

const REFRESH_IN_MS = 60000;

export default function TimeDurationIntervalBar({
  timestamp,
}: {
  timestamp?: number;
}) {
  if (!timestamp) {
    return null;
  }

  const [remainingTime, setRemainingTime] = useState<moment.Duration>();
  const [percentageComplete, setPercentageComplete] = useState<number>(0);

  // the beginning of the unlock cycle
  const startTime = parseTimestamp(timestamp.toString()).subtract(30, "days");

  // the end of the unlock cycle
  const unlockTime = parseTimestamp(timestamp.toString());

  useEffect(() => {
    const interval = setInterval(() => {
      // the remaining time of the unlock cycle
      const now = moment();
      const remainingTime = moment.duration(
        unlockTime.valueOf() - now.valueOf(),
        "milliseconds",
      );
      setRemainingTime(remainingTime);

      // the time already passed in the unlock cycle
      const alreadyPassedTime = moment.duration(
        now.valueOf() - startTime.valueOf(),
        "milliseconds",
      );

      const percentage =
        (alreadyPassedTime.asMilliseconds() /
          (unlockTime.valueOf() - startTime.valueOf())) *
        100;
      setPercentageComplete(percentage);
    }, REFRESH_IN_MS);

    const remainingTimeInMS = remainingTime?.asMilliseconds();

    if (remainingTimeInMS !== undefined && remainingTimeInMS <= 0) {
      window.location.reload();
    }

    // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    return () => clearInterval(interval);
  }, [remainingTime, percentageComplete]);

  const remainingTimeDisplay = timestampDisplay(
    moment(remainingTime?.asMilliseconds()),
  );

  return (
    <IntervalBar
      percentage={percentageComplete}
      content={remainingTimeDisplay.formatted_time_duration}
    />
  );
}
