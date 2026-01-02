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
  Divider,
  Alert,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import {Link} from "@tanstack/react-router";
import {useGlobalState} from "../context/global-state";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import {
  truncateAddress,
  octaToApt,
  formatNumber,
  formatTimestampLocal,
} from "../utils";
import {getTransaction} from "../api/client";

export const Route = createFileRoute("/txn/$txnHashOrVersion")({
  head: ({params}) => ({
    meta: [
      {
        title: `Transaction ${truncateAddress(params.txnHashOrVersion)} | Aptos Explorer`,
      },
      {
        name: "description",
        content: `View transaction details for ${params.txnHashOrVersion} on the Aptos blockchain.`,
      },
      {
        property: "og:title",
        content: `Transaction ${truncateAddress(params.txnHashOrVersion)} | Aptos Explorer`,
      },
      {
        property: "og:description",
        content: `View transaction details for ${params.txnHashOrVersion} on the Aptos blockchain.`,
      },
      {
        property: "og:url",
        content: `${BASE_URL}/txn/${params.txnHashOrVersion}`,
      },
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {
        name: "twitter:title",
        content: `Transaction ${truncateAddress(params.txnHashOrVersion)} | Aptos Explorer`,
      },
      {
        name: "twitter:description",
        content: `View transaction details for ${params.txnHashOrVersion} on the Aptos blockchain.`,
      },
    ],
    links: [
      {
        rel: "canonical",
        href: `${BASE_URL}/txn/${params.txnHashOrVersion}`,
      },
    ],
  }),
  component: TransactionPage,
});

