import {MenuItem} from "@mui/material";
import Select, {type SelectChangeEvent} from "@mui/material/Select";
import {useTranslation} from "../../../i18n";

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
  const {t} = useTranslation();
  const handleChange = (event: SelectChangeEvent) => {
    setDays(parseInt(event.target.value, 10));
  };

  return (
    <Select
      value={days.toString()}
      onChange={handleChange}
      size="small"
      sx={{width: 180, fontSize: 15, textTransform: "capitalize"}}
    >
      <MenuItem value={ChartRangeDays.DEFAULT_RANGE}>
        {t("analytics.last7Days")}
      </MenuItem>
      <MenuItem value={ChartRangeDays.FULL_RANGE}>
        {t("analytics.last30Days")}
      </MenuItem>
    </Select>
  );
}
