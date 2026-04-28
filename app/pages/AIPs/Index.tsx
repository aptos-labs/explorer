import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import {useQueryClient} from "@tanstack/react-query";
import {useState} from "react";
import {type AIP, useGetAIPs} from "../../api/hooks/useGetAIPs";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import PageHeader from "../layout/PageHeader";

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

export default function AIpsPage() {
  const queryClient = useQueryClient();
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

  return (
    <Box>
      <PageMetadata
        title="Aptos Improvement Proposals"
        description="Track all Aptos Improvement Proposals (AIPs) — status, authors, and links to source."
        type="website"
        keywords={["AIP", "improvement proposals", "governance", "Aptos"]}
        canonicalPath="/aips"
      />
      <PageHeader />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h3" component="h1">
          Improvement Proposals
        </Typography>
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
          <Table size="small">
            <TableHead>
              <TableRow>
                {(
                  [
                    {field: "number", label: "AIP #"},
                    {field: "title", label: "Title"},
                    {field: "status", label: "Status"},
                    {field: "author", label: "Author"},
                  ] as {field: SortField; label: string}[]
                ).map(({field, label}) => (
                  <TableCell key={field}>
                    <TableSortLabel
                      active={sortField === field}
                      direction={sortField === field ? sortDir : "asc"}
                      onClick={() => handleSort(field)}
                    >
                      {label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell>Link</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((aip) => (
                <TableRow key={aip.number} hover>
                  <TableCell>{aip.number}</TableCell>
                  <TableCell>{aip.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={aip.status}
                      size="small"
                      color={
                        STATUS_COLORS[aip.status.toLowerCase()] ?? "default"
                      }
                    />
                  </TableCell>
                  <TableCell>{aip.author}</TableCell>
                  <TableCell>
                    <Link
                      href={aip.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View →
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
