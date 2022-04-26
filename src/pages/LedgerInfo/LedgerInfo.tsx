import React from "react";
import {LedgerInfo} from "../../api_client";
import {SafeRequestComponent} from "../../components/RequestComponent";
import {getLedgerInfo} from "../../api";
import {parseTimestamp, renderDebug, timestampDisplay} from "../utils";
import {CardContent} from "@mui/material";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Title from "../../components/Title";
import Divider from "@mui/material/Divider";
import {useGlobalState} from "../../GlobalState";


function RenderLedgerInfoInner({data}: { data?: LedgerInfo }) {
  if (!data)
    return null;

  const moment = parseTimestamp(data.ledgerTimestamp);
  const timestamp_display = timestampDisplay(moment);
  return (
    <Grid container spacing={2} direction="row">
      <CardContent sx={{flex: "1 0 auto", p: 3}}>
        <Typography variant="subtitle1" color="text.secondary" component="div" textAlign="center">
          Chain ID
        </Typography>
        <Typography component="div" variant="h5" textAlign="center">
          {data.chainId}
        </Typography>
      </CardContent>

      <Divider orientation="vertical" flexItem/>

      <CardContent sx={{flex: "1 0 auto", p: 3}}>
        <Typography variant="subtitle1" color="text.secondary" component="div" textAlign="center">
          Latest Version Number
        </Typography>
        <Typography component="div" variant="h5" textAlign="center">
          {data.ledgerVersion}
        </Typography>
      </CardContent>

      <Divider orientation="vertical" flexItem/>

      <CardContent sx={{flex: "1 0 auto", p: 3}}>
        <Typography variant="subtitle1" color="text.secondary" component="div" textAlign="center">
          Latest Version Time
        </Typography>
        <Typography component="div" variant="h5" textAlign="center">
          {timestamp_display.local_formatted}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" component="div" textAlign="center">
          {timestamp_display.formatted_time_delta}
        </Typography>
      </CardContent>

    </Grid>
  );
}

let eventSource: EventSource | null = null;

export default function RenderLedgerInfo() {
  const [state, _] = useGlobalState();

  const [ledgerInfo, setLedgerInfo] = React.useState<LedgerInfo | undefined>(undefined);

  React.useEffect(() => {
    if (eventSource != null) {
      eventSource.close();
    }

    eventSource = new EventSource(`${state.network_value}/sse`);
    eventSource.onmessage = (event) => {
      if (event.data && typeof event.data === 'string') {
        const data = JSON.parse(event.data);
        if (typeof data.chain_id == 'number' && typeof data.ledger_version === 'string' && typeof data.ledger_timestamp === 'string') {
          const ledgerInfo: LedgerInfo = {
            chainId: data.chain_id,
            ledgerVersion: data.ledger_version,
            ledgerTimestamp: data.ledger_timestamp,
          }
          setLedgerInfo(ledgerInfo);
        }
      }
    };

    return () => {
      eventSource?.close();
    }
  }, [state.network_value]);

  return (
    <Paper sx={{p: 2}}>
      <Grid container spacing={2} direction="column">
        <Grid item>
          <Title>Ledger Info</Title>
        </Grid>
        <Grid item>
          <RenderLedgerInfoInner data={ledgerInfo}/>
        </Grid>
      </Grid>
    </Paper>
  );
}
