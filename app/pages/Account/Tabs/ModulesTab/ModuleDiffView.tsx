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
import {diffLines} from "diff";
import {useMemo} from "react";
import {useGetAccountPackages} from "../../../../api/hooks/useGetAccountResource";
import type {ModulePublishTransaction} from "../../../../api/hooks/useGetModulePublishHistory";
import {transformCode} from "../../../../utils";

interface ModuleDiffViewProps {
  address: string;
  moduleName: string;
  publishHistory: ModulePublishTransaction[];
  baseVersion: number | undefined;
  compareVersion: number | undefined;
  onBaseVersionChange: (version: number | undefined) => void;
  onCompareVersionChange: (version: number | undefined) => void;
}

function VersionSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: number | undefined;
  onChange: (version: number | undefined) => void;
  options: ModulePublishTransaction[];
}) {
  const theme = useTheme();

  const handleChange = (event: SelectChangeEvent<string>) => {
    const val = event.target.value;
    onChange(val === "latest" ? undefined : Number(val));
  };

  return (
    <Stack direction="column" spacing={0.5} sx={{minWidth: 240}}>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Select
        size="small"
        value={value?.toString() ?? "latest"}
        onChange={handleChange}
        sx={{
          fontSize: "0.8125rem",
          bgcolor: theme.palette.background.paper,
        }}
      >
        <MenuItem value="latest">
          <Typography variant="body2">Latest</Typography>
        </MenuItem>
        {options.map((txn) => (
          <MenuItem key={txn.version} value={txn.version.toString()}>
            <Typography variant="body2">
              v{txn.version.toLocaleString()}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </Stack>
  );
}

type DiffLine = {
  type: "added" | "removed" | "unchanged";
  content: string;
  oldLineNumber: number | null;
  newLineNumber: number | null;
};

function computeDiffLines(oldText: string, newText: string): DiffLine[] {
  const changes = diffLines(oldText, newText);
  const result: DiffLine[] = [];
  let oldLine = 1;
  let newLine = 1;

  for (const change of changes) {
    const lines = change.value.replace(/\n$/, "").split("\n");
    for (const line of lines) {
      if (change.added) {
        result.push({
          type: "added",
          content: line,
          oldLineNumber: null,
          newLineNumber: newLine++,
        });
      } else if (change.removed) {
        result.push({
          type: "removed",
          content: line,
          oldLineNumber: oldLine++,
          newLineNumber: null,
        });
      } else {
        result.push({
          type: "unchanged",
          content: line,
          oldLineNumber: oldLine++,
          newLineNumber: newLine++,
        });
      }
    }
  }
  return result;
}

function DiffRenderer({diffLines}: {diffLines: DiffLine[]}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const colors = {
    added: {
      bg: isDark ? "rgba(46, 160, 67, 0.15)" : "rgba(46, 160, 67, 0.10)",
      gutter: isDark ? "rgba(46, 160, 67, 0.30)" : "rgba(46, 160, 67, 0.25)",
    },
    removed: {
      bg: isDark ? "rgba(248, 81, 73, 0.15)" : "rgba(248, 81, 73, 0.10)",
      gutter: isDark ? "rgba(248, 81, 73, 0.30)" : "rgba(248, 81, 73, 0.25)",
    },
    unchanged: {
      bg: "transparent",
      gutter: "transparent",
    },
  };

  return (
    <Box
      component="pre"
      sx={{
        margin: 0,
        fontFamily: '"Fira Code", "Roboto Mono", monospace',
        fontSize: "0.8125rem",
        lineHeight: 1.6,
        overflow: "auto",
        maxHeight: "70vh",
      }}
    >
      {diffLines.map((line) => {
        const key = `${line.type}-${line.oldLineNumber ?? "n"}-${line.newLineNumber ?? "n"}`;
        return (
          <Box
            key={key}
            sx={{
              display: "flex",
              backgroundColor: colors[line.type].bg,
              "&:hover": {backgroundColor: isDark ? "#2d333b" : "#f0f0f0"},
            }}
          >
            <Box
              component="span"
              sx={{
                width: 48,
                textAlign: "right",
                pr: 1,
                pl: 0.5,
                color: "text.disabled",
                userSelect: "none",
                flexShrink: 0,
                backgroundColor: colors[line.type].gutter,
              }}
            >
              {line.oldLineNumber ?? ""}
            </Box>
            <Box
              component="span"
              sx={{
                width: 48,
                textAlign: "right",
                pr: 1,
                color: "text.disabled",
                userSelect: "none",
                flexShrink: 0,
                backgroundColor: colors[line.type].gutter,
              }}
            >
              {line.newLineNumber ?? ""}
            </Box>
            <Box
              component="span"
              sx={{
                width: 20,
                textAlign: "center",
                color:
                  line.type === "added"
                    ? "success.main"
                    : line.type === "removed"
                      ? "error.main"
                      : "text.disabled",
                userSelect: "none",
                flexShrink: 0,
                fontWeight: 700,
              }}
            >
              {line.type === "added"
                ? "+"
                : line.type === "removed"
                  ? "-"
                  : " "}
            </Box>
            <Box component="span" sx={{flex: 1, whiteSpace: "pre-wrap"}}>
              {line.content}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export default function ModuleDiffView({
  address,
  moduleName,
  publishHistory,
  baseVersion,
  compareVersion,
  onBaseVersionChange,
  onCompareVersionChange,
}: ModuleDiffViewProps) {
  const theme = useTheme();

  const basePackages = useGetAccountPackages(address, baseVersion);
  const comparePackages = useGetAccountPackages(address, compareVersion);

  const baseSource = useMemo(() => {
    const mod = basePackages
      .flatMap((pkg) => pkg.modules)
      .find((m) => m.name === moduleName);
    if (!mod?.source || mod.source === "0x") return "";
    return transformCode(mod.source);
  }, [basePackages, moduleName]);

  const compareSource = useMemo(() => {
    const mod = comparePackages
      .flatMap((pkg) => pkg.modules)
      .find((m) => m.name === moduleName);
    if (!mod?.source || mod.source === "0x") return "";
    return transformCode(mod.source);
  }, [comparePackages, moduleName]);

  const isLoading = basePackages.length === 0 || comparePackages.length === 0;
  const baseLabel = baseVersion ? `v${baseVersion.toLocaleString()}` : "Latest";
  const compareLabel = compareVersion
    ? `v${compareVersion.toLocaleString()}`
    : "Latest";

  const diff = useMemo(
    () => computeDiffLines(baseSource, compareSource),
    [baseSource, compareSource],
  );

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    for (const line of diff) {
      if (line.type === "added") added++;
      if (line.type === "removed") removed++;
    }
    return {added, removed};
  }, [diff]);

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="flex-end" flexWrap="wrap">
        <VersionSelect
          label="Base (old)"
          value={baseVersion}
          onChange={onBaseVersionChange}
          options={publishHistory}
        />
        <Typography variant="body2" sx={{pb: 1}} color="text.secondary">
          vs
        </Typography>
        <VersionSelect
          label="Compare (new)"
          value={compareVersion}
          onChange={onCompareVersionChange}
          options={publishHistory}
        />
      </Stack>

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={24} />
        </Box>
      ) : baseSource === compareSource ? (
        <Box
          p={3}
          bgcolor={theme.palette.background.paper}
          borderRadius={1}
          textAlign="center"
        >
          <Typography color="text.secondary">
            No differences between {baseLabel} and {compareLabel} for module{" "}
            <strong>{moduleName}</strong>
          </Typography>
        </Box>
      ) : (
        <Box bgcolor={theme.palette.background.paper} borderRadius={1}>
          <Stack
            direction="row"
            spacing={1}
            p={1.5}
            alignItems="center"
            sx={{
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              {moduleName}
            </Typography>
            <Chip
              label={`+${stats.added}`}
              size="small"
              color="success"
              variant="outlined"
              sx={{fontFamily: "monospace"}}
            />
            <Chip
              label={`-${stats.removed}`}
              size="small"
              color="error"
              variant="outlined"
              sx={{fontFamily: "monospace"}}
            />
            <Typography variant="caption" color="text.secondary">
              {baseLabel} → {compareLabel}
            </Typography>
          </Stack>
          <DiffRenderer diffLines={diff} />
        </Box>
      )}
    </Stack>
  );
}
