import RefreshIcon from "@mui/icons-material/Refresh";
import {Box, Button, Grid, Typography} from "@mui/material";
import {useQueryClient} from "@tanstack/react-query";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import type {NetworkName} from "../../lib/constants";
import PageHeader from "../layout/PageHeader";
import {NetworkCard} from "./NetworkCard";

const NETWORKS: readonly NetworkName[] = [
  "mainnet",
  "testnet",
  "devnet",
] as const;

export default function DeploymentsPage() {
  const queryClient = useQueryClient();

  const handleRefreshAll = () => {
    queryClient.invalidateQueries({queryKey: ["deployments"]});
  };

  return (
    <Box>
      <PageMetadata
        title="Network Deployments"
        description="Live on-chain status for Aptos mainnet, testnet, and devnet — epoch, block height, framework version, and validator count."
        type="website"
        keywords={[
          "deployments",
          "network",
          "status",
          "mainnet",
          "testnet",
          "devnet",
        ]}
        canonicalPath="/deployments"
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
          Network Deployments
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          variant="outlined"
          onClick={handleRefreshAll}
        >
          Refresh All
        </Button>
      </Box>
      <Grid container spacing={3}>
        {NETWORKS.map((network) => (
          <Grid key={network} size={{xs: 12, md: 4}}>
            <NetworkCard network={network} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
