import * as React from "react";
import {Stack, Typography} from "@mui/material";
import TableTooltip from "../../../components/Table/TableTooltip";
import {CodeLineBox} from "../../Transaction/Tabs/Components/TransactionFunction";

export default function LastEpochPerformanceTooltip() {
  return (
    <TableTooltip title="Last Epoch Performance">
      <Stack spacing={2}>
        <Typography variant="body2">
          This column shows the performance of a validator in last epoch.
        </Typography>
        <Typography variant="body2">It is calculated as</Typography>
        <CodeLineBox
          sx={{
            whiteSpace: "normal",
            wordWrap: "break-word",
            fontSize: "inherit",
            padding: "0.3rem 0.5rem 0.3rem 0.5rem",
            width: "100%",
          }}
        >
          (number of successful proposals) / (number of total proposal
          opportunities)
        </CodeLineBox>
        <Typography variant="body2">
          This metric gives you an early indicator if the performance is slowly
          reducing.
        </Typography>
      </Stack>
    </TableTooltip>
  );
}