function TransactionPage() {
  const {txnHashOrVersion} = Route.useParams();
  const {sdk_v2_client, network_name} = useGlobalState();
  const [activeTab, setActiveTab] = React.useState(0);

  const {
    data: transaction,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["transaction", txnHashOrVersion, network_name],
    queryFn: () => getTransaction(txnHashOrVersion, sdk_v2_client),
    staleTime: 60 * 60 * 1000, // 1 hour - transactions are immutable
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{mb: 2}}>
          Error loading transaction: {String(error)}
        </Alert>
        <Typography variant="body2">
          Transaction hash or version: {txnHashOrVersion}
        </Typography>
      </Box>
    );
  }

  const isUserTransaction = transaction?.type === "user_transaction";
  const sender =
    isUserTransaction && "sender" in transaction ? transaction.sender : null;
  const gasUsed = transaction?.gas_used ? Number(transaction.gas_used) : 0;
  const gasUnitPrice =
    isUserTransaction && "gas_unit_price" in transaction
      ? Number(transaction.gas_unit_price)
      : 0;
  const totalGasFee = octaToApt(gasUsed * gasUnitPrice);

  return (
    <Box>
      {/* Transaction Header */}
      <Box sx={{mb: 4}}>
        <Box sx={{display: "flex", alignItems: "center", gap: 2, mb: 1}}>
          <Typography variant="h4">Transaction</Typography>
          {transaction && (
            <Chip
              label={transaction.success ? "Success" : "Failed"}
              color={transaction.success ? "success" : "error"}
              size="small"
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
          {isLoading ? <Skeleton width={400} /> : transaction?.hash}
        </Typography>
      </Box>

      {/* Transaction Info Cards */}
      <Grid container spacing={3} sx={{mb: 4}}>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Version
              </Typography>
              <Typography variant="h6">
                {isLoading ? <Skeleton width={80} /> : transaction?.version}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Type
              </Typography>
              <Typography variant="h6">
                {isLoading ? (
                  <Skeleton width={100} />
                ) : (
                  <Chip
                    label={transaction?.type.replace("_transaction", "")}
                    variant="outlined"
                    size="small"
                  />
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Gas Used
              </Typography>
              <Typography variant="h6">
                {isLoading ? <Skeleton width={80} /> : formatNumber(gasUsed)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Gas Fee
              </Typography>
              <Typography variant="h6">
                {isLoading ? (
                  <Skeleton width={100} />
                ) : (
                  `${totalGasFee.toFixed(8)} APT`
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sender Info */}
      {sender && (
        <Card sx={{mb: 4}}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Sender
            </Typography>
            <Link
              to="/account/$address"
              params={{address: sender}}
              style={{textDecoration: "none"}}
            >
              <Typography variant="body1" sx={{fontFamily: "monospace"}}>
                {sender}
              </Typography>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Box sx={{borderBottom: 1, borderColor: "divider", mb: 3}}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Payload" />
          <Tab label="Events" />
          <Tab label="Changes" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <OverviewTab transaction={transaction} isLoading={isLoading} />
      )}
      {activeTab === 1 && (
        <PayloadTab transaction={transaction} isLoading={isLoading} />
      )}
      {activeTab === 2 && (
        <EventsTab transaction={transaction} isLoading={isLoading} />
      )}
      {activeTab === 3 && (
        <ChangesTab transaction={transaction} isLoading={isLoading} />
      )}
    </Box>
  );
}

function OverviewTab({
  transaction,
  isLoading,
}: {
  transaction: unknown;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Paper sx={{p: 3}}>
        <Skeleton height={200} />
      </Paper>
    );
  }

  const tx = transaction as {
    version?: string;
    hash?: string;
    state_change_hash?: string;
    event_root_hash?: string;
    accumulator_root_hash?: string;
    timestamp?: string;
    expiration_timestamp_secs?: string;
    sequence_number?: string;
    max_gas_amount?: string;
    gas_unit_price?: string;
  };

  return (
    <Paper sx={{p: 3}}>
      <Grid container spacing={2}>
        <Grid size={{xs: 12}}>
          <Typography variant="subtitle2" color="text.secondary">
            Transaction Hash
          </Typography>
          <Typography sx={{fontFamily: "monospace", wordBreak: "break-all"}}>
            {tx?.hash || "-"}
          </Typography>
        </Grid>
        <Grid size={{xs: 12}}>
          <Divider />
        </Grid>
        <Grid size={{xs: 12, md: 6}}>
          <Typography variant="subtitle2" color="text.secondary">
            State Change Hash
          </Typography>
          <Typography sx={{fontFamily: "monospace", wordBreak: "break-all"}}>
            {tx?.state_change_hash || "-"}
          </Typography>
        </Grid>
        <Grid size={{xs: 12, md: 6}}>
          <Typography variant="subtitle2" color="text.secondary">
            Event Root Hash
          </Typography>
          <Typography sx={{fontFamily: "monospace", wordBreak: "break-all"}}>
            {tx?.event_root_hash || "-"}
          </Typography>
        </Grid>
        <Grid size={{xs: 12}}>
          <Divider />
        </Grid>
        <Grid size={{xs: 12, md: 6}}>
          <Typography variant="subtitle2" color="text.secondary">
            Timestamp
          </Typography>
          <Typography>
            {tx?.timestamp ? formatTimestampLocal(tx.timestamp) : "-"}
          </Typography>
        </Grid>
        <Grid size={{xs: 12, md: 6}}>
          <Typography variant="subtitle2" color="text.secondary">
            Expiration
          </Typography>
          <Typography>
            {tx?.expiration_timestamp_secs
              ? formatTimestampLocal(
                  Number(tx.expiration_timestamp_secs) * 1000,
                )
              : "-"}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}

function PayloadTab({
  transaction,
  isLoading,
}: {
  transaction: unknown;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Paper sx={{p: 3}}>
        <Skeleton height={200} />
      </Paper>
    );
  }

  const tx = transaction as {payload?: object};
  const payload = tx?.payload;

  return (
    <Paper sx={{p: 3}}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Payload
      </Typography>
      <Box
        component="pre"
        sx={{
          p: 2,
          backgroundColor: "background.default",
          borderRadius: 1,
          overflow: "auto",
          fontFamily: "monospace",
          fontSize: "0.875rem",
        }}
      >
        {payload ? JSON.stringify(payload, null, 2) : "No payload"}
      </Box>
    </Paper>
  );
}

function EventsTab({
  transaction,
  isLoading,
}: {
  transaction: unknown;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Paper sx={{p: 3}}>
        <Skeleton height={200} />
      </Paper>
    );
  }

  const tx = transaction as {events?: {type: string; data: object}[]};
  const events = tx?.events || [];

  return (
    <Paper sx={{p: 3}}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Events ({events.length})
      </Typography>
      {events.length > 0 ? (
        events.map((event, index) => (
          <Box key={index} sx={{mb: 2}}>
            <Typography variant="body2" sx={{fontWeight: 600}}>
              {event.type}
            </Typography>
            <Box
              component="pre"
              sx={{
                p: 1,
                backgroundColor: "background.default",
                borderRadius: 1,
                overflow: "auto",
                fontFamily: "monospace",
                fontSize: "0.75rem",
              }}
            >
              {JSON.stringify(event.data, null, 2)}
            </Box>
          </Box>
        ))
      ) : (
        <Typography color="text.secondary">No events</Typography>
      )}
    </Paper>
  );
}

function ChangesTab({
  transaction,
  isLoading,
}: {
  transaction: unknown;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Paper sx={{p: 3}}>
        <Skeleton height={200} />
      </Paper>
    );
  }

  const tx = transaction as {changes?: {type: string; address?: string}[]};
  const changes = tx?.changes || [];

  return (
    <Paper sx={{p: 3}}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        State Changes ({changes.length})
      </Typography>
      {changes.length > 0 ? (
        changes.map((change, index) => (
          <Box key={index} sx={{mb: 2}}>
            <Chip label={change.type} size="small" sx={{mr: 1}} />
            {change.address && (
              <Link
                to="/account/$address"
                params={{address: change.address}}
                style={{textDecoration: "none"}}
              >
                <Typography
                  component="span"
                  variant="body2"
                  sx={{fontFamily: "monospace"}}
                >
                  {truncateAddress(change.address)}
                </Typography>
              </Link>
            )}
          </Box>
        ))
      ) : (
        <Typography color="text.secondary">No state changes</Typography>
      )}
    </Paper>
  );
}
