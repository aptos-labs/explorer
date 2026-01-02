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
} from "@mui/material";
import {useGlobalState} from "../context/global-state";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import {formatNumber, octaToApt} from "../utils";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      {title: "Analytics | Aptos Explorer"},
      {
        name: "description",
        content:
          "View network analytics and statistics for the Aptos blockchain.",
      },
      {property: "og:title", content: "Analytics | Aptos Explorer"},
      {
        property: "og:description",
        content:
          "View network analytics and statistics for the Aptos blockchain.",
      },
      {property: "og:url", content: `${BASE_URL}/analytics`},
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {name: "twitter:title", content: "Analytics | Aptos Explorer"},
      {
        name: "twitter:description",
        content:
          "View network analytics and statistics for the Aptos blockchain.",
      },
    ],
    links: [{rel: "canonical", href: `${BASE_URL}/analytics`}],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const {sdk_v2_client, network_name} = useGlobalState();

  // Fetch ledger info for total transactions
  const {data: ledgerInfo, isLoading: ledgerLoading} = useQuery({
    queryKey: ["ledgerInfo", network_name],
    queryFn: () => sdk_v2_client.getLedgerInfo(),
    staleTime: 10000,
  });

  // Fetch validator set for staking info
  const {data: validatorSet, isLoading: validatorLoading} = useQuery({
    queryKey: ["validatorSet", network_name],
    queryFn: async () => {
      const response = await sdk_v2_client.getAccountResource({
        accountAddress: "0x1",
        resourceType: "0x1::stake::ValidatorSet",
      });
      return response as {
        active_validators: {voting_power: string}[];
        total_voting_power: string;
      };
    },
    staleTime: 30000,
  });

  // Fetch total supply
  const {data: supplyData, isLoading: supplyLoading} = useQuery({
    queryKey: ["totalSupply", network_name],
    queryFn: async () => {
      const response = await sdk_v2_client.view({
        payload: {
          function: "0x1::coin::supply",
          typeArguments: ["0x1::aptos_coin::AptosCoin"],
          functionArguments: [],
        },
      });
      return response[0] as {vec: [string]};
    },
    staleTime: 60000,
  });

  const totalTransactions = ledgerInfo?.version
    ? Number(ledgerInfo.version)
    : 0;
  const blockHeight = ledgerInfo?.block_height
    ? Number(ledgerInfo.block_height)
    : 0;
  const epoch = ledgerInfo?.epoch ? Number(ledgerInfo.epoch) : 0;

  const totalStake = validatorSet?.total_voting_power
    ? octaToApt(validatorSet.total_voting_power)
    : 0;
  const activeValidators = validatorSet?.active_validators?.length || 0;

  const totalSupply = supplyData?.vec?.[0] ? octaToApt(supplyData.vec[0]) : 0;

  const isLoading = ledgerLoading || validatorLoading || supplyLoading;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{mb: 4}}>
        Network Analytics
      </Typography>

      <Typography variant="h6" gutterBottom sx={{mb: 2}}>
        Network Overview
      </Typography>
      <Grid container spacing={3} sx={{mb: 4}}>
        <Grid size={{xs: 12, sm: 6, md: 4}}>
          <StatCard
            title="Total Transactions"
            value={formatNumber(totalTransactions)}
            loading={isLoading}
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 4}}>
          <StatCard
            title="Block Height"
            value={formatNumber(blockHeight)}
            loading={isLoading}
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 4}}>
          <StatCard
            title="Current Epoch"
            value={formatNumber(epoch)}
            loading={isLoading}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom sx={{mb: 2}}>
        Supply & Staking
      </Typography>
      <Grid container spacing={3} sx={{mb: 4}}>
        <Grid size={{xs: 12, sm: 6, md: 4}}>
          <StatCard
            title="Total Supply"
            value={`${formatNumber(Math.round(totalSupply))} APT`}
            loading={isLoading}
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 4}}>
          <StatCard
            title="Total Staked"
            value={`${formatNumber(Math.round(totalStake))} APT`}
            loading={isLoading}
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 4}}>
          <StatCard
            title="Staking Ratio"
            value={
              totalSupply > 0
                ? `${((totalStake / totalSupply) * 100).toFixed(2)}%`
                : "0%"
            }
            loading={isLoading}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom sx={{mb: 2}}>
        Validators
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{xs: 12, sm: 6, md: 4}}>
          <StatCard
            title="Active Validators"
            value={formatNumber(activeValidators)}
            loading={isLoading}
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 4}}>
          <StatCard
            title="Total Voting Power"
            value={`${formatNumber(Math.round(totalStake))} APT`}
            loading={isLoading}
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 4}}>
          <StatCard
            title="Network"
            value={network_name.charAt(0).toUpperCase() + network_name.slice(1)}
            loading={false}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

function StatCard({
  title,
  value,
  loading,
}: {
  title: string;
  value: string;
  loading: boolean;
}) {
  return (
    <Card sx={{height: "100%"}}>
      <CardContent>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          gutterBottom
          sx={{textTransform: "uppercase", fontSize: "0.75rem"}}
        >
          {title}
        </Typography>
        <Typography variant="h5" sx={{fontWeight: 600}}>
          {loading ? <Skeleton width={120} /> : value}
        </Typography>
      </CardContent>
    </Card>
  );
}
