import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {useState} from "react";
import {useRpcMonitorStats} from "../api/hooks/useRpcMonitorStats";
import {isRpcMonitorPanelEnabled, resetRpcMonitor} from "../api/rpcMonitor";

export default function RpcMonitorPanel() {
  if (!isRpcMonitorPanelEnabled()) {
    return null;
  }

  return <RpcMonitorPanelContent />;
}

function RpcMonitorPanelContent() {
  const stats = useRpcMonitorStats();
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);

  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        bottom: 72,
        left: 16,
        zIndex: 1400,
        width: expanded ? 420 : 280,
        maxHeight: expanded ? "min(70vh, 520px)" : "auto",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 1,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="subtitle2" sx={{fontWeight: 700}}>
          RPC Monitor
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            aria-label="Reset RPC counters"
            onClick={() => resetRpcMonitor()}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label={open ? "Collapse RPC monitor" : "Expand RPC monitor"}
            onClick={() => setOpen((value) => !value)}
          >
            <CloseIcon
              fontSize="small"
              sx={{transform: open ? "none" : "rotate(45deg)"}}
            />
          </IconButton>
        </Stack>
      </Stack>

      <Collapse in={open}>
        <Box sx={{px: 1.5, py: 1.5}}>
          <Typography variant="h5" sx={{fontWeight: 800, lineHeight: 1.2}}>
            {stats.total}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            total requests
          </Typography>

          <Stack
            direction="row"
            spacing={0.5}
            useFlexGap
            sx={{mt: 1, flexWrap: "wrap"}}
          >
            <Chip size="small" label={`fullnode ${stats.byApi.fullnode}`} />
            <Chip size="small" label={`indexer ${stats.byApi.indexer}`} />
            <Chip size="small" label={`legacy ${stats.bySource.legacy}`} />
            <Chip size="small" label={`sdk ${stats.bySource.sdk}`} />
            {stats.error > 0 && (
              <Chip
                size="small"
                color="error"
                label={`errors ${stats.error}`}
              />
            )}
          </Stack>

          <Typography
            component="button"
            type="button"
            variant="caption"
            color="primary"
            onClick={() => setExpanded((value) => !value)}
            sx={{
              mt: 1,
              border: 0,
              background: "none",
              cursor: "pointer",
              p: 0,
              textAlign: "left",
            }}
          >
            {expanded ? "Hide recent" : "Show recent"}
          </Typography>

          <Collapse in={expanded}>
            <Box
              component="ul"
              sx={{
                m: 0,
                mt: 1,
                pl: 2,
                maxHeight: 280,
                overflow: "auto",
                fontSize: 11,
                fontFamily: "monospace",
              }}
            >
              {stats.recent.slice(0, 20).map((entry) => (
                <Box component="li" key={entry.id} sx={{mb: 0.5}}>
                  #{entry.id} {entry.method} {entry.path}
                  {entry.originMethod ? ` (${entry.originMethod})` : ""} ·{" "}
                  {entry.durationMs.toFixed(0)}ms
                </Box>
              ))}
              {stats.recent.length === 0 && (
                <Typography variant="caption" color="text.secondary">
                  No requests yet
                </Typography>
              )}
            </Box>
          </Collapse>
        </Box>
      </Collapse>
    </Paper>
  );
}
