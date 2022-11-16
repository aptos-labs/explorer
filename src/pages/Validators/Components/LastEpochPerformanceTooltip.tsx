import * as React from "react";
import {Stack, Typography} from "@mui/material";
import TableTooltip from "../../../components/Table/TableTooltip";

export default function LastEpochPerformanceTooltip() {
  return (
    <TableTooltip title="Last Epoch Performance">
      <Stack spacing={2}>
        <Typography>
          This column shows the performance of a validator in last epoch.
        </Typography>
        <Typography>
          It is calculated as (number of successful proposals)/(number of total
          proposal opportunities).
        </Typography>
        <Typography>
          This metric gives you an early indicator if the performance is slowly
          reducing.
        </Typography>
      </Stack>
    </TableTooltip>
  );
}
