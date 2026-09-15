import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {useQueryClient} from "@tanstack/react-query";
import {useMemo, useState} from "react";
import {
  APTOS_FEATURE_FLAGS,
  getFeatureFlagName,
  hasStaticFeatureFlagLabel,
} from "../../api/hooks/aptosFeatureFlags";
import {useAptosFeatureFlagUpstreamNames} from "../../api/hooks/useAptosFeatureFlagUpstreamNames";
import {useGetNetworkStatus} from "../../api/hooks/useGetNetworkStatus";
import {InlineMarkup, translateNetworkName, useTranslation} from "../../i18n";

// The deployments page only ever shows the three production networks; we
// narrow the type locally so we can index records by it without TS treating
// other `NetworkName` values (e.g. `decibel`, `local`) as possible keys.
type ComparedNetwork = "mainnet" | "testnet" | "devnet";

const NETWORKS: readonly ComparedNetwork[] = [
  "mainnet",
  "testnet",
  "devnet",
] as const;

type FilterMode = "all" | "enabled" | "disabled" | "differences";

const FILTERS: ReadonlyArray<{value: FilterMode; labelKey: string}> = [
  {value: "differences", labelKey: "flags.differences"},
  {value: "all", labelKey: "flags.all"},
  {value: "enabled", labelKey: "flags.enabledAnywhere"},
  {value: "disabled", labelKey: "flags.disabledEverywhere"},
];

type CellState = "loading" | "enabled" | "disabled" | "unknown";

function FeatureCell({state}: {state: CellState}) {
  const {t} = useTranslation();
  if (state === "loading") {
    return <CircularProgress size={14} aria-label={t("common.loading")} />;
  }
  if (state === "enabled") {
    return (
      <CheckCircleIcon
        color="success"
        fontSize="small"
        aria-label={t("flags.enabled")}
      />
    );
  }
  if (state === "unknown") {
    // Distinct from the disabled "X" so a network outage doesn't masquerade
    // as a feature being explicitly off.
    return (
      <Tooltip title={t("tooltips.networkUnreachable")}>
        <HelpOutlineIcon
          color="warning"
          fontSize="small"
          aria-label={t("flags.unknownAria")}
        />
      </Tooltip>
    );
  }
  return (
    <CancelIcon
      color="disabled"
      fontSize="small"
      aria-label={t("flags.disabled")}
    />
  );
}

