import React from "react";
import {createFileRoute} from "@tanstack/react-router";
import {useSuspenseQuery} from "@tanstack/react-query";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
} from "@mui/material";
import {Link} from "@tanstack/react-router";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import {truncateAddress, formatNumber, formatTimestampLocal} from "../utils";
import {blockQueryOptions} from "../api/queries";
import {getClientFromSearch} from "../api/createClient";
import {PagePending} from "../components/NavigationPending";

export const Route = createFileRoute("/block/$height")({
  head: ({params}) => ({
    meta: [
      {title: `Block ${params.height} | Aptos Explorer`},
      {
        name: "description",
        content: `View block ${params.height} details on the Aptos blockchain.`,
      },
      {
        property: "og:title",
        content: `Block ${params.height} | Aptos Explorer`,
      },
      {
        property: "og:description",
        content: `View block ${params.height} details on the Aptos blockchain.`,
      },
      {property: "og:url", content: `${BASE_URL}/block/${params.height}`},
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {
        name: "twitter:title",
        content: `Block ${params.height} | Aptos Explorer`,
      },
      {
        name: "twitter:description",
        content: `View block ${params.height} details on the Aptos blockchain.`,
      },
    ],
    links: [{rel: "canonical", href: `${BASE_URL}/block/${params.height}`}],
  }),
  // Loader prefetches block data
  loader: async ({context, params, location}) => {
    const search = location.search as Record<string, string | undefined>;
    const client = getClientFromSearch(search);

    // Prefetch block data
    await context.queryClient.ensureQueryData(
      blockQueryOptions(params.height, client),
    );

    return {};
  },
  pendingComponent: PagePending,
  errorComponent: ({error}) => (
    <Box>
      <Alert severity="error" sx={{mb: 2}}>
        Error loading block: {String(error)}
      </Alert>
    </Box>
  ),
  component: BlockPage,
});

function BlockPage() {
  const {height} = Route.useParams();
  const search = Route.useSearch() as Record<string, string | undefined>;
  const client = getClientFromSearch(search);

  // Data is already loaded by the loader
  const {data: block} = useSuspenseQuery(blockQueryOptions(height, client));

  // Type assertion for block_metadata - SDK types are incomplete
  const blockData = block as {
    block_height?: string;
    first_version?: string;
    last_version?: string;
    block_metadata?: {
      epoch?: string;
      round?: string;
      proposer?: string;
      timestamp?: string;
    };
    transactions?: Array<{
      version: string;
      type: string;
      success: boolean;
      gas_used: string;
    }>;
  };

  const metadata = blockData?.block_metadata;
  const transactions = blockData?.transactions || [];

  return (
    <Box>
      {/* Block Header */}
      <Box sx={{mb: 4}}>
        <Typography variant="h4" gutterBottom>
          Block #{formatNumber(Number(height))}
        </Typography>
      </Box>

      {/* Block Info Cards */}
      <Grid container spacing={3} sx={{mb: 4}}>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Block Height
              </Typography>
              <Typography variant="h6">
                {formatNumber(Number(height))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Epoch
              </Typography>
              <Typography variant="h6">{metadata?.epoch || "-"}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Round
              </Typography>
              <Typography variant="h6">{metadata?.round || "-"}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Transactions
              </Typography>
              <Typography variant="h6">{transactions.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Block Details */}
      <Card sx={{mb: 4}}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{xs: 12, md: 6}}>
              <Typography variant="subtitle2" color="text.secondary">
                Proposer
              </Typography>
              {metadata?.proposer ? (
                <Link
                  to="/account/$address"
                  params={{address: metadata.proposer}}
                  style={{textDecoration: "none"}}
                >
                  <Typography sx={{fontFamily: "monospace"}}>
                    {truncateAddress(metadata.proposer)}
                  </Typography>
                </Link>
              ) : (
                "-"
              )}
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
              <Typography variant="subtitle2" color="text.secondary">
                Timestamp
              </Typography>
              <Typography>
                {metadata?.timestamp
                  ? formatTimestampLocal(metadata.timestamp)
                  : "-"}
              </Typography>
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
              <Typography variant="subtitle2" color="text.secondary">
                First Version
              </Typography>
              <Link
                to="/txn/$txnHashOrVersion"
                params={{txnHashOrVersion: blockData?.first_version || ""}}
                style={{textDecoration: "none"}}
              >
                <Typography sx={{fontFamily: "monospace"}}>
                  {blockData?.first_version}
                </Typography>
              </Link>
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
              <Typography variant="subtitle2" color="text.secondary">
                Last Version
              </Typography>
              <Link
                to="/txn/$txnHashOrVersion"
                params={{txnHashOrVersion: blockData?.last_version || ""}}
                style={{textDecoration: "none"}}
              >
                <Typography sx={{fontFamily: "monospace"}}>
                  {blockData?.last_version}
                </Typography>
              </Link>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Typography variant="h6" gutterBottom>
        Transactions in Block
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Version</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Gas Used</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <TableRow key={tx.version} hover>
                  <TableCell>
                    <Link
                      to="/txn/$txnHashOrVersion"
                      params={{txnHashOrVersion: tx.version}}
                      style={{textDecoration: "none"}}
                    >
                      {tx.version}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tx.type.replace("_transaction", "")}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tx.success ? "Success" : "Failed"}
                      color={tx.success ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatNumber(Number(tx.gas_used))}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No transactions in this block
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
