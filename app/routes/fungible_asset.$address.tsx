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
  Avatar,
} from "@mui/material";
import {Link} from "@tanstack/react-router";
import {useGlobalState} from "../context/global-state";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import {truncateAddress, formatNumber} from "../utils";
import {executeGraphqlQuery, GET_FUNGIBLE_ASSET_METADATA} from "../api/graphql";

export const Route = createFileRoute("/fungible_asset/$address")({
  head: ({params}) => ({
    meta: [
      {
        title: `Fungible Asset ${truncateAddress(params.address)} | Aptos Explorer`,
      },
      {
        name: "description",
        content: `View fungible asset details for ${params.address} on the Aptos blockchain.`,
      },
      {
        property: "og:title",
        content: `Fungible Asset ${truncateAddress(params.address)} | Aptos Explorer`,
      },
      {
        property: "og:description",
        content: `View fungible asset details for ${params.address} on the Aptos blockchain.`,
      },
      {
        property: "og:url",
        content: `${BASE_URL}/fungible_asset/${params.address}`,
      },
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {
        name: "twitter:title",
        content: `Fungible Asset ${truncateAddress(params.address)} | Aptos Explorer`,
      },
      {
        name: "twitter:description",
        content: `View fungible asset details for ${params.address} on the Aptos blockchain.`,
      },
    ],
    links: [
      {rel: "canonical", href: `${BASE_URL}/fungible_asset/${params.address}`},
    ],
  }),
  component: FungibleAssetPage,
});

interface FAMetadata {
  asset_type: string;
  name: string;
  symbol: string;
  decimals: number;
  icon_uri: string;
  project_uri: string;
  creator_address: string;
}

function FungibleAssetPage() {
  const {address} = Route.useParams();
  const {network_name} = useGlobalState();
  const [activeTab, setActiveTab] = React.useState(0);

  // Fetch FA metadata
  const {data: metadata, isLoading} = useQuery({
    queryKey: ["faMetadata", address, network_name],
    queryFn: async () => {
      try {
        const result = await executeGraphqlQuery<{
          fungible_asset_metadata: FAMetadata[];
        }>(network_name, GET_FUNGIBLE_ASSET_METADATA, {
          assetType: address,
        });
        return result.fungible_asset_metadata[0] || null;
      } catch {
        return null;
      }
    },
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      {/* FA Header */}
      <Box sx={{mb: 4, display: "flex", alignItems: "center", gap: 2}}>
        {metadata?.icon_uri && (
          <Avatar
            src={metadata.icon_uri}
            alt={metadata.name}
            sx={{width: 48, height: 48}}
          />
        )}
        <Box>
          <Typography variant="h4">
            {isLoading ? (
              <Skeleton width={200} />
            ) : metadata?.name ? (
              `${metadata.name} (${metadata.symbol})`
            ) : (
              "Fungible Asset"
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
            {address}
          </Typography>
        </Box>
      </Box>

      {/* FA Stats */}
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
                  metadata?.name || "Unknown"
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
                  metadata?.symbol || "Unknown"
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
                  (metadata?.decimals ?? "-")
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Creator
              </Typography>
              {isLoading ? (
                <Skeleton width={120} />
              ) : metadata?.creator_address ? (
                <Link
                  to="/account/$address"
                  params={{address: metadata.creator_address}}
                  style={{textDecoration: "none"}}
                >
                  <Typography sx={{fontFamily: "monospace"}}>
                    {truncateAddress(metadata.creator_address)}
                  </Typography>
                </Link>
              ) : (
                <Typography>-</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Links */}
      {metadata?.project_uri && (
        <Card sx={{mb: 4}}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Project URL
            </Typography>
            <a
              href={metadata.project_uri}
              target="_blank"
              rel="noopener noreferrer"
            >
              {metadata.project_uri}
            </a>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Box sx={{borderBottom: 1, borderColor: "divider", mb: 3}}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Holders" />
          <Tab label="Transactions" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && <HoldersTab address={address} />}
      {activeTab === 1 && (
        <Typography color="text.secondary">
          Transaction history coming soon...
        </Typography>
      )}
    </Box>
  );
}

function HoldersTab({address}: {address: string}) {
  // Placeholder for holders - would use GraphQL query
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
          <TableRow>
            <TableCell colSpan={3} align="center">
              Holder data loading...
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
