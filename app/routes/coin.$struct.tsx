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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {Link} from "@tanstack/react-router";
import {useGlobalState} from "../context/global-state";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import {truncateAddress, formatNumber} from "../utils";
import {executeGraphqlQuery, GET_COIN_HOLDERS} from "../api/graphql";

export const Route = createFileRoute("/coin/$struct")({
  head: ({params}) => ({
    meta: [
      {title: `Coin ${params.struct} | Aptos Explorer`},
      {
        name: "description",
        content: `View coin details for ${params.struct} on the Aptos blockchain.`,
      },
      {property: "og:title", content: `Coin ${params.struct} | Aptos Explorer`},
      {
        property: "og:description",
        content: `View coin details for ${params.struct} on the Aptos blockchain.`,
      },
      {property: "og:url", content: `${BASE_URL}/coin/${params.struct}`},
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {
        name: "twitter:title",
        content: `Coin ${params.struct} | Aptos Explorer`,
      },
      {
        name: "twitter:description",
        content: `View coin details for ${params.struct} on the Aptos blockchain.`,
      },
    ],
    links: [{rel: "canonical", href: `${BASE_URL}/coin/${params.struct}`}],
  }),
  component: CoinPage,
});

function CoinPage() {
  const {struct} = Route.useParams();
  const {sdk_v2_client, network_name} = useGlobalState();
  const [activeTab, setActiveTab] = React.useState(0);

  // Decode the struct (it may be URL encoded)
  const decodedStruct = decodeURIComponent(struct);

  // Fetch coin info
  const {data: coinInfo, isLoading} = useQuery({
    queryKey: ["coinInfo", decodedStruct, network_name],
    queryFn: async () => {
      try {
        const response = await sdk_v2_client.view({
          payload: {
            function: "0x1::coin::coin_info",
            typeArguments: [decodedStruct],
            functionArguments: [],
          },
        });
        return response as unknown as {
          name: string;
          symbol: string;
          decimals: number;
          supply: {vec: [string]};
        };
      } catch {
        return null;
      }
    },
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const supply = coinInfo?.supply?.vec?.[0]
    ? Number(coinInfo.supply.vec[0]) / Math.pow(10, coinInfo.decimals || 8)
    : 0;

  return (
    <Box>
      {/* Coin Header */}
      <Box sx={{mb: 4}}>
        <Typography variant="h4" gutterBottom>
          {isLoading ? (
            <Skeleton width={200} />
          ) : coinInfo?.name ? (
            `${coinInfo.name} (${coinInfo.symbol})`
          ) : (
            "Coin"
          )}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            wordBreak: "break-all",
            color: "text.secondary",
          }}
        >
          {decodedStruct}
        </Typography>
      </Box>

      {/* Coin Stats */}
      <Grid container spacing={3} sx={{mb: 4}}>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="h6">
                {isLoading ? (
                  <Skeleton width={100} />
                ) : (
                  coinInfo?.name || "Unknown"
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Symbol
              </Typography>
              <Typography variant="h6">
                {isLoading ? (
                  <Skeleton width={60} />
                ) : (
                  coinInfo?.symbol || "Unknown"
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Decimals
              </Typography>
              <Typography variant="h6">
                {isLoading ? (
                  <Skeleton width={40} />
                ) : (
                  (coinInfo?.decimals ?? "-")
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Supply
              </Typography>
              <Typography variant="h6">
                {isLoading ? (
                  <Skeleton width={120} />
                ) : (
                  formatNumber(supply.toFixed(2))
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{borderBottom: 1, borderColor: "divider", mb: 3}}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Holders" />
          <Tab label="Transactions" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && <HoldersTab coinType={decodedStruct} />}
      {activeTab === 1 && (
        <Typography color="text.secondary">
          Transaction history coming soon...
        </Typography>
      )}
    </Box>
  );
}

function HoldersTab({coinType}: {coinType: string}) {
  const {network_name} = useGlobalState();

  const {data: holders, isLoading} = useQuery({
    queryKey: ["coinHolders", coinType, network_name],
    queryFn: async () => {
      try {
        const result = await executeGraphqlQuery<{
          current_fungible_asset_balances: {
            owner_address: string;
            amount: string;
          }[];
        }>(network_name, GET_COIN_HOLDERS, {
          coinType,
          limit: 50,
          offset: 0,
        });
        return result.current_fungible_asset_balances;
      } catch {
        return [];
      }
    },
  });

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Address</TableCell>
            <TableCell align="right">Balance</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            Array.from({length: 5}).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton width={30} />
                </TableCell>
                <TableCell>
                  <Skeleton width={200} />
                </TableCell>
                <TableCell align="right">
                  <Skeleton width={100} />
                </TableCell>
              </TableRow>
            ))
          ) : holders && holders.length > 0 ? (
            holders.map((holder, index) => (
              <TableRow key={holder.owner_address} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Link
                    to="/account/$address"
                    params={{address: holder.owner_address}}
                    style={{textDecoration: "none"}}
                  >
                    {truncateAddress(holder.owner_address, 12)}
                  </Link>
                </TableCell>
                <TableCell align="right">
                  {formatNumber(holder.amount)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} align="center">
                No holders found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
