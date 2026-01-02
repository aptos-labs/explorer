import React from "react";
import {createFileRoute} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Chip,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {Link} from "@tanstack/react-router";
import {useGlobalState} from "../context/global-state";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import {truncateAddress, octaToApt, formatNumber} from "../utils";

export const Route = createFileRoute("/validators")({
  head: () => ({
    meta: [
      {title: "Validators | Aptos Explorer"},
      {
        name: "description",
        content: "View active validators on the Aptos blockchain.",
      },
      {property: "og:title", content: "Validators | Aptos Explorer"},
      {
        property: "og:description",
        content: "View active validators on the Aptos blockchain.",
      },
      {property: "og:url", content: `${BASE_URL}/validators`},
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {name: "twitter:title", content: "Validators | Aptos Explorer"},
      {
        name: "twitter:description",
        content: "View active validators on the Aptos blockchain.",
      },
    ],
    links: [{rel: "canonical", href: `${BASE_URL}/validators`}],
  }),
  component: ValidatorsPage,
});

interface ValidatorInfo {
  addr: string;
  voting_power: string;
  config: {
    consensus_pubkey: string;
    validator_index: string;
  };
}

interface ValidatorSet {
  active_validators: ValidatorInfo[];
  pending_active: ValidatorInfo[];
  pending_inactive: ValidatorInfo[];
  total_voting_power: string;
  total_joining_power: string;
}

function ValidatorsPage() {
  const {sdk_v2_client} = useGlobalState();

  const {data: validatorSet, isLoading} = useQuery({
    queryKey: ["validators"],
    queryFn: async () => {
      const response = await sdk_v2_client.getAccountResource({
        accountAddress: "0x1",
        resourceType: "0x1::stake::ValidatorSet",
      });
      return response as unknown as ValidatorSet;
    },
    staleTime: 30000, // 30 seconds
  });

  const activeValidators = validatorSet?.active_validators || [];
  const totalVotingPower = validatorSet?.total_voting_power
    ? Number(validatorSet.total_voting_power)
    : 0;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{mb: 4}}>
        Validators
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{mb: 4}}>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Active Validators
              </Typography>
              <Typography variant="h5">
                {isLoading ? <Skeleton width={60} /> : activeValidators.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Voting Power
              </Typography>
              <Typography variant="h5">
                {isLoading ? (
                  <Skeleton width={120} />
                ) : (
                  `${formatNumber(Math.round(octaToApt(totalVotingPower)))} APT`
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Pending Active
              </Typography>
              <Typography variant="h5">
                {isLoading ? (
                  <Skeleton width={40} />
                ) : (
                  validatorSet?.pending_active?.length || 0
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Pending Inactive
              </Typography>
              <Typography variant="h5">
                {isLoading ? (
                  <Skeleton width={40} />
                ) : (
                  validatorSet?.pending_inactive?.length || 0
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Validators Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Voting Power</TableCell>
              <TableCell>% of Total</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({length: 10}).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton width={30} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={150} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={120} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={60} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={80} />
                  </TableCell>
                </TableRow>
              ))
            ) : activeValidators.length > 0 ? (
              activeValidators
                .sort((a, b) => Number(b.voting_power) - Number(a.voting_power))
                .map((validator, index) => {
                  const votingPower = Number(validator.voting_power);
                  const percentage =
                    totalVotingPower > 0
                      ? ((votingPower / totalVotingPower) * 100).toFixed(2)
                      : "0.00";

                  return (
                    <TableRow key={validator.addr} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Link
                          to="/validator/$address"
                          params={{address: validator.addr}}
                          style={{textDecoration: "none"}}
                        >
                          {truncateAddress(validator.addr, 8)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {formatNumber(Math.round(octaToApt(votingPower)))} APT
                      </TableCell>
                      <TableCell>{percentage}%</TableCell>
                      <TableCell>
                        <Chip label="Active" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                  );
                })
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No validators found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
