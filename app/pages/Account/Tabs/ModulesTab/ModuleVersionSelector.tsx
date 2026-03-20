import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import {
  Box,
  Chip,
  CircularProgress,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {useGetModulePublishHistory} from "../../../../api/hooks/useGetModulePublishHistory";
import {Link} from "../../../../routing";

interface ModuleVersionSelectorProps {
  address: string;
  selectedVersion: number | undefined;
  onVersionChange: (version: number | undefined) => void;
}

const utcFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return `${utcFormatter.format(date)} UTC`;
}

function SelectedVersionIndicator({
  selectedVersion,
  onVersionChange,
}: {
  selectedVersion: number;
  onVersionChange: (version: number | undefined) => void;
}) {
  return (
    <>
      <Box>
        <Chip
          label={`Viewing historical version ${selectedVersion.toLocaleString()}`}
          color="warning"
          size="small"
          variant="outlined"
          onDelete={() => onVersionChange(undefined)}
        />
      </Box>
      <Link to={`/txn/${selectedVersion}`} style={{textDecoration: "none"}}>
        <Typography
          variant="caption"
          color="primary"
          sx={{cursor: "pointer", "&:hover": {textDecoration: "underline"}}}
        >
          View Transaction
        </Typography>
      </Link>
    </>
  );
}

export default function ModuleVersionSelector({
  address,
  selectedVersion,
  onVersionChange,
}: ModuleVersionSelectorProps) {
  const theme = useTheme();
  const {data: publishHistory, isLoading} = useGetModulePublishHistory(address);
  const hasHistory = publishHistory && publishHistory.length > 0;

  if (isLoading && selectedVersion === undefined) {
    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        <HistoryOutlinedIcon fontSize="small" color="action" />
        <CircularProgress size={16} />
      </Stack>
    );
  }

  if (!hasHistory && selectedVersion === undefined) {
    return null;
  }

  if (!hasHistory && selectedVersion !== undefined) {
    return (
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{flexWrap: "wrap"}}
      >
        <HistoryOutlinedIcon fontSize="small" color="action" />
        <SelectedVersionIndicator
          selectedVersion={selectedVersion}
          onVersionChange={onVersionChange}
        />
      </Stack>
    );
  }

  const handleChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    onVersionChange(value === "latest" ? undefined : Number(value));
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{flexWrap: "wrap"}}
    >
      <HistoryOutlinedIcon fontSize="small" color="action" />
      <Typography variant="body2" color="text.secondary">
        Version:
      </Typography>
      <Select
        size="small"
        value={selectedVersion?.toString() ?? "latest"}
        onChange={handleChange}
        sx={{
          minWidth: 280,
          fontSize: "0.875rem",
          bgcolor: theme.palette.background.paper,
        }}
      >
        <MenuItem value="latest">
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{width: "100%"}}
          >
            <Typography variant="body2">Latest</Typography>
            <Chip label="current" size="small" color="primary" />
          </Stack>
        </MenuItem>
        {publishHistory?.map((txn) => (
          <MenuItem key={txn.version} value={txn.version.toString()}>
            <Stack direction="column">
              <Typography variant="body2">
                Version {txn.version.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatTimestamp(txn.timestamp)}
              </Typography>
            </Stack>
          </MenuItem>
        ))}
      </Select>
      {selectedVersion !== undefined && (
        <SelectedVersionIndicator
          selectedVersion={selectedVersion}
          onVersionChange={onVersionChange}
        />
      )}
    </Stack>
  );
}
