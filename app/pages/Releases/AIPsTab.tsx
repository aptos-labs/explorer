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
  "All",
  "Draft",
  "Last Call",
  "Accepted",
  "Final",
  "Withdrawn",
  "Living",
];

type SortField = keyof Pick<AIP, "number" | "title" | "status" | "author">;

export default function AIpsTab() {
  const queryClient = useQueryClient();
  const theme = useTheme();
  // Below `sm` (~600px) we hide the Author column to keep the row dense and
  // the title readable; the full author list is still in the source on
  // GitHub which the leftmost link surfaces.
  const showAuthor = useMediaQuery(theme.breakpoints.up("sm"));
  const {data, isLoading, isError, error} = useGetAIPs();
  const [statusFilter, setStatusFilter] = useState("All");
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
        statusFilter === "All" ||
        aip.status.toLowerCase() === statusFilter.toLowerCase(),
    )
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "number") return dir * (a.number - b.number);
      return dir * String(a[sortField]).localeCompare(String(b[sortField]));
    });

  // Pinned columns rendered after the leading link icon. We keep `author`
  // out of the loop and condition it on the responsive breakpoint below to
  // avoid leaving an empty column at narrow widths.
  const SORTABLE_COLUMNS: {field: SortField; label: string}[] = [
    {field: "number", label: "AIP #"},
    {field: "title", label: "Title"},
    {field: "status", label: "Status"},
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
          Refresh
        </Button>
      </Box>
      {isRateLimited && (
        <Alert severity="warning" sx={{mb: 2}}>
          GitHub API rate limited — try again in a few minutes
        </Alert>
      )}
      {isError && !isRateLimited && (
        <Alert severity="error" sx={{mb: 2}}>
          Failed to load AIPs
        </Alert>
      )}
      <Stack direction="row" sx={{mb: 2, flexWrap: "wrap", gap: 1}}>
        {STATUS_FILTERS.map((s) => (
          <Chip
            key={s}
            label={s}
            onClick={() => setStatusFilter(s)}
            color={statusFilter === s ? "primary" : "default"}
            variant={statusFilter === s ? "filled" : "outlined"}
          />
        ))}
      </Stack>
      {isLoading && <CircularProgress />}
      {!isLoading && !isError && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" sx={{tableLayout: "fixed"}}>
            <TableHead>
              <TableRow>
                <TableCell sx={{width: 48, pr: 0}} aria-label="Source link" />
                {SORTABLE_COLUMNS.map(({field, label}) => (
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
                      {label}
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
                      Author
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
                      No AIPs match the selected filter
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((aip) => (
                  <TableRow key={aip.number} hover>
                    <TableCell sx={{pr: 0}}>
                      <Tooltip title="Open on GitHub">
                        <IconButton
                          size="small"
                          component="a"
                          href={aip.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open AIP-${aip.number} on GitHub`}
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
