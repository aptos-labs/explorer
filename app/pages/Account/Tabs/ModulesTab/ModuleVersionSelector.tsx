import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  type ModulePublishTransaction,
  useGetModulePublishHistory,
} from "../../../../api/hooks/useGetModulePublishHistory";
import {useTranslation} from "../../../../i18n";
import {Link} from "../../../../routing";

interface ModuleVersionSelectorProps {
  address: string;
  selectedVersion: number | undefined;
  onVersionChange: (version: number | undefined) => void;
  diffMode?: boolean;
  onDiffModeToggle?: () => void;
  publishHistory?: ModulePublishTransaction[];
}

function SelectedVersionIndicator({
  selectedVersion,
  onVersionChange,
}: {
  selectedVersion: number;
  onVersionChange: (version: number | undefined) => void;
}) {
  const {t, formatInteger} = useTranslation();
  return (
    <>
      <Box>
        <Chip
          label={t("modules.viewingHistorical", {
            version: formatInteger(selectedVersion),
          })}
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
          {t("staking.viewTransaction")}
        </Typography>
      </Link>
    </>
  );
}

export default function ModuleVersionSelector({
  address,
  selectedVersion,
  onVersionChange,
  diffMode,
  onDiffModeToggle,
}: ModuleVersionSelectorProps) {
  const {t, formatInteger, formatTimestamp} = useTranslation();
  const theme = useTheme();
  const {data: publishHistory, isLoading} = useGetModulePublishHistory(address);
  const hasHistory = publishHistory && publishHistory.length > 0;
  const canCompare = hasHistory && publishHistory.length >= 2;

  if (isLoading && selectedVersion === undefined) {
    return (
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center",
        }}
      >
        <HistoryOutlinedIcon fontSize="small" color="action" />
        <CircularProgress size={16} />
      </Stack>
    );
  }

  if (!hasHistory && selectedVersion !== undefined) {
    return (
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <HistoryOutlinedIcon fontSize="small" color="action" />
        <SelectedVersionIndicator
          selectedVersion={selectedVersion}
          onVersionChange={onVersionChange}
        />
      </Stack>
    );
  }

  if (!hasHistory) {
    return (
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center",
        }}
      >
        <HistoryOutlinedIcon fontSize="small" color="action" />
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
          }}
        >
          {t("modules.versionLatestOnly")}
        </Typography>
      </Stack>
    );
  }

  if (publishHistory.length === 1) {
    return (
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <HistoryOutlinedIcon fontSize="small" color="action" />
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
          }}
        >
          {t("modules.versionLatest")}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
          }}
        >
          {t("modules.onePublish")}
        </Typography>
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
      spacing={1.5}
      sx={{
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <HistoryOutlinedIcon fontSize="small" color="action" />
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
        }}
      >
        {t("modules.versionPrefix")}
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
            spacing={1}
            sx={{
              alignItems: "center",
              width: "100%",
            }}
          >
            <Typography variant="body2">{t("modules.latest")}</Typography>
            <Chip label={t("modules.current")} size="small" color="primary" />
          </Stack>
        </MenuItem>
        {publishHistory.map((txn) => (
          <MenuItem key={txn.version} value={txn.version.toString()}>
            <Stack direction="column">
              <Typography variant="body2">
                {t("modules.versionN", {
                  version: formatInteger(txn.version),
                })}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                }}
              >
                {formatTimestamp(new Date(txn.timestamp))}
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
      {canCompare && onDiffModeToggle && (
        <Button
          size="small"
          variant={diffMode ? "contained" : "outlined"}
          onClick={onDiffModeToggle}
          startIcon={<CompareArrowsIcon />}
          sx={{textTransform: "none", ml: 1}}
        >
          {diffMode ? t("modules.exitDiff") : t("modules.compare")}
        </Button>
      )}
    </Stack>
  );
}
