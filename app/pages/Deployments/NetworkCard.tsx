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

  const fullnodeGitHash = data?.fullnodeGitHash ?? data?.gitHash ?? null;
  const validatorSetGitHash = data?.validatorSetGitHash ?? null;
  const fullnodeShort = fullnodeGitHash ? fullnodeGitHash.slice(0, 7) : null;
  const validatorShort = validatorSetGitHash
    ? validatorSetGitHash.slice(0, 7)
    : null;

  const {data: fullnodeRelease, isFetching: fullnodeReleaseFetching} =
    useGetNodeReleaseFromCommit(fullnodeGitHash);
  const {data: validatorRelease, isFetching: validatorReleaseFetching} =
    useGetNodeReleaseFromCommit(validatorSetGitHash);

  function releasePresentation(release: typeof fullnodeRelease) {
    const branchVersion =
      release?.branchVersion && /^\d+\.\d+$/.test(release.branchVersion)
        ? release.branchVersion
        : null;
    const releaseLabel = release?.fullVersion
      ? `v${release.fullVersion}`
      : branchVersion
        ? `v${branchVersion}.x`
        : null;
    const releaseBranchUrl = branchVersion
      ? `https://github.com/aptos-labs/aptos-core/tree/aptos-release-v${branchVersion}`
      : null;
    return {releaseLabel, releaseBranchUrl};
  }

  const fullnodeRel = releasePresentation(fullnodeRelease);
  const validatorRel = releasePresentation(validatorRelease);

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
              label="Framework Release"
              value={(() => {
                if (data.gasFeatureVersion === null) return null;
                const mapped = data.frameworkRelease;
                const display =
                  mapped ?? `gas ${data.gasFeatureVersion} (unmapped)`;
                const tooltip = mapped
                  ? `Gas schedule feature_version ${data.gasFeatureVersion} (aptos-core gas_feature_versions in aptos-gas-schedule/src/ver.rs)`
                  : `Gas schedule feature_version ${data.gasFeatureVersion} is not mapped to a known framework release in this explorer — update GAS_FEATURE_VERSION_TO_FRAMEWORK_RELEASE`;
                return (
                  <Tooltip title={tooltip}>
                    <span>{display}</span>
                  </Tooltip>
                );
              })()}
            />
            <StatusRow
              label="Bytecode Format (max)"
              value={
                data.bytecodeFormatVersion !== null ? (
                  <Tooltip title="Highest Move module bytecode format enabled via VM Binary Format feature flags on chain">
                    <span>v{data.bytecodeFormatVersion}</span>
                  </Tooltip>
                ) : null
              }
            />
            <StatusRow
              label="Fullnode Release"
              value={
                fullnodeReleaseFetching && fullnodeGitHash ? (
                  <CircularProgress size={12} />
                ) : fullnodeRel.releaseLabel && fullnodeRel.releaseBranchUrl ? (
                  <Link
                    href={fullnodeRel.releaseBranchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                  >
                    {fullnodeRel.releaseLabel}
                  </Link>
                ) : null
              }
            />
            <StatusRow
              label="Fullnode Commit"
              value={
                fullnodeGitHash && fullnodeShort ? (
                  <Tooltip title={fullnodeGitHash}>
                    <Link
                      href={`https://github.com/aptos-labs/aptos-core/commit/${fullnodeGitHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                    >
                      {fullnodeShort}
                    </Link>
                  </Tooltip>
                ) : null
              }
            />
            <StatusRow
              label="Validator Set Release"
              value={
                <Tooltip title="Most common git_hash among a sample of active validators, by probing on-chain advertised REST hostnames (not the API gateway fullnode).">
                  <span>
                    {validatorReleaseFetching && validatorSetGitHash ? (
                      <CircularProgress size={12} />
                    ) : validatorRel.releaseLabel &&
                      validatorRel.releaseBranchUrl ? (
                      <Link
                        href={validatorRel.releaseBranchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                      >
                        {validatorRel.releaseLabel}
                      </Link>
                    ) : null}
                  </span>
                </Tooltip>
              }
            />
            <StatusRow
              label="Validator Set Commit"
              value={
                <Tooltip title="Most common git_hash among a sample of active validators (see Validator Set Release).">
                  <span>
                    {validatorSetGitHash && validatorShort ? (
                      <Link
                        href={`https://github.com/aptos-labs/aptos-core/commit/${validatorSetGitHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                      >
                        {validatorShort}
                      </Link>
                    ) : null}
                  </span>
                </Tooltip>
              }
            />
            <StatusRow label="Validators" value={data.validatorCount} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
