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
import {useGlobalState} from "../context/global-state";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import {truncateAddress, formatNumber, formatTimestampLocal} from "../utils";

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
  component: BlockPage,
});

function BlockPage() {
  const {height} = Route.useParams();
  const {sdk_v2_client, network_name} = useGlobalState();

  const {
    data: block,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["block", height, network_name],
    queryFn: () =>
      sdk_v2_client.getBlockByHeight({
        blockHeight: Number(height),
        options: {withTransactions: true},
      }),
  });

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{mb: 2}}>
          Error loading block: {String(error)}
        </Alert>
        <Typography variant="body2">Block height: {height}</Typography>
      </Box>
    );
  }

  const metadata = block?.block_metadata as {
    epoch?: string;
    round?: string;
    proposer?: string;
    timestamp?: string;
  } | null;

  const transactions = block?.transactions || [];

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
                {isLoading ? (
                  <Skeleton width={80} />
                ) : (
                  formatNumber(Number(height))
                )}
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
              <Typography variant="h6">
                {isLoading ? <Skeleton width={60} /> : metadata?.epoch || "-"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Round
              </Typography>
              <Typography variant="h6">
                {isLoading ? <Skeleton width={60} /> : metadata?.round || "-"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Transactions
              </Typography>
              <Typography variant="h6">
                {isLoading ? <Skeleton width={40} /> : transactions.length}
              </Typography>
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
              {isLoading ? (
                <Skeleton width={200} />
              ) : metadata?.proposer ? (
                <Link
                  to="/account/$address"
                  params={{address: metadata.proposer}}
                  style={{textDecoration: "none"}}
                >
                  <Typography sx={{fontFamily: "monospace"}}>
                    {truncateAddress(metadata.proposer, 12)}
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
                {isLoading ? (
                  <Skeleton width={200} />
                ) : metadata?.timestamp ? (
                  formatTimestampLocal(metadata.timestamp)
                ) : (
                  "-"
                )}
              </Typography>
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
              <Typography variant="subtitle2" color="text.secondary">
                First Version
              </Typography>
              {isLoading ? (
                <Skeleton width={100} />
              ) : (
                <Link
                  to="/txn/$txnHashOrVersion"
                  params={{txnHashOrVersion: block?.first_version || ""}}
                  style={{textDecoration: "none"}}
                >
                  <Typography sx={{fontFamily: "monospace"}}>
                    {block?.first_version}
                  </Typography>
                </Link>
              )}
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
              <Typography variant="subtitle2" color="text.secondary">
                Last Version
              </Typography>
              {isLoading ? (
                <Skeleton width={100} />
              ) : (
                <Link
                  to="/txn/$txnHashOrVersion"
                  params={{txnHashOrVersion: block?.last_version || ""}}
                  style={{textDecoration: "none"}}
                >
                  <Typography sx={{fontFamily: "monospace"}}>
                    {block?.last_version}
                  </Typography>
                </Link>
              )}
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
            {isLoading ? (
              Array.from({length: 5}).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton width={80} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={100} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={80} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={60} />
                  </TableCell>
                </TableRow>
              ))
            ) : transactions.length > 0 ? (
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
