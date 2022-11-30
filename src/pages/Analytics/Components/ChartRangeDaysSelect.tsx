import * as React from "react";
import {MenuItem} from "@mui/material";
import Select, {SelectChangeEvent} from "@mui/material/Select";

export enum ChartRangeDays {
  DEFAULT_RANGE = 7,
  FULL_RANGE = 30,
}

type ChartRangeDaysSelectProps = {
  days: ChartRangeDays;
  setDays: (days: ChartRangeDays) => void;
};

export default function ChartRangeDaysSelect({
  days,
  setDays,
}: ChartRangeDaysSelectProps) {
  const handleChange = (event: SelectChangeEvent) => {
    setDays(parseInt(event.target.value));
  };

  return (
    <Select
      value={days.toString()}
      onChange={handleChange}
      size="small"
      sx={{width: 180, fontSize: 15}}
    >
      <MenuItem value={ChartRangeDays.DEFAULT_RANGE}>Last 7 Days</MenuItem>
      <MenuItem value={ChartRangeDays.FULL_RANGE}>Last 30 Days</MenuItem>
    </Select>
  );
}
