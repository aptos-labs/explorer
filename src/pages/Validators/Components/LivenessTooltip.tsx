import * as React from "react";
import {Box, Stack, Typography} from "@mui/material";
import TableTooltip from "../../../components/Table/TableTooltip";
import LivenessIcon from "./LivenessIcon";

function Liveness({isLive}: {isLive: boolean}) {
  return (
    <Box sx={{display: "flex", alignItems: "flex-start", gap: 2}}>
      <LivenessIcon isLive={isLive} />
      <Stack spacing={0.5}>
        <Typography variant="subtitle2" fontWeight={600}>
          {isLive ? "Live" : "Not Live"}
        </Typography>
        <Typography variant="body2">
          {isLive ? (
            <>
              <div>Push metrics to Aptos telemetry.</div>
              <div>Connected to Aptos node.</div>
            </>
          ) : null}
        </Typography>
      </Stack>
    </Box>
  );
}

export default function LivenessTooltip() {
  return (
    <TableTooltip title="Liveness">
      <Stack spacing={2}>
        <Box>
          <Typography>Updated hourly.</Typography>
          <Typography>Cumulative range: 0% - 100%.</Typography>
        </Box>
        <Liveness isLive={true} />
        <Liveness isLive={false} />
      </Stack>
    </TableTooltip>
  );
}
