import React from "react";
import {createFileRoute} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Chip,
  Alert,
} from "@mui/material";
import {Link} from "@tanstack/react-router";
import {useGlobalState} from "../context/global-state";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import {truncateAddress, octaToApt, formatNumber} from "../utils";

export const Route = createFileRoute("/validator/$address")({
  head: ({params}) => ({
    meta: [
      {
        title: `Validator ${truncateAddress(params.address)} | Aptos Explorer`,
      },
      {
        name: "description",
        content: `View validator details for ${params.address} on the Aptos blockchain.`,
      },
      {
        property: "og:title",
        content: `Validator ${truncateAddress(params.address)} | Aptos Explorer`,
      },
      {
        property: "og:description",
        content: `View validator details for ${params.address} on the Aptos blockchain.`,
      },
      {property: "og:url", content: `${BASE_URL}/validator/${params.address}`},
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {
        name: "twitter:title",
        content: `Validator ${truncateAddress(params.address)} | Aptos Explorer`,
      },
      {
        name: "twitter:description",
        content: `View validator details for ${params.address} on the Aptos blockchain.`,
      },
    ],
    links: [
      {rel: "canonical", href: `${BASE_URL}/validator/${params.address}`},
    ],
  }),
  component: ValidatorPage,
});

interface ValidatorInfo {
  addr: string;
  voting_power: string;
  config: {
    consensus_pubkey: string;
    validator_index: string;
    network_addresses: string;
    fullnode_addresses: string;
  };
}

interface ValidatorSet {
  active_validators: ValidatorInfo[];
  pending_active: ValidatorInfo[];
  pending_inactive: ValidatorInfo[];
  total_voting_power: string;
}

function ValidatorPage() {
  const {address} = Route.useParams();
  const {sdk_v2_client, network_name} = useGlobalState();

  // Fetch validator set to find this validator
  const {
    data: validatorSet,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["validatorSet", network_name],
    queryFn: async () => {
      const response = await sdk_v2_client.getAccountResource({
        accountAddress: "0x1",
        resourceType: "0x1::stake::ValidatorSet",
      });
      return response as unknown as ValidatorSet;
    },
    staleTime: 30000,
  });

  // Find the validator in the set
  const validator = React.useMemo(() => {
    if (!validatorSet) return null;

    // Check active validators
    const active = validatorSet.active_validators.find(
      (v) => v.addr.toLowerCase() === address.toLowerCase(),
    );
    if (active) return {...active, status: "active" as const};

    // Check pending active
    const pendingActive = validatorSet.pending_active?.find(
      (v) => v.addr.toLowerCase() === address.toLowerCase(),
    );
    if (pendingActive)
      return {...pendingActive, status: "pending_active" as const};

    // Check pending inactive
    const pendingInactive = validatorSet.pending_inactive?.find(
      (v) => v.addr.toLowerCase() === address.toLowerCase(),
    );
    if (pendingInactive)
      return {...pendingInactive, status: "pending_inactive" as const};

    return null;
  }, [validatorSet, address]);

  const totalVotingPower = validatorSet?.total_voting_power
    ? Number(validatorSet.total_voting_power)
    : 0;

  const validatorVotingPower = validator?.voting_power
    ? Number(validator.voting_power)
    : 0;

  const votingPowerPercentage =
    totalVotingPower > 0
      ? ((validatorVotingPower / totalVotingPower) * 100).toFixed(2)
      : "0.00";

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{mb: 2}}>
          Error loading validator: {String(error)}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Validator Header */}
      <Box sx={{mb: 4}}>
        <Box sx={{display: "flex", alignItems: "center", gap: 2, mb: 1}}>
          <Typography variant="h4">Validator</Typography>
          {validator && (
            <Chip
              label={validator.status.replace("_", " ")}
              color={validator.status === "active" ? "success" : "warning"}
              size="small"
              sx={{textTransform: "capitalize"}}
            />
          )}
        </Box>
        <Typography
          variant="body1"
          sx={{
            fontFamily: "monospace",
            wordBreak: "break-all",
          }}
        >
          {address}
        </Typography>
      </Box>

      {!validator && !isLoading && (
        <Alert severity="warning" sx={{mb: 4}}>
          This address is not currently in the validator set. It may be an
          inactive validator or not a validator at all.
        </Alert>
      )}

      {/* Validator Stats */}
      <Grid container spacing={3} sx={{mb: 4}}>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Voting Power
              </Typography>
              <Typography variant="h6">
                {isLoading ? (
                  <Skeleton width={100} />
                ) : validator ? (
                  `${formatNumber(Math.round(octaToApt(validatorVotingPower)))} APT`
                ) : (
                  "-"
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                % of Total Power
              </Typography>
              <Typography variant="h6">
                {isLoading ? (
                  <Skeleton width={60} />
                ) : validator ? (
                  `${votingPowerPercentage}%`
                ) : (
                  "-"
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Validator Index
              </Typography>
              <Typography variant="h6">
                {isLoading ? (
                  <Skeleton width={40} />
                ) : validator?.config?.validator_index ? (
                  validator.config.validator_index
                ) : (
                  "-"
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Typography variant="h6">
                {isLoading ? (
                  <Skeleton width={80} />
                ) : validator ? (
                  <Chip
                    label={validator.status.replace("_", " ")}
                    color={
                      validator.status === "active" ? "success" : "warning"
                    }
                    size="small"
                    sx={{textTransform: "capitalize"}}
                  />
                ) : (
                  "Not in set"
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Validator Config */}
      {validator && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Configuration
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{xs: 12}}>
                <Typography variant="subtitle2" color="text.secondary">
                  Consensus Public Key
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                    fontSize: "0.875rem",
                  }}
                >
                  {validator.config?.consensus_pubkey || "-"}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Link to Account */}
      <Box sx={{mt: 4}}>
        <Link
          to="/account/$address"
          params={{address}}
          style={{textDecoration: "none"}}
        >
          <Typography color="primary">View Account Details →</Typography>
        </Link>
      </Box>
    </Box>
  );
}
