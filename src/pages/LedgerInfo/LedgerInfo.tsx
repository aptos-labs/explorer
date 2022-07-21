import React from "react";
import {useQuery, UseQueryResult} from "react-query";
import {Types} from "aptos";
import {getLedgerInfo} from "../../api";
import {parseTimestamp, timestampDisplay} from "../utils";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import {useGlobalState} from "../../GlobalState";
import {useTheme} from "@mui/material";
import CardOutline from "../../components/CardOutline";

function RenderLedgerInfoInner({data}: UseQueryResult<Types.LedgerInfo>) {
  if (!data) return null;

  const moment = parseTimestamp(data.ledger_timestamp);
  const timestamp_display = timestampDisplay(moment);
  const theme = useTheme();
  return (
    
    
    <Grid container spacing={4} direction="row" sx={{ alignContent: "flex-start", mb: 8 }}>
      <Grid item xs={12} md={6} lg={2}>
        <CardOutline>
          <Typography variant="subtitle1">Chain ID</Typography>
          <Divider
            variant={theme.palette.mode === "dark" ? "bumpDark" : "bump"}
            sx={{margin: "1em 0 -0.5em"}}
          />
          <Typography component="div" variant="h4" textAlign="left" sx={{ fontFamily: 'lft-etica-mono' }}>
            {data.chain_id}
          </Typography>
         </CardOutline>
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <CardOutline>
          <Typography variant="subtitle1">Latest Version ID</Typography>
          <Divider
            variant={theme.palette.mode === "dark" ? "bumpDark" : "bump"}
            sx={{margin: "1em 0 -0.5em"}}
          />
          <Typography component="div" variant="h4" textAlign="left" sx={{ fontFamily: 'lft-etica-mono'}}>
            {data.ledger_version}
          </Typography>
        </CardOutline>
      </Grid>
      <Grid item xs={12} lg={6}>
        <CardOutline>
          <Typography variant="subtitle1">Latest Version Time</Typography>
          <Divider
            variant={theme.palette.mode === "dark" ? "bumpDark" : "bump"}
            sx={{margin: "1em 0 -0.5em"}}
          />
          <Typography component="div" variant="h4" textAlign="left" sx={{ fontFamily: 'lft-etica-mono' }}>
            {timestamp_display.local_formatted}
          </Typography>
        </CardOutline>
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
    <RenderLedgerInfoInner {...result} />
  );
}
