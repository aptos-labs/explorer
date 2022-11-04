import * as React from "react";
import {Box, Stack, Typography} from "@mui/material";
import TableTooltip from "../../../components/Table/TableTooltip";
import RewardsPerformanceIcon from "./RewardsPerformanceIcon";

export default function RewardsPerformanceTooltip() {
  return (
    <TableTooltip title="Rewards Performance">
      <Stack spacing={2}>
        <Box>
          <Typography>Cumulative range: 0% - 100%.</Typography>
        </Box>
        <Box sx={{display: "flex", alignItems: "flex-start", gap: 2}}>
          <RewardsPerformanceIcon rewardsGrowth={80} />
          <Typography variant="subtitle2" fontWeight={600}>
            Above 80%
          </Typography>
        </Box>
        <Box sx={{display: "flex", alignItems: "flex-start", gap: 2}}>
          <RewardsPerformanceIcon rewardsGrowth={75} />
          <Typography variant="subtitle2" fontWeight={600}>
            Between 75% & 80%
          </Typography>
        </Box>
        <Box sx={{display: "flex", alignItems: "flex-start", gap: 2}}>
          <RewardsPerformanceIcon rewardsGrowth={0} />
          <Typography variant="subtitle2" fontWeight={600}>
            Below 75%
          </Typography>
        </Box>
      </Stack>
    </TableTooltip>
  );
}
