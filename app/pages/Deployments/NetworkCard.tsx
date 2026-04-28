import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Link,
  Tooltip,
  Typography,
} from "@mui/material";
import {useQueryClient} from "@tanstack/react-query";
import type {ReactNode} from "react";
import {useGetNetworkStatus} from "../../api/hooks/useGetNetworkStatus";
import {useGetNodeReleaseFromCommit} from "../../api/hooks/useGetNodeReleaseFromCommit";
import type {NetworkName} from "../../lib/constants";

const NETWORK_LABEL: Record<string, string> = {
  mainnet: "Mainnet",
  testnet: "Testnet",
  devnet: "Devnet",
};

function StatusRow({label, value}: {label: string; value: ReactNode}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 1,
        py: 0.5,
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{flexShrink: 0, whiteSpace: "nowrap"}}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontFamily="monospace"
        component="div"
        sx={{
          textAlign: "right",
          wordBreak: "break-word",
          minWidth: 0,
        }}
      >
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

  const gitHash = data?.gitHash ?? null;
  const shortHash = gitHash ? gitHash.slice(0, 7) : null;
  const {data: release, isFetching: releaseFetching} =
    useGetNodeReleaseFromCommit(gitHash);

  const releaseLabel = release?.fullVersion
    ? `v${release.fullVersion}`
    : release?.branchVersion
      ? `v${release.branchVersion}.x`
      : null;
  const releaseBranchUrl = release?.branchVersion
    ? `https://github.com/aptos-labs/aptos-core/tree/aptos-release-v${release.branchVersion}`
    : null;

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
            <StatusRow
              label="Node Release"
              value={
                releaseFetching && gitHash ? (
                  <CircularProgress size={12} />
                ) : releaseLabel && releaseBranchUrl ? (
                  <Link
                    href={releaseBranchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                  >
                    {releaseLabel}
                  </Link>
                ) : null
              }
            />
            <StatusRow
              label="Node Commit"
              value={
                gitHash && shortHash ? (
                  <Tooltip title={gitHash}>
                    <Link
                      href={`https://github.com/aptos-labs/aptos-core/commit/${gitHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                    >
                      {shortHash}
                    </Link>
                  </Tooltip>
                ) : null
              }
            />
            <StatusRow label="Validators" value={data.validatorCount} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
