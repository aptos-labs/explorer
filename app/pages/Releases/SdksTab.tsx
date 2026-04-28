import RefreshIcon from "@mui/icons-material/Refresh";
import {Alert, Box, Button, CircularProgress, Grid} from "@mui/material";
import {useQueryClient} from "@tanstack/react-query";
import {useGetReleases} from "../../api/hooks/useGetReleases";
import {ReleaseCard} from "./ReleaseCard";

const RELEASE_META = [
  {key: "cli" as const, name: "Aptos CLI", registry: "GitHub Releases"},
  {key: "node" as const, name: "aptos-node", registry: "GitHub Releases"},
  {key: "typescript" as const, name: "TypeScript SDK", registry: "npm"},
  {key: "python" as const, name: "Python SDK", registry: "PyPI"},
  {key: "rust" as const, name: "Rust SDK", registry: "crates.io"},
  {key: "go" as const, name: "Go SDK", registry: "pkg.go.dev"},
];

export default function SdksTab() {
  const queryClient = useQueryClient();
  const {data, isLoading, isError} = useGetReleases();

  return (
    <Box>
      <Box sx={{display: "flex", justifyContent: "flex-end", mb: 2}}>
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