export function FeatureFlagsTable() {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const upstreamNames = useAptosFeatureFlagUpstreamNames();

  // useQuery is keyed per-network; calling the hook three times is the
  // existing pattern (same as the cards). React Query dedups them naturally.
  const mainnet = useGetNetworkStatus("mainnet");
  const testnet = useGetNetworkStatus("testnet");
  const devnet = useGetNetworkStatus("devnet");

  const queries = useMemo(
    () => ({
      mainnet,
      testnet,
      devnet,
    }),
    [mainnet, testnet, devnet],
  );

  const [filter, setFilter] = useState<FilterMode>("differences");

  const handleRefresh = () => {
    queryClient.invalidateQueries({queryKey: ["deployments"]});
    queryClient.invalidateQueries({
      queryKey: ["aptos-feature-flag-names-upstream"],
    });
  };

  // Union of every flag ID we either know about statically or have observed
  // enabled on chain. This way unmapped flags still surface in the table.
  const featureIds = useMemo(() => {
    const ids = new Set<number>(APTOS_FEATURE_FLAGS.map((f) => f.id));
    for (const network of NETWORKS) {
      for (const id of queries[network].data?.enabledFeatures ?? []) {
        ids.add(id);
      }
    }
    return [...ids].sort((a, b) => a - b);
  }, [queries]);

  const enabledSets = useMemo(() => {
    const result: Record<ComparedNetwork, Set<number> | null> = {
      mainnet: null,
      testnet: null,
      devnet: null,
    };
    for (const network of NETWORKS) {
      const list = queries[network].data?.enabledFeatures;
      result[network] = list ? new Set(list) : null;
    }
    return result;
  }, [queries]);

  const cellState = (network: ComparedNetwork, id: number): CellState => {
    const set = enabledSets[network];
    if (set !== null) return set.has(id) ? "enabled" : "disabled";
    // No data yet: distinguish a still-fetching query (spinner) from one
    // that errored out (warning icon). Without this an outage would render
    // identically to a loading state forever.
    if (queries[network].isError) return "unknown";
    return "loading";
  };

  const visibleIds = useMemo(() => {
    const isDiff = (id: number): boolean => {
      let seenEnabled = false;
      let seenDisabled = false;
      for (const network of NETWORKS) {
        const set = enabledSets[network];
        if (set === null) continue;
        if (set.has(id)) seenEnabled = true;
        else seenDisabled = true;
        if (seenEnabled && seenDisabled) return true;
      }
      return false;
    };
    const enabledAny = (id: number): boolean => {
      for (const network of NETWORKS) {
        if (enabledSets[network]?.has(id)) return true;
      }
      return false;
    };
    switch (filter) {
      case "differences":
        return featureIds.filter(isDiff);
      case "enabled":
        return featureIds.filter(enabledAny);
      case "disabled":
        return featureIds.filter((id) => !enabledAny(id));
      default:
        return featureIds;
    }
  }, [featureIds, filter, enabledSets]);

  const anyLoading = NETWORKS.some(
    (n) => queries[n].isLoading || queries[n].isFetching,
  );
  const anyError = NETWORKS.some((n) => queries[n].isError);

  const resolveFeatureDisplayName = (id: number): string => {
    if (hasStaticFeatureFlagLabel(id)) return getFeatureFlagName(id);
    const fromUpstream = upstreamNames.data?.get(id);
    if (fromUpstream) return fromUpstream;
    return getFeatureFlagName(id);
  };

  const showUpstreamHint =
    upstreamNames.isSuccess &&
    featureIds.some((id) => !hasStaticFeatureFlagLabel(id));

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h5" component="h2">
            {t("flags.heading")}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            <InlineMarkup text={t("flags.intro")} />
            {showUpstreamHint ? (
              <>
                {" "}
                <InlineMarkup text={t("flags.upstreamHint")} />
              </>
            ) : null}
          </Typography>
        </Box>
        <Button
          startIcon={<RefreshIcon />}
          variant="outlined"
          size="small"
          onClick={handleRefresh}
        >
          {t("common.refresh")}
        </Button>
      </Box>
      <Stack direction="row" sx={{flexWrap: "wrap", gap: 1, mb: 2}}>
        {FILTERS.map(({value, labelKey}) => (
          <Chip
            key={value}
            label={t(labelKey)}
            onClick={() => setFilter(value)}
            color={filter === value ? "primary" : "default"}
            variant={filter === value ? "filled" : "outlined"}
            size="small"
          />
        ))}
        {anyLoading && <CircularProgress size={16} sx={{ml: 1}} />}
      </Stack>
      {anyError && (
        <Typography variant="body2" color="error" sx={{mb: 1}}>
          {t("flags.networkError")}
        </Typography>
      )}
      <TableContainer component={Paper} variant="outlined">
        <Table
          size="small"
          aria-label={t("flags.tableAria")}
          // Below `sm` we let the table scroll horizontally rather than
          // letting names crush together. The min-width keeps the network
          // columns at a tappable size while the name column stays readable.
          sx={{minWidth: 560}}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{width: 64}}>{t("flags.id")}</TableCell>
              <TableCell sx={{minWidth: 200}}>{t("table.name")}</TableCell>
              {NETWORKS.map((network) => (
                <TableCell
                  key={network}
                  align="center"
                  sx={{width: 88, minWidth: 72}}
                >
                  {translateNetworkName(network, t)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleIds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2 + NETWORKS.length} align="center">
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      py: 2,
                    }}
                  >
                    {filter === "differences"
                      ? t("flags.allAgree")
                      : t("flags.noMatch")}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              visibleIds.map((id) => (
                <TableRow key={id} hover>
                  <TableCell sx={{fontFamily: "monospace"}}>{id}</TableCell>
                  <TableCell
                    sx={{wordBreak: "break-word", whiteSpace: "normal"}}
                  >
                    {!hasStaticFeatureFlagLabel(id) &&
                    upstreamNames.isLoading ? (
                      <CircularProgress
                        size={14}
                        aria-label={t("flags.loadingName")}
                      />
                    ) : (
                      resolveFeatureDisplayName(id)
                    )}
                  </TableCell>
                  {NETWORKS.map((network) => (
                    <TableCell key={network} align="center">
                      <FeatureCell state={cellState(network, id)} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
