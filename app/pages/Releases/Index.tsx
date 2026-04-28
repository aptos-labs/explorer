import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import {useQueryClient} from "@tanstack/react-query";
import {useGetReleases} from "../../api/hooks/useGetReleases";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import PageHeader from "../layout/PageHeader";
import {ReleaseCard} from "./ReleaseCard";

const RELEASE_META = [
  {key: "cli" as const, name: "Aptos CLI", registry: "GitHub Releases"},
  {key: "node" as const, name: "aptos-node", registry: "GitHub Releases"},
  {key: "typescript" as const, name: "TypeScript SDK", registry: "npm"},
  {key: "python" as const, name: "Python SDK", registry: "PyPI"},
  {key: "rust" as const, name: "Rust SDK", registry: "crates.io"},
  {key: "go" as const, name: "Go SDK", registry: "pkg.go.dev"},
];

export default function ReleasesPage() {
  const queryClient = useQueryClient();
  const {data, isLoading, isError} = useGetReleases();

  return (
    <Box>
      <PageMetadata
        title="SDK & Tool Releases"
        description="Latest release versions for the Aptos CLI, node software, and all official SDKs — TypeScript, Python, Rust, and Go."
        type="website"
        keywords={[
          "releases",
          "SDK",
          "CLI",
          "versions",
          "npm",
          "PyPI",
          "crates",
        ]}
        canonicalPath="/releases"
      />
      <PageHeader />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography variant="h3" component="h1">
          SDK & Tool Releases
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          variant="outlined"
          onClick={() =>
            queryClient.invalidateQueries({queryKey: ["releases"]})
          }
        >
          Refresh
        </Button>
      </Box>

      {isLoading && <CircularProgress />}

      {isError && (
        <Alert severity="error" sx={{mb: 2}}>
          Failed to load release data. Please try again.
        </Alert>
      )}

      {!isLoading && !isError && data && (
        <Grid container spacing={3}>
          {RELEASE_META.map(({key, name, registry}) => (
            <Grid key={key} size={{xs: 12, sm: 6, md: 4}}>
              <ReleaseCard name={name} registry={registry} result={data[key]} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
