import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import {useQueryClient} from "@tanstack/react-query";
import {useGetNetworkStatus} from "../../api/hooks/useGetNetworkStatus";
import type {NetworkName} from "../../lib/constants";

const NETWORK_LABEL: Record<string, string> = {
  mainnet: "Mainnet",
  testnet: "Testnet",
  devnet: "Devnet",
};

function StatusRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  return (
    <Box sx={{display: "flex", justifyContent: "space-between", py: 0.5}}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontFamily="monospace">
        {value ?? "—"}
      </Typography>
    </Box>
  );
}

export function NetworkCard({network}: {network: NetworkName}) {
  const queryClient = useQueryClient();
  const {data, isFetching, isError} = useGetNetworkStatus(network);

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: ["deployments", "networkStatus", network],
    });
  };

  return (
    <Card variant="outlined" sx={{height: "100%"}}>
      <CardContent>
        <Box sx={{display: "flex", alignItems: "center", gap: 1, mb: 2}}>
          <Typography variant="h6" sx={{flexGrow: 1}}>
            {NETWORK_LABEL[network] ?? network}
          </Typography>
          {isFetching && <CircularProgress size={16} />}
          {!isFetching && (
            <Chip
              label={isError ? "Down" : "Up"}
              color={isError ? "error" : "success"}
              size="small"
            />
          )}
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={handleRefresh}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {isError && (
          <Typography variant="body2" color="error">
            Unable to reach fullnode
          </Typography>
        )}

        {data && (
          <>
            <StatusRow label="Epoch" value={data.epoch} />
            <StatusRow label="Block Height" value={data.blockHeight} />
            <StatusRow label="Ledger Version" value={data.ledgerVersion} />
            <StatusRow label="Chain ID" value={data.chainId} />
            <StatusRow
              label="Framework Version"
              value={
                data.frameworkVersion !== null
                  ? `v${data.frameworkVersion}`
                  : null
              }
            />
            <StatusRow label="Validators" value={data.validatorCount} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
