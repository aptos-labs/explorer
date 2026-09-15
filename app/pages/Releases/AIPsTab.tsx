import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {useQueryClient} from "@tanstack/react-query";
import {useState} from "react";
import {type AIP, useGetAIPs} from "../../api/hooks/useGetAIPs";
import {useTranslation} from "../../i18n";

type StatusColor =
  | "default"
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "error";

const STATUS_COLORS: Record<string, StatusColor> = {
  draft: "info",
  "last call": "warning",
  accepted: "success",
  final: "success",
  withdrawn: "error",
  living: "default",
};

const STATUS_FILTERS = [
  {id: "all", labelKey: "aips.filter.all"},
  {id: "draft", labelKey: "aips.filter.draft"},
  {id: "last call", labelKey: "aips.filter.lastCall"},
  {id: "accepted", labelKey: "aips.filter.accepted"},
  {id: "final", labelKey: "aips.filter.final"},
  {id: "withdrawn", labelKey: "aips.filter.withdrawn"},
  {id: "living", labelKey: "aips.filter.living"},
] as const;

type SortField = keyof Pick<AIP, "number" | "title" | "status" | "author">;

export default function AIpsTab() {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const theme = useTheme();
  // Below `sm` (~600px) we hide the Author column to keep the row dense and
  // the title readable; the full author list is still in the source on
  // GitHub which the leftmost link surfaces.
  const showAuthor = useMediaQuery(theme.breakpoints.up("sm"));
  const {data, isLoading, isError, error} = useGetAIPs();
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("number");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const isRateLimited =
    isError && error instanceof Error && error.message === "RATE_LIMITED";

  const filtered = (data ?? [])
    .filter(
      (aip) =>
        statusFilter === "all" || aip.status.toLowerCase() === statusFilter,
    )
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "number") return dir * (a.number - b.number);
      return dir * String(a[sortField]).localeCompare(String(b[sortField]));
    });

  // Pinned columns rendered after the leading link icon. We keep `author`
  // out of the loop and condition it on the responsive breakpoint below to
  // avoid leaving an empty column at narrow widths.
  const SORTABLE_COLUMNS: {field: SortField; labelKey: string}[] = [
    {field: "number", labelKey: "table.aipNumber"},
    {field: "title", labelKey: "table.title"},
    {field: "status", labelKey: "table.status"},
  ];
  const totalCols = 1 + SORTABLE_COLUMNS.length + (showAuthor ? 1 : 0);

  return (
    <Box>
      <Box sx={{display: "flex", justifyContent: "flex-end", mb: 2}}>
        <Button
          startIcon={<RefreshIcon />}
          variant="outlined"
          onClick={() => queryClient.invalidateQueries({queryKey: ["aips"]})}
        >
          {t("common.refresh")}
        </Button>
      </Box>
      {isRateLimited && (
        <Alert severity="warning" sx={{mb: 2}}>
          {t("aips.rateLimited")}
        </Alert>
      )}
      {isError && !isRateLimited && (
        <Alert severity="error" sx={{mb: 2}}>
          {t("aips.loadFailed")}
        </Alert>
      )}
      <Stack direction="row" sx={{mb: 2, flexWrap: "wrap", gap: 1}}>
        {STATUS_FILTERS.map((s) => (
          <Chip
            key={s.id}
            label={t(s.labelKey)}
            onClick={() => setStatusFilter(s.id)}
            color={statusFilter === s.id ? "primary" : "default"}
            variant={statusFilter === s.id ? "filled" : "outlined"}
          />
        ))}
      </Stack>
      {isLoading && <CircularProgress />}
      {!isLoading && !isError && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" sx={{tableLayout: "fixed"}}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{width: 48, pr: 0}}
                  aria-label={t("aips.sourceLinkAria")}
                />
                {SORTABLE_COLUMNS.map(({field, labelKey}) => (
                  <TableCell
                    key={field}
                    sx={
                      field === "number"
                        ? {width: 72}
                        : field === "status"
                          ? {width: 116}
                          : undefined
                    }
                  >
                    <TableSortLabel
                      active={sortField === field}
                      direction={sortField === field ? sortDir : "asc"}
                      onClick={() => handleSort(field)}
                    >
                      {t(labelKey)}
                    </TableSortLabel>
                  </TableCell>
                ))}
                {showAuthor && (
                  <TableCell sx={{width: "30%"}}>
                    <TableSortLabel
                      active={sortField === "author"}
                      direction={sortField === "author" ? sortDir : "asc"}
                      onClick={() => handleSort("author")}
                    >
                      {t("aips.author")}
                    </TableSortLabel>
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={totalCols} align="center" sx={{py: 4}}>
                    <Typography
                      sx={{
                        color: "text.secondary",
                      }}
                    >
                      {t("aips.noMatch")}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((aip) => (
                  <TableRow key={aip.number} hover>
                    <TableCell sx={{pr: 0}}>
                      <Tooltip title={t("aips.openOnGithub")}>
                        <IconButton
                          size="small"
                          component="a"
                          href={aip.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={t("aips.openAipAria", {
                            number: aip.number,
                          })}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{aip.number}</TableCell>
                    <TableCell
                      sx={{
                        wordBreak: "break-word",
                        whiteSpace: "normal",
                      }}
                    >
                      {aip.title}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={aip.status}
                        size="small"
                        color={
                          STATUS_COLORS[aip.status.toLowerCase()] ?? "default"
                        }
                        sx={{maxWidth: "100%"}}
                      />
                    </TableCell>
                    {showAuthor && (
                      <TableCell sx={{wordBreak: "break-word"}}>
                        {aip.author}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
