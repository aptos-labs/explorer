import * as React from "react";
import {Stack} from "@mui/material";
import TableTooltip from "../../../components/Table/TableTooltip";
import {CodeLineBox} from "../../../components/CodeLineBox";
import TooltipTypography from "../../../components/TooltipTypography";

export default function RewardsPerformanceTooltip() {
  return (
    <TableTooltip title="Rewards Performance">
      <Stack spacing={2}>
        <TooltipTypography variant="body2">
          The Rewards Performance column shows the rewards percent of a
          validator based upon proposal success.
        </TooltipTypography>
        <TooltipTypography variant="body2">
          It is calculated as a % of reward earned by the validator out of the
          maximum reward earning opportunity:
        </TooltipTypography>
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
        <TooltipTypography variant="body2">
          This is a cumulative metric across all epochs. Validators can improve
          their performance by improving their proposal success rate.
        </TooltipTypography>
      </Stack>
    </TableTooltip>
  );
}
