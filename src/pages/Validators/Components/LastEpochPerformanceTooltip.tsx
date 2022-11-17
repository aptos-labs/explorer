import * as React from "react";
import {Stack, Typography} from "@mui/material";
import TableTooltip from "../../../components/Table/TableTooltip";
import {CodeLineBox} from "../../../components/CodeLineBox";

export default function LastEpochPerformanceTooltip() {
  return (
    <TableTooltip title="Last Epoch Performance">
      <Stack spacing={2}>
        <Typography variant="body2">
          The Last Epoch Performance column shows the performance of a validator
          in the most recent epoch.
        </Typography>
        <Typography variant="body2">It is calculated as:</Typography>
        <CodeLineBox
          sx={{
            whiteSpace: "normal",
            wordWrap: "break-word",
            fontSize: 13,
            padding: "0.3rem 0.5rem 0.3rem 0.5rem",
            width: "100%",
          }}
        >
          (number of successful proposals) / (number of total proposal
          opportunities)
        </CodeLineBox>
        <Typography variant="body2">
          This metric gives you an early indicator if performance is degrading.
        </Typography>
      </Stack>
    </TableTooltip>
  );
}
