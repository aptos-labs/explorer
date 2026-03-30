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
import {diffLines} from "diff";
import {useEffect, useMemo, useState} from "react";
import {useGetAccountModule} from "../../../../api/hooks/useGetAccountModule";
import {useGetAccountPackages} from "../../../../api/hooks/useGetAccountResource";
import type {ModulePublishTransaction} from "../../../../api/hooks/useGetModulePublishHistory";
import {Link} from "../../../../routing";
import {useDecompilationEnabled} from "../../../../settings";
import {transformCode} from "../../../../utils";
import {
  type DecompilationView,
  getDecompiledCodeView,
} from "../../../../utils/moveDecompiler";

type DiffViewType =
  | "published-source"
  | "decompiled-source"
  | "bytecode-disassembly";

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

function useDecompiledCode(
  bytecode: string | undefined,
  view: DecompilationView,
  enabled: boolean,
): {code: string | undefined; isLoading: boolean; error?: string} {
  const [code, setCode] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const bytecodeKey = bytecode?.toLowerCase();
  const hasBytecode =
    enabled && !!bytecodeKey && bytecodeKey !== "0x" && bytecodeKey.length > 2;

  useEffect(() => {
    if (!hasBytecode || !bytecodeKey) {
      setCode(undefined);
      setIsLoading(false);
      setError(undefined);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(undefined);

    (async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 0));
        const result = await getDecompiledCodeView(bytecodeKey, view);
        if (!cancelled) {
          setCode(result);
          setIsLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setCode(undefined);
          setIsLoading(false);
          setError(
            e instanceof Error ? e.message : "Failed to decompile module",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bytecodeKey, view, hasBytecode]);

  return {code, isLoading, error};
}

function getViewLabel(view: DiffViewType): string {
  switch (view) {
    case "published-source":
      return "Published Source";
    case "decompiled-source":
      return "Decompiled";
    case "bytecode-disassembly":
      return "Disassembly";
  }
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
  const decompilationEnabled = useDecompilationEnabled();
  const [activeView, setActiveView] =
    useState<DiffViewType>("published-source");

  const basePackages = useGetAccountPackages(address, baseVersion);
  const comparePackages = useGetAccountPackages(address, compareVersion);

  const basePublishedSource = useMemo(() => {
    const mod = basePackages
      .flatMap((pkg) => pkg.modules)
      .find((m) => m.name === moduleName);
    if (!mod?.source || mod.source === "0x") return "";
    return transformCode(mod.source);
  }, [basePackages, moduleName]);

  const comparePublishedSource = useMemo(() => {
    const mod = comparePackages
      .flatMap((pkg) => pkg.modules)
      .find((m) => m.name === moduleName);
    if (!mod?.source || mod.source === "0x") return "";
    return transformCode(mod.source);
  }, [comparePackages, moduleName]);

  const hasPublishedSource =
    basePublishedSource !== "" || comparePublishedSource !== "";

  const needsBytecode =
    decompilationEnabled && activeView !== "published-source";
  const {
    data: baseModule,
    isLoading: baseModuleLoading,
    isError: isBaseModuleError,
    error: baseModuleError,
  } = useGetAccountModule(address, moduleName, baseVersion, {
    enabled: needsBytecode && !!moduleName,
  });
  const {
    data: compareModule,
    isLoading: compareModuleLoading,
    isError: isCompareModuleError,
    error: compareModuleError,
  } = useGetAccountModule(address, moduleName, compareVersion, {
    enabled: needsBytecode && !!moduleName,
  });

  const hasModuleError = isBaseModuleError || isCompareModuleError;
  const decompView: DecompilationView =
    activeView === "bytecode-disassembly"
      ? "bytecode-disassembly"
      : "decompiled-source";
  const shouldDecompile = needsBytecode && !hasModuleError;

  const baseDecompiled = useDecompiledCode(
    baseModule?.bytecode,
    decompView,
    shouldDecompile,
  );
  const compareDecompiled = useDecompiledCode(
    compareModule?.bytecode,
    decompView,
    shouldDecompile,
  );

  let baseCode: string;
  let compareCode: string;
  let isLoading: boolean;
  let decompError: string | undefined;
  let moduleError: string | undefined;

  if (activeView === "published-source") {
    baseCode = basePublishedSource;
    compareCode = comparePublishedSource;
    isLoading = basePackages.length === 0 || comparePackages.length === 0;
  } else if (hasModuleError) {
    baseCode = "";
    compareCode = "";
    isLoading = false;
    moduleError =
      (baseModuleError as Error | null)?.message ||
      (compareModuleError as Error | null)?.message ||
      "Failed to fetch module bytecode";
  } else {
    baseCode = baseDecompiled.code ?? "";
    compareCode = compareDecompiled.code ?? "";
    isLoading =
      baseModuleLoading ||
      compareModuleLoading ||
      baseDecompiled.isLoading ||
      compareDecompiled.isLoading;
    decompError = baseDecompiled.error || compareDecompiled.error;
  }

  const baseLabel = baseVersion ? `v${baseVersion.toLocaleString()}` : "Latest";
  const compareLabel = compareVersion
    ? `v${compareVersion.toLocaleString()}`
    : "Latest";

  const diff = useMemo(
    () => computeDiffLines(baseCode, compareCode),
    [baseCode, compareCode],
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

  const viewTypes: DiffViewType[] = decompilationEnabled
    ? ["published-source", "decompiled-source", "bytecode-disassembly"]
    : ["published-source"];

  const hasError = !!moduleError || !!decompError;

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

      <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
        {viewTypes.map((vt) => (
          <Button
            key={vt}
            size="small"
            variant={activeView === vt ? "contained" : "outlined"}
            onClick={() => setActiveView(vt)}
            sx={{textTransform: "none"}}
          >
            {getViewLabel(vt)}
          </Button>
        ))}
        {!decompilationEnabled && (
          <Button
            component={Link}
            to="/settings"
            size="small"
            variant="text"
            sx={{textTransform: "none"}}
          >
            Enable decompilation in Settings
          </Button>
        )}
      </Stack>

      {!moduleName && (
        <Box
          p={3}
          bgcolor={theme.palette.background.paper}
          borderRadius={1}
          textAlign="center"
        >
          <Typography color="text.secondary">
            Select a module from the sidebar to compare versions.
          </Typography>
        </Box>
      )}

      {moduleName &&
        activeView === "published-source" &&
        !hasPublishedSource &&
        !isLoading && (
          <Box
            p={3}
            bgcolor={theme.palette.background.paper}
            borderRadius={1}
            textAlign="center"
          >
            <Typography color="text.secondary">
              Published source is not available for module{" "}
              <strong>{moduleName}</strong> at these versions. Try the
              Decompiled or Disassembly view instead.
            </Typography>
          </Box>
        )}

      {moduleError && (
        <Box p={2} bgcolor={theme.palette.background.paper} borderRadius={1}>
          <Typography color="error.main" variant="body2">
            Failed to load module bytecode: {moduleError}
          </Typography>
        </Box>
      )}

      {decompError && !moduleError && (
        <Box p={2} bgcolor={theme.palette.background.paper} borderRadius={1}>
          <Typography color="error.main" variant="body2">
            Decompilation error: {decompError}
          </Typography>
        </Box>
      )}

      {!moduleName || hasError ? null : isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <Stack spacing={1} alignItems="center">
            <CircularProgress size={24} />
            {needsBytecode && (
              <Typography variant="caption" color="text.secondary">
                {baseModuleLoading || compareModuleLoading
                  ? "Fetching module bytecode…"
                  : "Decompiling…"}
              </Typography>
            )}
          </Stack>
        </Box>
      ) : baseCode === compareCode ? (
        <Box
          p={3}
          bgcolor={theme.palette.background.paper}
          borderRadius={1}
          textAlign="center"
        >
          <Typography color="text.secondary">
            No differences between {baseLabel} and {compareLabel} for module{" "}
            <strong>{moduleName}</strong>
            {activeView !== "published-source" && (
              <> ({getViewLabel(activeView)} view)</>
            )}
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
              {baseLabel} → {compareLabel} ({getViewLabel(activeView)})
            </Typography>
          </Stack>
          <DiffRenderer diffLines={diff} />
        </Box>
      )}
    </Stack>
  );
}
