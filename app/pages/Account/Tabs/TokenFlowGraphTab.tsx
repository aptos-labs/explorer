import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {subYears} from "date-fns";
import {useCallback, useEffect, useMemo, useState} from "react";
import type {Types} from "~/types/aptos";
import {useAccountTokenFlowGraphMutation} from "../../../api/hooks/useAccountTokenFlowGraphMutation";
import {useGetAllAccountCoins} from "../../../api/hooks/useGetAccountCoins";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {useNetworkValue} from "../../../global-config";
import {
  clearTokenFlowEdgesForScope,
  loadTokenFlowEdgesFromStorage,
  mergeAndPersistTokenFlowEdges,
} from "../../../utils/accountTokenFlowStorage";
import {tryStandardizeAddress} from "../../../utils";
import type {FlowDirection, TokenFlowEdge} from "../../../utils/tokenFlowGraph";
import TokenFlowGraphCanvas from "../Components/TokenFlowGraphCanvas";

type TokenFlowGraphTabProps = {
  address: string;
  accountData: Types.AccountData | undefined;
  objectData: Types.MoveResource | undefined;
  resourceData: Types.MoveResource[] | undefined;
  isObject: boolean;
};

const DEFAULT_SEED_LIMIT = 320;

type RangePreset = "7d" | "30d" | "90d" | "all";

function rangeToIso(preset: RangePreset): {fromIso: string; toIso: string} {
  const to = new Date();
  const toIso = to.toISOString();
  if (preset === "all") {
    return {fromIso: subYears(to, 10).toISOString(), toIso};
  }
  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return {fromIso: from.toISOString(), toIso};
}

export default function TokenFlowGraphTab({address}: TokenFlowGraphTabProps) {
  const network = useNetworkValue();
  const standardized = useMemo(
    () => tryStandardizeAddress(address) ?? address,
    [address],
  );

  const {data: coins, isLoading: coinsLoading} = useGetAllAccountCoins(address);

  const [assetType, setAssetType] = useState<string>("");
  const [direction, setDirection] = useState<FlowDirection>("outbound");
  const [rangePreset, setRangePreset] = useState<RangePreset>("30d");
  const [edges, setEdges] = useState<TokenFlowEdge[]>([]);

  const mutation = useAccountTokenFlowGraphMutation();

  useEffect(() => {
    if (!assetType) {
      setEdges([]);
      return;
    }
    setEdges(
      loadTokenFlowEdgesFromStorage(
        network,
        standardized,
        assetType,
        direction,
      ),
    );
  }, [network, standardized, assetType, direction]);

  useEffect(() => {
    if (!coins || coins.length === 0) {
      return;
    }
    if (!assetType || !coins.some((c) => c.asset_type === assetType)) {
      const first = coins[0];
      if (first) {
        setAssetType(first.asset_type);
      }
    }
  }, [coins, assetType]);

  const handleFetch = useCallback(async () => {
    if (!assetType) {
      return;
    }
    const {fromIso, toIso} = rangeToIso(rangePreset);
    const incoming = await mutation.mutateAsync({
      owner: standardized,
      assetType,
      direction,
      fromIso,
      toIso,
      seedLimit: DEFAULT_SEED_LIMIT,
    });
    const merged = mergeAndPersistTokenFlowEdges(
      network,
      standardized,
      assetType,
      direction,
      incoming,
    );
    setEdges(merged);
  }, [assetType, direction, mutation, network, rangePreset, standardized]);

  const handleClearCache = useCallback(() => {
    if (!assetType) {
      return;
    }
    clearTokenFlowEdgesForScope(network, standardized, assetType, direction);
    setEdges([]);
  }, [assetType, direction, network, standardized]);

  if (coinsLoading) {
    return null;
  }

  if (!coins || coins.length === 0) {
    return <EmptyTabContent />;
  }

  return (
    <Stack spacing={2} sx={{py: 1}}>
      <Alert severity="info">
        This experimental view uses indexer fungible-asset activity for the
        selected asset. Edges are merged into browser local storage (capped at
        roughly two thousand) for this account, asset, direction, and network.
      </Alert>

      <Stack
        direction={{xs: "column", md: "row"}}
        spacing={2}
        flexWrap="wrap"
        useFlexGap
      >
        <FormControl sx={{minWidth: 220}} size="small">
          <InputLabel id="token-flow-asset-label">Asset</InputLabel>
          <Select
            labelId="token-flow-asset-label"
            label="Asset"
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
          >
            {coins.map((c) => (
              <MenuItem key={c.asset_type} value={c.asset_type}>
                {c.metadata.symbol} · {c.metadata.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{minWidth: 160}} size="small">
          <InputLabel id="token-flow-range-label">Timeline</InputLabel>
          <Select
            labelId="token-flow-range-label"
            label="Timeline"
            value={rangePreset}
            onChange={(e) => setRangePreset(e.target.value as RangePreset)}
          >
            <MenuItem value="7d">Last 7 days</MenuItem>
            <MenuItem value="30d">Last 30 days</MenuItem>
            <MenuItem value="90d">Last 90 days</MenuItem>
            <MenuItem value="all">Last 10 years</MenuItem>
          </Select>
        </FormControl>

        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Direction
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={direction}
            onChange={(_e, v) => {
              if (v) {
                setDirection(v);
              }
            }}
          >
            <ToggleButton value="inbound">Inbound</ToggleButton>
            <ToggleButton value="outbound">Outbound</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Button
          variant="contained"
          onClick={() => void handleFetch()}
          disabled={!assetType || mutation.isPending}
          startIcon={
            mutation.isPending ? (
              <CircularProgress color="inherit" size={18} />
            ) : null
          }
        >
          Load graph
        </Button>
        <Button
          variant="outlined"
          color="warning"
          onClick={handleClearCache}
          disabled={!assetType}
        >
          Clear stored edges
        </Button>
      </Stack>

      {mutation.isError ? (
        <Alert severity="error">
          Could not load graph data. The indexer may be unavailable or the
          timeline may be too large.
        </Alert>
      ) : null}

      <Typography variant="body2" color="text.secondary">
        {edges.length} edge{edges.length === 1 ? "" : "s"} in view (including
        locally stored history for this scope).
      </Typography>

      <Box
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        <TokenFlowGraphCanvas centerId={standardized} edges={edges} />
        {edges.length === 0 ? (
          <Box sx={{p: 4, textAlign: "center"}}>
            <Typography color="text.secondary">
              No edges yet. Choose a timeline and select Load graph.
            </Typography>
          </Box>
        ) : null}
      </Box>
    </Stack>
  );
}
