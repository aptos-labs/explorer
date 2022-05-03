import React from "react";
import {useQuery, UseQueryResult} from "react-query";
import {LedgerInfo} from "../../api_client";
import {getLedgerInfo} from "../../api";
import {parseTimestamp, renderDebug, timestampDisplay} from "../utils";
import {CardContent} from "@mui/material";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import {useGlobalState} from "../../GlobalState";
import {useTheme} from "@mui/material";

function RenderLedgerInfoInner({data}: UseQueryResult<LedgerInfo>) {
  if (!data) return null;

  const moment = parseTimestamp(data.ledgerTimestamp);
  const timestamp_display = timestampDisplay(moment);
  const theme = useTheme();
  return (
    <Grid container spacing={4} direction="row">
      <Grid item xs={12} md={6} lg={2}>
        <Paper sx={{p: 3, height: "100%"}}>
          <Typography variant="subtitle1">Chain ID</Typography>
          <Divider
            variant={theme.palette.mode === "dark" ? "bumpDark" : "bump"}
            sx={{margin: "1em 0 -0.5em"}}
          />
          <Typography component="div" variant="h3" textAlign="left">
            {data.chainId}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Paper sx={{p: 3, height: "100%"}}>
          <Typography variant="subtitle1">Latest Version ID</Typography>
          <Divider
            variant={theme.palette.mode === "dark" ? "bumpDark" : "bump"}
            sx={{margin: "1em 0 -0.5em"}}
          />
          <Typography component="div" variant="h3" textAlign="left">
            {data.ledgerVersion}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} lg={6}>
        <Paper sx={{p: 3, height: "100%"}}>
          <Typography variant="subtitle1">Latest Version Time</Typography>
          <Divider
            variant={theme.palette.mode === "dark" ? "bumpDark" : "bump"}
            sx={{margin: "1em 0 -0.5em"}}
          />
          <Typography component="div" variant="h3" textAlign="left">
            {timestamp_display.local_formatted}
          </Typography>
          <Typography
            variant="subtitle2"
            color="text.primary"
            fontSize="1.25rem"
            component="div"
            textAlign="left"
          ></Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default function RenderLedgerInfo() {
  const [state, _] = useGlobalState();

  const result = useQuery(
    ["ledgerInfo", state.network_value],
    () => getLedgerInfo(state.network_value),
    {
      refetchInterval: 1000,
    },
  );

  return (
    <Grid container spacing={0} direction="column">
      <Grid item>
        <RenderLedgerInfoInner {...result} />
      </Grid>
    </Grid>
  );
}
