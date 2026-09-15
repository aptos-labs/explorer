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
import {translateNetworkName, useTranslation} from "../../i18n";

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
        sx={{
          color: "text.secondary",
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        component="div"
        sx={{
          fontFamily: "monospace",
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
  const {t} = useTranslation();
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

  // `branchVersion` is contractually `X.Y` (the parser refuses malformed
  // three-component tags). Guard at the consumer too: anything that isn't
  // exactly `digits.digits` falls back to the commit-only display rather
  // than rendering `v1.43.1.x` or linking to a non-existent
  // `aptos-release-v1.43.1` branch.
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

  return (
    <Card variant="outlined" sx={{height: "100%"}}>
      <CardContent>
        <Box sx={{display: "flex", alignItems: "center", gap: 1, mb: 2}}>
          <Typography variant="h6" sx={{flexGrow: 1}}>
            {translateNetworkName(network, t)}
          </Typography>
          {isFetching && <CircularProgress size={16} />}
          {!isFetching && (
            <Chip
              label={isError ? t("deployments.down") : t("deployments.up")}
              color={isError ? "error" : "success"}
              size="small"
            />
          )}
          <Tooltip title={t("common.refresh")}>
            <IconButton size="small" onClick={handleRefresh}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {isError && (
          <Typography variant="body2" color="error">
            {t("deployments.unreachable")}
          </Typography>
        )}

        {data && (
          <>
            <StatusRow label={t("deployments.epoch")} value={data.epoch} />
            <StatusRow
              label={t("deployments.blockHeight")}
              value={data.blockHeight}
            />
            <StatusRow
              label={t("deployments.ledgerVersion")}
              value={data.ledgerVersion}
            />
            <StatusRow label={t("deployments.chainId")} value={data.chainId} />
            <StatusRow
              label={t("deployments.frameworkRelease")}
              value={(() => {
                if (data.gasFeatureVersion === null) return null;
                const mapped = data.frameworkRelease;
                const display =
                  mapped ??
                  t("deployments.gasUnmapped", {
                    version: data.gasFeatureVersion,
                  });
                const tooltip = mapped
                  ? t("deployments.gasMappedTip", {
                      version: data.gasFeatureVersion,
                    })
                  : t("deployments.gasUnmappedTip", {
                      version: data.gasFeatureVersion,
                    });
                return (
                  <Tooltip title={tooltip}>
                    <span>{display}</span>
                  </Tooltip>
                );
              })()}
            />
            <StatusRow
              label={t("deployments.bytecodeFormat")}
              value={
                data.bytecodeFormatVersion !== null ? (
                  <Tooltip title={t("tooltips.bytecodeFormat")}>
                    <span>v{data.bytecodeFormatVersion}</span>
                  </Tooltip>
                ) : null
              }
            />
            <StatusRow
              label={t("deployments.nodeRelease")}
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
              label={t("deployments.nodeCommit")}
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
            <StatusRow
              label={t("deployments.validators")}
              value={data.validatorCount}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
