import RefreshIcon from "@mui/icons-material/Refresh";
import {Box, Button, Grid} from "@mui/material";
import {useQueryClient} from "@tanstack/react-query";
import type {NetworkName} from "../../lib/constants";
import {FeatureFlagsTable} from "../Deployments/FeatureFlagsTable";
import {NetworkCard} from "../Deployments/NetworkCard";

const NETWORKS: readonly NetworkName[] = [
  "mainnet",
  "testnet",
  "devnet",
] as const;

export default function DeploymentsTab() {
  const queryClient = useQueryClient();

  const handleRefreshAll = () => {
    queryClient.invalidateQueries({queryKey: ["deployments"]});
  };

  return (
    <Box>
      <Box sx={{display: "flex", justifyContent: "flex-end", mb: 2}}>
        <Button
          startIcon={<RefreshIcon />}
          variant="outlined"
          onClick={handleRefreshAll}
        >
          Refresh All
        </Button>
      </Box>
      <Grid container spacing={3} sx={{mb: 4}}>
        {NETWORKS.map((network) => (
          <Grid key={network} size={{xs: 12, md: 4}}>
            <NetworkCard network={network} />
          </Grid>
        ))}
      </Grid>
      <FeatureFlagsTable />
    </Box>
  );
}
