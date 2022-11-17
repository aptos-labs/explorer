import * as React from "react";
import {Stack, Typography} from "@mui/material";
import TableTooltip from "../../../components/Table/TableTooltip";
import {CodeLineBox} from "../../../components/CodeLineBox";

export default function RewardsPerformanceTooltip() {
  return (
    <TableTooltip title="Rewards Performance">
      <Stack spacing={2}>
        <Typography variant="body2">
          This column shows the rewards performance of a validator.
        </Typography>
        <Typography variant="body2">
          It is calculated as a % of reward earned by the validator out of the
          maximum reward earning opportunity i.e.,
        </Typography>
        <CodeLineBox
          sx={{
            whiteSpace: "normal",
            wordWrap: "break-word",
            fontSize: 13,
            padding: "0.3rem 0.5rem 0.3rem 0.5rem",
            width: "100%",
          }}
        >
          (rewards earned across the epochs) / (maximum reward opportunity
          across the epochs)
        </CodeLineBox>
        <Typography variant="body2">
          This is a cumulative metric across all the epochs. A validator can
          improve their performance by improving their proposal success rate.
        </Typography>
      </Stack>
    </TableTooltip>
  );
}
