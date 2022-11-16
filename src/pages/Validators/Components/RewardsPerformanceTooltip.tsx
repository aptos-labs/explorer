import * as React from "react";
import {Stack, Typography} from "@mui/material";
import TableTooltip from "../../../components/Table/TableTooltip";

export default function RewardsPerformanceTooltip() {
  return (
    <TableTooltip title="Rewards Performance">
      <Stack spacing={2}>
        <Typography>
          This column shows the rewards performance of a validator.
        </Typography>
        <Typography>
          It is calculated as a % of reward earned by the validator out of the
          maximum reward earning opportunity i.e., (rewards earned across the
          epochs)/(maximum reward opportunity across the epochs).
        </Typography>
        <Typography>
          This is a cumulative metric across all the epochs. A validator can
          improve their performance by improving their proposal success rate.
        </Typography>
      </Stack>
    </TableTooltip>
  );
}
